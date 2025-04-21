/**
 * LoadingAreasManager - Gerenciador de áreas de carregamento
 * 
 * Responsável por criar, modificar e gerenciar as áreas de carregamento
 * na cena 3D do terminal, incluindo baias para caminhões, píeres para
 * navios e barcaças, e plataformas de carregamento.
 */

const LoadingAreasManager = (function() {
    // Variáveis privadas
    let _loadingAreasGroup = null;
    const _loadingAreaMeshes = [];
    
    // Configurações para as áreas de carregamento
    const _loadingAreaConfig = {
        // Tipos de áreas de carregamento
        types: {
            truckBay: {
                name: 'Baia de Caminhões',
                color: new BABYLON.Color3(0.7, 0.5, 0.2),
                size: { width: 5, height: 0.2, depth: 12 }
            },
            railLoading: {
                name: 'Carregamento Ferroviário',
                color: new BABYLON.Color3(0.5, 0.5, 0.6),
                size: { width: 3, height: 0.2, depth: 15 }
            },
            marinePier: {
                name: 'Píer Marítimo',
                color: new BABYLON.Color3(0.3, 0.5, 0.7),
                size: { width: 8, height: 0.5, depth: 20 }
            },
            bargeDock: {
                name: 'Doca de Barcaças',
                color: new BABYLON.Color3(0.4, 0.6, 0.7),
                size: { width: 6, height: 0.3, depth: 15 }
            }
        },
        
        // Estados das áreas de carregamento
        states: {
            available: {
                name: 'Disponível',
                color: new BABYLON.Color3(0.1, 0.7, 0.1)
            },
            loading: {
                name: 'Em Carregamento',
                color: new BABYLON.Color3(0.7, 0.7, 0.1)
            },
            maintenance: {
                name: 'Em Manutenção',
                color: new BABYLON.Color3(0.3, 0.3, 0.7)
            },
            unavailable: {
                name: 'Indisponível',
                color: new BABYLON.Color3(0.7, 0.1, 0.1)
            }
        }
    };
    
    /**
     * Inicializa o gerenciador de áreas de carregamento
     */
    function initialize() {
        _loadingAreasGroup = SceneManager.getGroup('loadingAreas');
        if (!_loadingAreasGroup) {
            console.error("Grupo de áreas de carregamento não encontrado na cena");
            return Promise.reject("Grupo de áreas de carregamento não encontrado");
        }
        return Promise.resolve();
    }
    
    /**
     * Cria as áreas de carregamento na cena
     * @returns {Promise} - Promessa resolvida quando todas as áreas forem criadas
     */
    async function createLoadingAreas() {
        try {
            await initialize();
            
            // Criar áreas de carregamento a partir dos dados (simulados ou reais)
            if (EquipmentData && EquipmentData.loadingAreas) {
                // Usar dados do arquivo equipment.js
                EquipmentData.loadingAreas.forEach(createLoadingAreaFromData);
            } else {
                // Criar áreas de carregamento de demonstração se não houver dados
                createDemoLoadingAreas();
            }
            
            return Promise.resolve();
        } catch (error) {
            console.error("Erro ao criar áreas de carregamento:", error);
            return Promise.reject(error);
        }
    }
    
    /**
     * Cria uma área de carregamento a partir de dados
     * @param {Object} areaData - Dados da área de carregamento
     */
    function createLoadingAreaFromData(areaData) {
        // Determinar o tipo de área
        const areaType = areaData.type || 'truckBay';
        const typeConfig = _loadingAreaConfig.types[areaType] || _loadingAreaConfig.types.truckBay;
        
        // Determinar estado inicial
        const state = areaData.state || 'available';
        const stateConfig = _loadingAreaConfig.states[state] || _loadingAreaConfig.states.available;
        
        // Criar o nó principal para esta área
        const areaNode = new BABYLON.TransformNode(areaData.id, SceneManager.scene);
        areaNode.parent = _loadingAreasGroup;
        
        // Posicionar a área
        const position = areaData.position instanceof BABYLON.Vector3 
            ? areaData.position 
            : new BABYLON.Vector3(areaData.position.x, areaData.position.y, areaData.position.z);
        
        areaNode.position = position;
        
        // Aplicar rotação se especificada
        if (areaData.rotation) {
            areaNode.rotation = new BABYLON.Vector3(
                areaData.rotation.x || 0,
                areaData.rotation.y || 0,
                areaData.rotation.z || 0
            );
        }
        
        // Criar a plataforma base
        const platform = _createPlatform(areaData.id, areaType, typeConfig);
        platform.parent = areaNode;
        
        // Adicionar elementos específicos por tipo
        let specificElements;
        
        switch (areaType) {
            case 'truckBay':
                specificElements = _createTruckBayElements(areaData.id, typeConfig);
                break;
            case 'railLoading':
                specificElements = _createRailLoadingElements(areaData.id, typeConfig);
                break;
            case 'marinePier':
                specificElements = _createMarinePierElements(areaData.id, typeConfig);
                break;
            case 'bargeDock':
                specificElements = _createBargeDockElements(areaData.id, typeConfig);
                break;
            default:
                specificElements = new BABYLON.TransformNode(`${areaData.id}_elements`, SceneManager.scene);
        }
        
        specificElements.parent = areaNode;
        
        // Adicionar indicador de estado
        const stateIndicator = _createStateIndicator(areaData.id, state, stateConfig);
        stateIndicator.parent = areaNode;
        stateIndicator.position.y = 0.5; // Acima da plataforma
        
        // Adicionar braços de carregamento
        const loadingArms = _createLoadingArms(areaData.id, areaType, areaData.loadingArms || 1);
        loadingArms.parent = areaNode;
        
        // Configurar metadados para interação
        areaNode.metadata = {
            id: areaData.id,
            type: 'loadingArea',
            areaType: areaType,
            state: state,
            data: areaData,
            components: {
                platform: platform,
                specificElements: specificElements,
                stateIndicator: stateIndicator,
                loadingArms: loadingArms
            }
        };
        
        // Adicionar à lista de áreas de carregamento
        _loadingAreaMeshes.push(areaNode);
        
        return areaNode;
    }
    
    /**
     * Cria áreas de carregamento de demonstração quando não há dados disponíveis
     */
    function createDemoLoadingAreas() {
        console.log("Criando áreas de carregamento de demonstração");
        
        // Baias de caminhões
        const truckBays = [
            {
                id: 'TRUCK-BAY-01',
                type: 'truckBay',
                position: new BABYLON.Vector3(-20, 0, 15),
                rotation: { y: Math.PI / 4 },
                state: 'available',
                loadingArms: 2
            },
            {
                id: 'TRUCK-BAY-02',
                type: 'truckBay',
                position: new BABYLON.Vector3(-10, 0, 15),
                rotation: { y: Math.PI / 4 },
                state: 'loading',
                loadingArms: 2
            },
            {
                id: 'TRUCK-BAY-03',
                type: 'truckBay',
                position: new BABYLON.Vector3(0, 0, 15),
                rotation: { y: Math.PI / 4 },
                state: 'maintenance',
                loadingArms: 2
            }
        ];
        // Carregamento ferroviário
        const railLoading = [
            {
                id: 'RAIL-LOAD-01',
                type: 'railLoading',
                position: new BABYLON.Vector3(20, 0, -15),
                rotation: { y: Math.PI / 2 },
                state: 'available',
                loadingArms: 3
            }
        ];
        
        // Píer marítimo
        const marinePier = [
            {
                id: 'MARINE-PIER-01',
                type: 'marinePier',
                position: new BABYLON.Vector3(-25, 0, -20),
                state: 'loading',
                loadingArms: 4
            }
        ];
        
        // Doca de barcaças
        const bargeDock = [
            {
                id: 'BARGE-DOCK-01',
                type: 'bargeDock',
                position: new BABYLON.Vector3(25, 0, -20),
                rotation: { y: Math.PI / 6 },
                state: 'available',
                loadingArms: 2
            }
        ];
        
        // Criar todas as áreas
        truckBays.forEach(createLoadingAreaFromData);
        railLoading.forEach(createLoadingAreaFromData);
        marinePier.forEach(createLoadingAreaFromData);
        bargeDock.forEach(createLoadingAreaFromData);
    }
    
    /**
     * Cria a plataforma base para uma área de carregamento
     * @param {string} id - ID da área
     * @param {string} type - Tipo de área
     * @param {Object} config - Configuração do tipo de área
     * @returns {BABYLON.Mesh} - Mesh da plataforma
     */
    function _createPlatform(id, type, config) {
        const scene = SceneManager.scene;
        
        // Criar plataforma base
        const platform = BABYLON.MeshBuilder.CreateBox(
            `${id}_platform`,
            {
                width: config.size.width,
                height: config.size.height,
                depth: config.size.depth
            },
            scene
        );
        
        // Posicionar a plataforma com o topo no nível do solo
        platform.position.y = config.size.height / 2;
        
        // Material para a plataforma
        const platformMaterial = new BABYLON.PBRMaterial(`${id}_platformMat`, scene);
        platformMaterial.albedoColor = config.color;
        platformMaterial.metallic = 0.3;
        platformMaterial.roughness = 0.7;
        
        platform.material = platformMaterial;
        platform.receiveShadows = true;
        platform.isPickable = true;
        
        return platform;
    }
    
    /**
     * Cria elementos específicos para baia de caminhões
     * @param {string} id - ID da área
     * @param {Object} config - Configuração do tipo de área
     * @returns {BABYLON.TransformNode} - Nó com os elementos específicos
     */
    function _createTruckBayElements(id, config) {
        const scene = SceneManager.scene;
        const elements = new BABYLON.TransformNode(`${id}_elements`, scene);
        
        // Dimensões da plataforma
        const width = config.size.width;
        const depth = config.size.depth;
        
        // Material para os elementos
        const elementsMaterial = new BABYLON.StandardMaterial(`${id}_elementsMat`, scene);
        elementsMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // Guias laterais
        const leftGuide = BABYLON.MeshBuilder.CreateBox(
            `${id}_leftGuide`,
            { width: 0.3, height: 1, depth: depth },
            scene
        );
        leftGuide.parent = elements;
        leftGuide.position.x = width / 2 - 0.15;
        leftGuide.position.y = 0.5;
        leftGuide.material = elementsMaterial;
        
        const rightGuide = BABYLON.MeshBuilder.CreateBox(
            `${id}_rightGuide`,
            { width: 0.3, height: 1, depth: depth },
            scene
        );
        rightGuide.parent = elements;
        rightGuide.position.x = -width / 2 + 0.15;
        rightGuide.position.y = 0.5;
        rightGuide.material = elementsMaterial;
        
        // Balizadores
        for (let i = 0; i < 4; i++) {
            const position = (i % 2 === 0) ? width / 2 : -width / 2;
            const zPos = (i < 2) ? depth / 3 : -depth / 3;
            
            const bollard = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_bollard_${i}`,
                { height: 1.2, diameter: 0.4, tessellation: 12 },
                scene
            );
            bollard.parent = elements;
            bollard.position.x = position;
            bollard.position.z = zPos;
            bollard.position.y = 0.6;
            
            // Material zebrado para os balizadores
            const bollardMaterial = new BABYLON.StandardMaterial(`${id}_bollardMat_${i}`, scene);
            bollardMaterial.diffuseColor = (i % 2 === 0) 
                ? new BABYLON.Color3(0.9, 0.1, 0.1)
                : new BABYLON.Color3(0.9, 0.9, 0.1);
            
            bollard.material = bollardMaterial;
        }
        
        // Área de contenção de derramamentos (borda elevada)
        const containment = BABYLON.MeshBuilder.CreateBox(
            `${id}_containment`,
            { 
                width: width + 0.4, 
                height: 0.1, 
                depth: depth + 0.4,
                faceUV: [
                    new BABYLON.Vector4(0, 0, 1, 1), // back
                    new BABYLON.Vector4(0, 0, 1, 1), // front
                    new BABYLON.Vector4(0, 0, 1, 0.1), // right
                    new BABYLON.Vector4(0, 0, 1, 0.1), // left
                    new BABYLON.Vector4(0, 0, 1, 1), // top
                    new BABYLON.Vector4(0, 0, 1, 1)  // bottom
                ],
                wrap: true
            },
            scene
        );
        
        containment.parent = elements;
        containment.position.y = -0.05; // Ligeiramente abaixo da plataforma
        
        // Material para a área de contenção
        const containmentMaterial = new BABYLON.StandardMaterial(`${id}_containmentMat`, scene);
        containmentMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        containment.material = containmentMaterial;
        
        return elements;
    }
    
    /**
     * Cria elementos específicos para carregamento ferroviário
     * @param {string} id - ID da área
     * @param {Object} config - Configuração do tipo de área
     * @returns {BABYLON.TransformNode} - Nó com os elementos específicos
     */
    function _createRailLoadingElements(id, config) {
        const scene = SceneManager.scene;
        const elements = new BABYLON.TransformNode(`${id}_elements`, scene);
        
        // Dimensões da plataforma
        const width = config.size.width;
        const depth = config.size.depth;
        
        // Material para os elementos
        const elementsMaterial = new BABYLON.StandardMaterial(`${id}_elementsMat`, scene);
        elementsMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // Trilhos
        const railSpacing = 1.5; // Distância entre trilhos
        
        for (let i = 0; i < 2; i++) {
            const railPos = (i === 0) ? -railSpacing/2 : railSpacing/2;
            
            // Trilho (barra longa)
            const rail = BABYLON.MeshBuilder.CreateBox(
                `${id}_rail_${i}`,
                { width: 0.2, height: 0.1, depth: depth * 1.5 },
                scene
            );
            rail.parent = elements;
            rail.position.x = railPos;
            rail.position.y = 0.05;
            
            // Material para trilhos
            const railMaterial = new BABYLON.StandardMaterial(`${id}_railMat`, scene);
            railMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            railMaterial.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
            rail.material = railMaterial;
            
            // Dormentes (travessas)
            for (let j = 0; j < 15; j++) {
                const tiePos = (j - 7) * (depth / 15);
                
                const tie = BABYLON.MeshBuilder.CreateBox(
                    `${id}_tie_${j}`,
                    { width: railSpacing + 0.6, height: 0.1, depth: 0.2 },
                    scene
                );
                tie.parent = elements;
                tie.position.z = tiePos;
                tie.position.y = 0;
                
                // Material para dormentes
                const tieMaterial = new BABYLON.StandardMaterial(`${id}_tieMat`, scene);
                tieMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1); // Marrom escuro
                tie.material = tieMaterial;
            }
        }
        
        // Estrutura de suporte da plataforma
        for (let i = 0; i < 5; i++) {
            const supportPos = (i - 2) * (depth / 4);
            
            const support = BABYLON.MeshBuilder.CreateBox(
                `${id}_support_${i}`,
                { width: width, height: 0.8, depth: 0.3 },
                scene
            );
            support.parent = elements;
            support.position.z = supportPos;
            support.position.y = -0.4;
            support.material = elementsMaterial;
        }
        
        // Escada de acesso
        const stairs = BABYLON.MeshBuilder.CreateBox(
            `${id}_stairs`,
            { width: 1, height: 0.4, depth: 1.5 },
            scene
        );
        stairs.parent = elements;
        stairs.position.x = width / 2 + 0.8;
        stairs.position.y = -0.3;
        stairs.position.z = depth / 4;
        
        const stairsMaterial = new BABYLON.StandardMaterial(`${id}_stairsMat`, scene);
        stairsMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        stairs.material = stairsMaterial;
        
        return elements;
    }
    
    /**
     * Cria elementos específicos para píer marítimo
     * @param {string} id - ID da área
     * @param {Object} config - Configuração do tipo de área
     * @returns {BABYLON.TransformNode} - Nó com os elementos específicos
     */
    function _createMarinePierElements(id, config) {
        const scene = SceneManager.scene;
        const elements = new BABYLON.TransformNode(`${id}_elements`, scene);
        
        // Dimensões da plataforma
        const width = config.size.width;
        const height = config.size.height;
        const depth = config.size.depth;
        
        // Material para os elementos
        const elementsMaterial = new BABYLON.StandardMaterial(`${id}_elementsMat`, scene);
        elementsMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // Pilares de suporte
        const pillarCount = 8;
        const pillarSpacing = depth / (pillarCount - 1);
        
        for (let i = 0; i < pillarCount; i++) {
            for (let j = 0; j < 2; j++) {
                const xPos = (j === 0) ? width/2 - 0.5 : -width/2 + 0.5;
                const zPos = (i * pillarSpacing) - depth/2;
                
                const pillar = BABYLON.MeshBuilder.CreateCylinder(
                    `${id}_pillar_${i}_${j}`,
                    { height: 5, diameter: 0.8, tessellation: 12 },
                    scene
                );
                pillar.parent = elements;
                pillar.position.x = xPos;
                pillar.position.z = zPos;
                pillar.position.y = -2.5 - height/2;
                pillar.material = elementsMaterial;
            }
        }
        
        // Defensas (proteção para o navio)
        for (let i = 0; i < 5; i++) {
            const zPos = (i - 2) * (depth / 4);
            
            const fender = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_fender_${i}`,
                { height: 2, diameter: 1, tessellation: 12 },
                scene
            );
            fender.parent = elements;
            fender.position.x = width/2 + 0.5;
            fender.position.z = zPos;
            fender.position.y = 0;
            fender.rotation.z = Math.PI / 2;
            
            const fenderMaterial = new BABYLON.StandardMaterial(`${id}_fenderMat`, scene);
            fenderMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Borracha preta
            fender.material = fenderMaterial;
        }
        
        // Cabeços de amarração
        for (let i = 0; i < 4; i++) {
            const zPos = (i - 1.5) * (depth / 3);
            
            const bollard = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_bollard_${i}`,
                { height: 1, diameter: 0.8, tessellation: 12 },
                scene
            );
            bollard.parent = elements;
            bollard.position.x = width/2 - 1;
            bollard.position.z = zPos;
            bollard.position.y = 0.5;
            
            // Topo do cabeço
            const bollardTop = BABYLON.MeshBuilder.CreateTorus(
                `${id}_bollardTop_${i}`,
                { diameter: 1, thickness: 0.3, tessellation: 16 },
                scene
            );
            bollardTop.parent = bollard;
            bollardTop.position.y = 0.3;
            
            const bollardMaterial = new BABYLON.StandardMaterial(`${id}_bollardMat`, scene);
            bollardMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
            bollard.material = bollardMaterial;
            bollardTop.material = bollardMaterial;
        }
        
        // Água ao redor do píer
        const waterPlane = BABYLON.MeshBuilder.CreateGround(
            `${id}_water`,
            { width: width * 3, height: depth * 1.5, subdivisions: 2 },
            scene
        );
        waterPlane.parent = elements;
        waterPlane.position.y = -0.6 - height/2;
        waterPlane.position.x = width;
        
        const waterMaterial = new BABYLON.StandardMaterial(`${id}_waterMat`, scene);
        waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5);
        waterMaterial.alpha = 0.7;
        waterPlane.material = waterMaterial;
        
        return elements;
    }
    
    /**
     * Cria elementos específicos para doca de barcaças
     * @param {string} id - ID da área
     * @param {Object} config - Configuração do tipo de área
     * @returns {BABYLON.TransformNode} - Nó com os elementos específicos
     */
    function _createBargeDockElements(id, config) {
        const scene = SceneManager.scene;
        const elements = new BABYLON.TransformNode(`${id}_elements`, scene);
        
        // Dimensões da plataforma
        const width = config.size.width;
        const height = config.size.height;
        const depth = config.size.depth;
        
        // Material para os elementos
        const elementsMaterial = new BABYLON.StandardMaterial(`${id}_elementsMat`, scene);
        elementsMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        
        // Rampa de acesso
        const ramp = BABYLON.MeshBuilder.CreateBox(
            `${id}_ramp`,
            { width: width / 2, height: 0.2, depth: 5 },
            scene
        );
        ramp.parent = elements;
        ramp.position.z = -depth / 2 - 2.5;
        ramp.position.y = -0.5;
        ramp.rotation.x = Math.PI / 12; // Inclinação da rampa
        ramp.material = elementsMaterial;
        
        // Defensas laterais (proteção para as barcaças)
        for (let i = 0; i < 3; i++) {
            const zPos = (i - 1) * (depth / 2);
            
            const fender = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_fender_${i}`,
                { height: 1.5, diameter: 0.6, tessellation: 12 },
                scene
            );
            fender.parent = elements;
            fender.position.x = width/2 + 0.3;
            fender.position.z = zPos;
            fender.position.y = 0.5;
            fender.rotation.z = Math.PI / 2;
            
            const fenderMaterial = new BABYLON.StandardMaterial(`${id}_fenderMat`, scene);
            fenderMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            fender.material = fenderMaterial;
        }
        
        // Estrutura de amarração
        for (let i = 0; i < 2; i++) {
            const zPos = (i === 0) ? depth/3 : -depth/3;
            
            const post = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_post_${i}`,
                { height: 2, diameter: 0.3, tessellation: 8 },
                scene
            );
            post.parent = elements;
            post.position.x = width/2 - 1;
            post.position.z = zPos;
            post.position.y = 1;
            post.material = elementsMaterial;
            
            // Gancho de amarração
            const hook = BABYLON.MeshBuilder.CreateTorus(
                `${id}_hook_${i}`,
                { diameter: 0.5, thickness: 0.1, tessellation: 12 },
                scene
            );
            hook.parent = post;
            hook.position.y = 0.8;
            hook.rotation.x = Math.PI / 2;
            
            const hookMaterial = new BABYLON.StandardMaterial(`${id}_hookMat`, scene);
            hookMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
            hook.material = hookMaterial;
        }
        
        // Água ao redor da doca
        const waterPlane = BABYLON.MeshBuilder.CreateGround(
            `${id}_water`,
            { width: width * 2, height: depth * 1.5, subdivisions: 2 },
            scene
        );
        waterPlane.parent = elements;
        waterPlane.position.y = -0.5 - height/2;
        waterPlane.position.x = width;
        
        const waterMaterial = new BABYLON.StandardMaterial(`${id}_waterMat`, scene);
        waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5);
        waterMaterial.alpha = 0.7;
        waterPlane.material = waterMaterial;
        
        return elements;
    }
    
    /**
     * Cria um indicador de estado para a área de carregamento
     * @param {string} id - ID da área
     * @param {string} state - Estado da área
     * @param {Object} stateConfig - Configuração do estado
     * @returns {BABYLON.Mesh} - Mesh do indicador
     */
    function _createStateIndicator(id, state, stateConfig) {
        const scene = SceneManager.scene;
        
        // Criar um poste com luz indicadora
        const indicatorNode = new BABYLON.TransformNode(`${id}_indicator_node`, scene);
        
        // Poste
        const post = BABYLON.MeshBuilder.CreateCylinder(
            `${id}_indicator_post`,
            { height: 3, diameter: 0.2, tessellation: 8 },
            scene
        );
        post.parent = indicatorNode;
        post.position.y = 1.5;
        
        const postMaterial = new BABYLON.StandardMaterial(`${id}_postMat`, scene);
        postMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        post.material = postMaterial;
        
        // Luz indicadora
        const light = BABYLON.MeshBuilder.CreateSphere(
            `${id}_indicator_light`,
            { diameter: 0.5, segments: 12 },
            scene
        );
        light.parent = indicatorNode;
        light.position.y = 3.2;
        
        // Material emissivo para a luz
        const lightMaterial = new BABYLON.StandardMaterial(`${id}_lightMat`, scene);
        lightMaterial.diffuseColor = stateConfig.color;
        lightMaterial.emissiveColor = stateConfig.color;
        lightMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        
        light.material = lightMaterial;
        
        // Adicionar luz pontual (efeito visual)
        const pointLight = new BABYLON.PointLight(
            `${id}_pointLight`,
            new BABYLON.Vector3(0, 3.2, 0),
            scene
        );
        pointLight.parent = indicatorNode;
        pointLight.intensity = 0.5;
        pointLight.diffuse = stateConfig.color;
        pointLight.specular = stateConfig.color;
        
        // Animação para a luz piscar quando em estados especiais
        if (state === 'loading' || state === 'maintenance' || state === 'fault') {
            const animation = new BABYLON.Animation(
                `${id}_light_anim`,
                "intensity",
                10,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            const keys = [];
            keys.push({ frame: 0, value: 0.5 });
            keys.push({ frame: 15, value: 0.1 });
            keys.push({ frame: 30, value: 0.5 });
            
            animation.setKeys(keys);
            
            pointLight.animations = [animation];
            scene.beginAnimation(pointLight, 0, 30, true);
        }
        
        return indicatorNode;
    }
    
    /**
     * Cria braços de carregamento para a área
     * @param {string} id - ID da área
     * @param {string} areaType - Tipo de área de carregamento
     * @param {number} count - Número de braços de carregamento
     * @returns {BABYLON.TransformNode} - Nó com os braços de carregamento
     */
    function _createLoadingArms(id, areaType, count) {
        const scene = SceneManager.scene;
        const armsNode = new BABYLON.TransformNode(`${id}_arms_node`, scene);
        
        // Material para os braços
        const armMaterial = new BABYLON.StandardMaterial(`${id}_armMat`, scene);
        armMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        // Material para as mangueiras
        const hoseMaterial = new BABYLON.StandardMaterial(`${id}_hoseMat`, scene);
        hoseMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        // Configurações baseadas no tipo de área
        let armLength = 3;
        let armHeight = 4;
        let armSpacing = 2;
        
        switch (areaType) {
            case 'marinePier':
                armLength = 6;
                armHeight = 5;
                armSpacing = 3;
                break;
            case 'bargeDock':
                armLength = 4;
                armHeight = 3;
                armSpacing = 2.5;
                break;
            case 'railLoading':
                armLength = 2.5;
                armHeight = 3.5;
                armSpacing = 3;
                break;
        }
        
        // Criar os braços de carregamento
        for (let i = 0; i < count; i++) {
            const armNode = new BABYLON.TransformNode(`${id}_arm_${i}`, scene);
            armNode.parent = armsNode;
            
            // Posicionar o braço ao longo da plataforma
            const offset = (i - (count - 1) / 2) * armSpacing;
            armNode.position.z = offset;
            
            // Estrutura vertical (poste)
            const verticalPart = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_arm_${i}_vertical`,
                { height: armHeight, diameter: 0.3, tessellation: 8 },
                scene
            );
            verticalPart.parent = armNode;
            verticalPart.position.y = armHeight / 2;
            verticalPart.material = armMaterial;
            
            // Braço horizontal
            const horizontalPart = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_arm_${i}_horizontal`,
                { height: armLength, diameter: 0.25, tessellation: 8 },
                scene
            );
            horizontalPart.parent = armNode;
            horizontalPart.position.y = armHeight - 0.5;
            horizontalPart.position.x = armLength / 2;
            horizontalPart.rotation.z = Math.PI / 2;
            horizontalPart.material = armMaterial;
            
            // Articulação (conexão entre vertical e horizontal)
            const joint = BABYLON.MeshBuilder.CreateSphere(
                `${id}_arm_${i}_joint`,
                { diameter: 0.4, segments: 12 },
                scene
            );
            joint.parent = armNode;
            joint.position.y = armHeight - 0.5;
            joint.material = armMaterial;
            
            // Mangueira pendente
            const hose = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_arm_${i}_hose`,
                { height: 2, diameter: 0.15, tessellation: 8 },
                scene
            );
            hose.parent = armNode;
            hose.position.y = armHeight - 1.5;
            hose.position.x = armLength - 0.5;
            hose.material = hoseMaterial;
            
            // Bico da mangueira
            const nozzle = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_arm_${i}_nozzle`,
                { height: 0.4, diameterTop: 0.2, diameterBottom: 0.1, tessellation: 8 },
                scene
            );
            nozzle.parent = armNode;
            nozzle.position.y = armHeight - 2.7;
            nozzle.position.x = armLength - 0.5;
            nozzle.material = armMaterial;
        }
        
        return armsNode;
    }
    
    /**
     * Altera o estado de uma área de carregamento
     * @param {string} areaId - ID da área
     * @param {string} newState - Novo estado da área
     */
    function changeAreaState(areaId, newState) {
        // Encontrar a área pelo ID
        const areaNode = _loadingAreaMeshes.find(area => area.name === areaId);
        if (!areaNode) return;
        
        // Verificar se o estado é válido
        const stateConfig = _loadingAreaConfig.states[newState];
        if (!stateConfig) return;
        
        // Referências aos componentes da área
        const metadata = areaNode.metadata;
        if (!metadata || !metadata.components) return;
        
        const stateIndicator = metadata.components.stateIndicator;
        
        // Atualizar o indicador de estado
        if (stateIndicator) {
            const light = stateIndicator.getChildMeshes().find(mesh => 
                mesh.name.includes('indicator_light'));
            
            const pointLight = stateIndicator.getChildrenWithName(`${areaId}_pointLight`)[0];
            
            if (light && light.material) {
                light.material.diffuseColor = stateConfig.color;
                light.material.emissiveColor = stateConfig.color;
            }
            
            if (pointLight) {
                pointLight.diffuse = stateConfig.color;
                pointLight.specular = stateConfig.color;
                
                // Remover animações existentes
                scene.stopAnimation(pointLight);
                
                // Adicionar animação para piscar em estados especiais
                if (newState === 'loading' || newState === 'maintenance' || newState === 'fault') {
                    const animation = new BABYLON.Animation(
                        `${areaId}_light_anim`,
                        "intensity",
                        10,
                        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
                    );
                    
                    const keys = [];
                    keys.push({ frame: 0, value: 0.5 });
                    keys.push({ frame: 15, value: 0.1 });
                    keys.push({ frame: 30, value: 0.5 });
                    
                    animation.setKeys(keys);
                    
                    pointLight.animations = [animation];
                    scene.beginAnimation(pointLight, 0, 30, true);
                }
            }
        }
        
        // Atualizar metadados
        metadata.state = newState;
        if (metadata.data) {
            metadata.data.state = newState;
        }
    }
    
    /**
     * Simula operação de carregamento em uma área
     * @param {string} areaId - ID da área
     * @param {boolean} active - Se o carregamento está ativo
     */
    function simulateLoading(areaId, active) {
        // Encontrar a área pelo ID
        const areaNode = _loadingAreaMeshes.find(area => area.name === areaId);
        if (!areaNode) return;
        
        // Referências aos componentes da área
        const metadata = areaNode.metadata;
        if (!metadata || !metadata.components) return;
        
        const loadingArms = metadata.components.loadingArms;
        
        // Animar os braços de carregamento
        if (loadingArms && active) {
            // Encontrar todas as mangueiras
            const hoses = loadingArms.getChildMeshes().filter(mesh => 
                mesh.name.includes('_hose'));
            
            hoses.forEach((hose, index) => {
                // Criar animação de oscilação para simular fluxo de produto
                const animation = new BABYLON.Animation(
                    `${areaId}_hose_${index}_anim`,
                    "rotation.x",
                    10,
                    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
                );
                
                const amplitude = 0.05; // Pequena oscilação
                const phase = index * 0.5; // Fase diferente para cada mangueira
                
                const keys = [];
                keys.push({ frame: 0, value: 0 });
                keys.push({ frame: 15, value: amplitude });
                keys.push({ frame: 30, value: 0 });
                keys.push({ frame: 45, value: -amplitude });
                keys.push({ frame: 60, value: 0 });
                
                animation.setKeys(keys);
                
                hose.animations = [animation];
                SceneManager.scene.beginAnimation(hose, 0, 60, true);
            });
            
            // Atualizar estado para 'loading' se estiver disponível
            if (metadata.state === 'available') {
                changeAreaState(areaId, 'loading');
            }
        } else if (loadingArms) {
            // Parar animações
            const hoses = loadingArms.getChildMeshes().filter(mesh => 
                mesh.name.includes('_hose'));
            
            hoses.forEach(hose => {
                SceneManager.scene.stopAnimation(hose);
            });
            
            // Atualizar estado para 'available' se estiver em carregamento
            if (metadata.state === 'loading') {
                changeAreaState(areaId, 'available');
            }
        }
    }
    
    /**
     * Adiciona uma nova área de carregamento à cena
     * @param {Object} areaData - Dados da nova área
     * @returns {BABYLON.TransformNode} - O nó da área criada
     */
    function addLoadingArea(areaData) {
        return createLoadingAreaFromData(areaData);
    }
    
    /**
     * Remove uma área de carregamento da cena
     * @param {string} areaId - ID da área a ser removida
     */
    function removeLoadingArea(areaId) {
        const areaIndex = _loadingAreaMeshes.findIndex(area => area.name === areaId);
        if (areaIndex === -1) return;
        
        const areaNode = _loadingAreaMeshes[areaIndex];
        
        // Remover todos os filhos
        areaNode.getChildMeshes().forEach(mesh => {
            mesh.dispose();
        });
        
        // Remover o nó principal
        areaNode.dispose();
        
        // Remover da lista
        _loadingAreaMeshes.splice(areaIndex, 1);
    }
    
    /**
     * Obtém todas as áreas de carregamento
     * @returns {Array} - Array de meshes de áreas de carregamento
     */
    function getLoadingAreaMeshes() {
        return _loadingAreaMeshes;
    }
    
    /**
     * Obtém uma área de carregamento específica pelo ID
     * @param {string} id - ID da área
     * @returns {BABYLON.TransformNode} - O nó da área ou null se não encontrado
     */
    function getLoadingAreaById(id) {
        return _loadingAreaMeshes.find(area => area.name === id) || null;
    }
    
    // API pública
    return {
        initialize,
        createLoadingAreas,
        changeAreaState,
        simulateLoading,
        addLoadingArea,
        removeLoadingArea,
        getLoadingAreaMeshes,
        getLoadingAreaById
    };
})();

