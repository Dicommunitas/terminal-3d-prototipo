/**
 * ValvesManager - Gerenciador de válvulas
 * 
 * Responsável por criar, modificar e gerenciar as válvulas
 * na cena 3D do terminal, incluindo diferentes tipos de válvulas
 * e seus estados operacionais.
 */

const ValvesManager = (function() {
    // Variáveis privadas
    let _valvesGroup = null;
    const _valveMeshes = [];
    
    // Configurações para as válvulas
    const _valveConfig = {
        // Tipos de válvulas
        types: {
            gate: {
                name: 'Gaveta',
                size: { width: 0.6, height: 0.6, depth: 0.4 },
                color: new BABYLON.Color3(0.7, 0.1, 0.1)
            },
            ball: {
                name: 'Esfera',
                size: { width: 0.5, height: 0.5, depth: 0.5 },
                color: new BABYLON.Color3(0.7, 0.1, 0.1)
            },
            check: {
                name: 'Retenção',
                size: { width: 0.6, height: 0.5, depth: 0.4 },
                color: new BABYLON.Color3(0.7, 0.3, 0.1)
            },
            butterfly: {
                name: 'Borboleta',
                size: { width: 0.4, height: 0.6, depth: 0.3 },
                color: new BABYLON.Color3(0.1, 0.3, 0.7)
            },
            control: {
                name: 'Controle',
                size: { width: 0.7, height: 0.7, depth: 0.5 },
                color: new BABYLON.Color3(0.1, 0.7, 0.3)
            }
        },
        
        // Estados das válvulas
        states: {
            open: {
                name: 'Aberta',
                color: new BABYLON.Color3(0.1, 0.7, 0.1),
                wheelRotation: Math.PI / 2
            },
            closed: {
                name: 'Fechada',
                color: new BABYLON.Color3(0.7, 0.1, 0.1),
                wheelRotation: 0
            },
            partial: {
                name: 'Parcial',
                color: new BABYLON.Color3(0.7, 0.7, 0.1),
                wheelRotation: Math.PI / 4
            },
            maintenance: {
                name: 'Manutenção',
                color: new BABYLON.Color3(0.3, 0.3, 0.7),
                wheelRotation: 0
            },
            fault: {
                name: 'Falha',
                color: new BABYLON.Color3(0.7, 0.3, 0.1),
                wheelRotation: 0
            }
        }
    };
    
    /**
     * Inicializa o gerenciador de válvulas
     */
    function initialize() {
        _valvesGroup = SceneManager.getGroup('valves');
        if (!_valvesGroup) {
            console.error("Grupo de válvulas não encontrado na cena");
            return Promise.reject("Grupo de válvulas não encontrado");
        }
        return Promise.resolve();
    }
    
    /**
     * Cria as válvulas na cena
     * @returns {Promise} - Promessa resolvida quando todas as válvulas forem criadas
     */
    async function createValves() {
        try {
            await initialize();
            
            // Criar válvulas a partir dos dados (simulados ou reais)
            if (EquipmentData && EquipmentData.valves) {
                // Usar dados do arquivo equipment.js
                EquipmentData.valves.forEach(createValveFromData);
            } else {
                // Criar válvulas de demonstração se não houver dados
                createDemoValves();
            }
            
            return Promise.resolve();
        } catch (error) {
            console.error("Erro ao criar válvulas:", error);
            return Promise.reject(error);
        }
    }
    
    /**
     * Cria uma válvula a partir de dados
     * @param {Object} valveData - Dados da válvula
     */
    function createValveFromData(valveData) {
        // Determinar o tipo de válvula
        const valveType = valveData.type || 'gate';
        const typeConfig = _valveConfig.types[valveType] || _valveConfig.types.gate;
        
        // Determinar estado inicial
        const state = valveData.state || 'closed';
        const stateConfig = _valveConfig.states[state] || _valveConfig.states.closed;
        
        // Criar o nó principal para esta válvula
        const valveNode = new BABYLON.TransformNode(valveData.id, SceneManager.scene);
        valveNode.parent = _valvesGroup;
        
        // Posicionar a válvula
        const position = valveData.position instanceof BABYLON.Vector3 
            ? valveData.position 
            : new BABYLON.Vector3(valveData.position.x, valveData.position.y, valveData.position.z);
        
        valveNode.position = position;
        
        // Aplicar rotação se especificada
        if (valveData.rotation) {
            valveNode.rotation = new BABYLON.Vector3(
                valveData.rotation.x || 0,
                valveData.rotation.y || 0,
                valveData.rotation.z || 0
            );
        }
        
        // Criar o corpo da válvula com base no tipo
        const valveBody = _createValveBody(valveData.id, valveType, typeConfig);
        valveBody.parent = valveNode;
        
        // Criar o volante/atuador da válvula
        const valveWheel = _createValveWheel(valveData.id, valveType, typeConfig);
        valveWheel.parent = valveNode;
        
        // Posicionar o volante adequadamente
        if (valveType === 'ball' || valveType === 'butterfly') {
            // Volante na lateral
            valveWheel.position.x = typeConfig.size.width;
            valveWheel.rotation.z = stateConfig.wheelRotation;
        } else {
            // Volante em cima
            valveWheel.position.y = typeConfig.size.height / 2 + 0.3;
            valveWheel.rotation.x = stateConfig.wheelRotation;
        }
        
        // Adicionar indicador de estado
        const stateIndicator = _createStateIndicator(valveData.id, state, stateConfig);
        stateIndicator.parent = valveNode;
        stateIndicator.position.y = typeConfig.size.height / 2 + 0.1;
        
        // Configurar metadados para interação
        valveNode.metadata = {
            id: valveData.id,
            type: 'valve',
            valveType: valveType,
            state: state,
            data: valveData,
            components: {
                body: valveBody,
                wheel: valveWheel,
                stateIndicator: stateIndicator
            }
        };
        
        // Adicionar à lista de válvulas
        _valveMeshes.push(valveNode);
        
        return valveNode;
    }
    
    /**
     * Cria válvulas de demonstração quando não há dados disponíveis
     */
    function createDemoValves() {
        console.log("Criando válvulas de demonstração");
        
        // Válvulas ao longo da tubulação principal
        const mainLineValves = [
            {
                id: 'XV-1001',
                type: 'gate',
                position: new BABYLON.Vector3(-15, 0.5, 0),
                state: 'open'
            },
            {
                id: 'XV-1002',
                type: 'gate',
                position: new BABYLON.Vector3(-5, 0.5, 5),
                state: 'open'
            },
            {
                id: 'XV-1003',
                type: 'gate',
                position: new BABYLON.Vector3(5, 0.5, 5),
                state: 'closed'
            }
        ];
        
        // Válvulas de controle
        const controlValves = [
            {
                id: 'FV-1001',
                type: 'control',
                position: new BABYLON.Vector3(-10, 0.5, -8),
                state: 'partial'
            },
            {
                id: 'FV-1002',
                type: 'control',
                position: new BABYLON.Vector3(0, 0.5, -8),
                state: 'open'
            }
        ];
        
        // Válvulas de retenção
        const checkValves = [
            {
                id: 'RV-1001',
                type: 'check',
                position: new BABYLON.Vector3(-8, 0.5, 0),
                rotation: { y: Math.PI / 2 }
            },
            {
                id: 'RV-1002',
                type: 'check',
                position: new BABYLON.Vector3(8, 0.5, 0),
                rotation: { y: Math.PI / 2 }
            }
        ];
        
        // Válvulas de esfera
        const ballValves = [
            {
                id: 'BV-1001',
                type: 'ball',
                position: new BABYLON.Vector3(-12, 0.5, 8),
                state: 'open'
            },
            {
                id: 'BV-1002',
                type: 'ball',
                position: new BABYLON.Vector3(0, 0.5, 8),
                state: 'closed'
            }
        ];
        
        // Válvulas de borboleta
        const butterflyValves = [
            {
                id: 'BFV-1001',
                type: 'butterfly',
                position: new BABYLON.Vector3(10, 0.5, 8),
                state: 'partial'
            }
        ];
        
        // Criar todas as válvulas
        mainLineValves.forEach(createValveFromData);
        controlValves.forEach(createValveFromData);
        checkValves.forEach(createValveFromData);
        ballValves.forEach(createValveFromData);
        butterflyValves.forEach(createValveFromData);
        
        // Válvula em manutenção
        createValveFromData({
            id: 'XV-1004',
            type: 'gate',
            position: new BABYLON.Vector3(15, 0.5, -5),
            state: 'maintenance'
        });
        
        // Válvula com falha
        createValveFromData({
            id: 'XV-1005',
            type: 'gate',
            position: new BABYLON.Vector3(15, 0.5, 0),
            state: 'fault'
        });
    }
    
    /**
     * Cria o corpo da válvula
     * @param {string} id - ID da válvula
     * @param {string} type - Tipo de válvula
     * @param {Object} config - Configuração do tipo de válvula
     * @returns {BABYLON.Mesh} - Mesh do corpo da válvula
     */
    function _createValveBody(id, type, config) {
        const scene = SceneManager.scene;
        let body;
        
        switch (type) {
            case 'ball':
                // Válvula esférica (corpo + esfera)
                body = new BABYLON.TransformNode(`${id}_body_node`, scene);
                
                // Corpo principal
                const ballValveBody = BABYLON.MeshBuilder.CreateCylinder(
                    `${id}_body`,
                    {
                        height: config.size.depth,
                        diameter: config.size.width,
                        tessellation: 16
                    },
                    scene
                );
                ballValveBody.parent = body;
                ballValveBody.rotation.z = Math.PI / 2;
                ballValveBody.material = _createMaterial(`${id}_bodyMat`, config.color);
                
                // Esfera interna (visível apenas em corte ou visualização especial)
                const ballValveSphere = BABYLON.MeshBuilder.CreateSphere(
                    `${id}_sphere`,
                    {
                        diameter: config.size.width * 0.7,
                        segments: 16
                    },
                    scene
                );
                ballValveSphere.parent = body;
                ballValveSphere.material = _createMaterial(
                    `${id}_sphereMat`,
                    new BABYLON.Color3(0.8, 0.8, 0.8)
                );
                ballValveSphere.visibility = 0.5; // Semi-transparente para ilustração
                
                break;
                
            case 'butterfly':
                // Válvula borboleta (corpo + disco)
                body = new BABYLON.TransformNode(`${id}_body_node`, scene);
                
                // Corpo principal
                const butterflyValveBody = BABYLON.MeshBuilder.CreateCylinder(
                    `${id}_body`,
                    {
                        height: config.size.depth,
                        diameter: config.size.width,
                        tessellation: 16
                    },
                    scene
                );
                butterflyValveBody.parent = body;
                butterflyValveBody.rotation.z = Math.PI / 2;
                butterflyValveBody.material = _createMaterial(`${id}_bodyMat`, config.color);
                
                // Disco interno
                const butterflyValveDisk = BABYLON.MeshBuilder.CreateDisc(
                    `${id}_disk`,
                    {
                        radius: config.size.width * 0.35,
                        tessellation: 16
                    },
                    scene
                );
                butterflyValveDisk.parent = body;
                butterflyValveDisk.material = _createMaterial(
                    `${id}_diskMat`,
                    new BABYLON.Color3(0.7, 0.7, 0.7)
                );
                
                break;
                
            case 'check':
                // Válvula de retenção (corpo + tampa)
                body = new BABYLON.TransformNode(`${id}_body_node`, scene);
                
                // Corpo principal
                const checkValveBody = BABYLON.MeshBuilder.CreateCylinder(
                    `${id}_body`,
                    {
                        height: config.size.depth,
                        diameter: config.size.width,
                        tessellation: 16
                    },
                    scene
                );
                checkValveBody.parent = body;
                checkValveBody.rotation.z = Math.PI / 2;
                checkValveBody.material = _createMaterial(`${id}_bodyMat`, config.color);
                
                // Tampa com indicador de fluxo
                const checkValveCap = BABYLON.MeshBuilder.CreateBox(
                    `${id}_cap`,
                    {
                        width: config.size.width * 0.6,
                        height: config.size.height * 0.6,
                        depth: config.size.depth * 0.3
                    },
                    scene
                );
                checkValveCap.parent = body;
                checkValveCap.position.y = config.size.height * 0.4;
                checkValveCap.material = _createMaterial(
                    `${id}_capMat`,
                    new BABYLON.Color3(0.6, 0.6, 0.6)
                );
                
                // Seta indicadora de fluxo
                const arrow = BABYLON.MeshBuilder.CreateCylinder(
                    `${id}_arrow`,
                    {
                        diameterTop: 0,
                        diameterBottom: config.size.width * 0.2,
                        height: config.size.height * 0.3,
                        tessellation: 4
                    },
                    scene
                );
                arrow.parent = body;
                arrow.rotation.x = Math.PI / 2;
                arrow.position.z = config.size.depth * 0.2;
                arrow.material = _createMaterial(
                    `${id}_arrowMat`,
                    new BABYLON.Color3(0.1, 0.6, 0.1)
                );
                
                break;
                
            case 'control':
                // Válvula de controle (corpo + atuador)
                body = new BABYLON.TransformNode(`${id}_body_node`, scene);
                
                // Corpo principal
                const controlValveBody = BABYLON.MeshBuilder.CreateCylinder(
                    `${id}_body`,
                    {
                        height: config.size.depth,
                        diameter: config.size.width * 0.8,
                        tessellation: 16
                    },
                    scene
                );
                controlValveBody.parent = body;
                controlValveBody.rotation.z = Math.PI / 2;
                controlValveBody.material = _createMaterial(`${id}_bodyMat`, config.color);
                
                // Atuador (caixa acima do corpo)
                const controlValveActuator = BABYLON.MeshBuilder.CreateBox(
                    `${id}_actuator`,
                    {
                        width: config.size.width * 0.6,
                        height: config.size.height * 0.8,
                        depth: config.size.width * 0.6
                    },
                    scene
                );
                controlValveActuator.parent = body;
                controlValveActuator.position.y = config.size.height * 0.5;
                controlValveActuator.material = _createMaterial(
                    `${id}_actuatorMat`,
                    new BABYLON.Color3(0.2, 0.2, 0.2)
                );
                
                // Posicionador (pequena caixa lateral)
                const controlValvePositioner = BABYLON.MeshBuilder.CreateBox(
                    `${id}_positioner`,
                    {
                        width: config.size.width * 0.3,
                        height: config.size.height * 0.3,
                        depth: config.size.width * 0.3
                    },
                    scene
                );
                controlValvePositioner.parent = body;
                controlValvePositioner.position.y = config.size.height * 0.3;
                controlValvePositioner.position.x = config.size.width * 0.5;
                controlValvePositioner.material = _createMaterial(
                    `${id}_positionerMat`,
                    new BABYLON.Color3(0.7, 0.7, 0.7)
                );
                
                break;
                
            case 'gate':
            default:
                // Válvula de gaveta (corpo + bonnet)
                body = new BABYLON.TransformNode(`${id}_body_node`, scene);
                
                // Corpo principal
                const gateValveBody = BABYLON.MeshBuilder.CreateBox(
                    `${id}_body`,
                    {
                        width: config.size.width,
                        height: config.size.height,
                        depth: config.size.depth
                    },
                    scene
                );
                gateValveBody.parent = body;
                gateValveBody.material = _createMaterial(`${id}_bodyMat`, config.color);
                
                // Bonnet (parte superior)
                const gateValveBonnet = BABYLON.MeshBuilder.CreateCylinder(
                    `${id}_bonnet`,
                    {
                        height: config.size.height * 0.5,
                        diameter: config.size.width * 0.5,
                        tessellation: 16
                    },
                    scene
                );
                gateValveBonnet.parent = body;
                gateValveBonnet.position.y = config.size.height * 0.5;
                gateValveBonnet.material = _createMaterial(
                    `${id}_bonnetMat`,
                    new BABYLON.Color3(0.6, 0.6, 0.6)
                );
                
                break;
        }
        
        // Tornar o corpo selecionável
        body.getChildMeshes().forEach(mesh => {
            mesh.isPickable = true;
        });
        
        return body;
    }
    
    /**
     * Cria o volante/atuador da válvula
     * @param {string} id - ID da válvula
     * @param {string} type - Tipo de válvula
     * @param {Object} config - Configuração do tipo de válvula
     * @returns {BABYLON.Mesh} - Mesh do volante/atuador
     */
    function _createValveWheel(id, type, config) {
        const scene = SceneManager.scene;
        let wheel;
        
        // Para válvulas de controle, não criamos volante manual
        if (type === 'control') {
            // Criar um indicador de posição em vez de volante
            wheel = BABYLON.MeshBuilder.CreateBox(
                `${id}_indicator`,
                {
                    width: 0.05,
                    height: 0.3,
                    depth: 0.05
                },
                scene
            );
            wheel.material = _createMaterial(
                `${id}_indicatorMat`,
                new BABYLON.Color3(0.9, 0.9, 0.1)
            );
        } else {
            // Criar volante para os outros tipos de válvulas
            const wheelRadius = config.size.width * 0.6;
            
            wheel = BABYLON.MeshBuilder.CreateTorus(
                `${id}_wheel`,
                {
                    diameter: wheelRadius * 2,
                    thickness: wheelRadius * 0.2,
                    tessellation: 16
                },
                scene
            );
            wheel.material = _createMaterial(
                `${id}_wheelMat`,
                new BABYLON.Color3(0.2, 0.2, 0.2)
            );
            
            // Adicionar raios ao volante
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI / 4) + (i * Math.PI / 2);
                const spoke = BABYLON.MeshBuilder.CreateCylinder(
                    `${id}_spoke_${i}`,
                    {
                        height: wheelRadius * 1.8,
                        diameter: wheelRadius * 0.15,
                        tessellation: 8
                    },
                    scene
                );
                spoke.parent = wheel;
                spoke.rotation.x = Math.PI / 2;
                spoke.rotation.y = angle;
                spoke.material = wheel.material;
            }
        }
        
        return wheel;
    }
    
    /**
     * Cria um indicador de estado para a válvula
     * @param {string} id - ID da válvula
     * @param {string} state - Estado da válvula
     * @param {Object} stateConfig - Configuração do estado
     * @returns {BABYLON.Mesh} - Mesh do indicador
     */
    function _createStateIndicator(id, state, stateConfig) {
        const scene = SceneManager.scene;
        
        // Criar um pequeno indicador luminoso
        const indicator = BABYLON.MeshBuilder.CreateSphere(
            `${id}_state_indicator`,
            {
                diameter: 0.15,
                segments: 8
            },
            scene
        );
        
        // Material emissivo para o indicador
        const indicatorMaterial = new BABYLON.StandardMaterial(`${id}_indicatorMat`, scene);
        indicatorMaterial.diffuseColor = stateConfig.color;
        indicatorMaterial.emissiveColor = stateConfig.color;
        indicatorMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        
        indicator.material = indicatorMaterial;
        
        return indicator;
    }
    
    /**
     * Cria um material para a válvula
     * @param {string} name - Nome do material
     * @param {BABYLON.Color3} color - Cor do material
     * @returns {BABYLON.StandardMaterial} - Material criado
     */
    function _createMaterial(name, color) {
        const scene = SceneManager.scene;
        const material = new BABYLON.StandardMaterial(name, scene);
        
        material.diffuseColor = color;
        material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        return material;
    }
    
    /**
     * Altera o estado de uma válvula
     * @param {string} valveId - ID da válvula
     * @param {string} newState - Novo estado da válvula
     * @param {boolean} animate - Se deve animar a transição
     */
    function changeValveState(valveId, newState, animate = true) {
        // Encontrar a válvula pelo ID
        const valveNode = _valveMeshes.find(valve => valve.name === valveId);
        if (!valveNode) return;
        
        // Verificar se o estado é válido
        const stateConfig = _valveConfig.states[newState];
        if (!stateConfig) return;
        
        // Referências aos componentes da válvula
        const metadata = valveNode.metadata;
        if (!metadata || !metadata.components) return;
        
        const wheel = metadata.components.wheel;
        const stateIndicator = metadata.components.stateIndicator;
        const valveType = metadata.valveType;
        
        // Atualizar o indicador de estado
        if (stateIndicator && stateIndicator.material) {
            stateIndicator.material.diffuseColor = stateConfig.color;
            stateIndicator.material.emissiveColor = stateConfig.color;
        }
        
        // Animar a rotação do volante/atuador se necessário
        if (animate && wheel) {
            // Determinar o eixo de rotação com base no tipo de válvula
            const rotationProperty = (valveType === 'ball' || valveType === 'butterfly') 
                ? 'rotation.z' 
                : 'rotation.x';
            
            // Criar e executar a animação
            const animation = new BABYLON.Animation(
                `${valveId}_wheel_rotation`,
                rotationProperty,
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            
            // Keyframes da animação
            const keys = [
                { frame: 0, value: wheel[rotationProperty.split('.')[1]] },
                { frame: 30, value: stateConfig.wheelRotation }
            ];
            
            animation.setKeys(keys);
            
            // Aplicar animação
            wheel.animations = [animation];
            SceneManager.scene.beginAnimation(wheel, 0, 30, false);
        } else if (wheel) {
            // Atualizar sem animação
            if (valveType === 'ball' || valveType === 'butterfly') {
                wheel.rotation.z = stateConfig.wheelRotation;
            } else {
                wheel.rotation.x = stateConfig.wheelRotation;
            }
        }
        
        // Atualizar metadados
        metadata.state = newState;
        if (metadata.data) {
            metadata.data.state = newState;
 	}
    }
    
    /**
     * Adiciona uma nova válvula à cena
     * @param {Object} valveData - Dados da nova válvula
     * @returns {BABYLON.TransformNode} - O nó da válvula criada
     */
    function addValve(valveData) {
        return createValveFromData(valveData);
    }
    
    /**
     * Remove uma válvula da cena
     * @param {string} valveId - ID da válvula a ser removida
     */
    function removeValve(valveId) {
        const valveIndex = _valveMeshes.findIndex(valve => valve.name === valveId);
        if (valveIndex === -1) return;
        
        const valveNode = _valveMeshes[valveIndex];
        
        // Remover todos os filhos
        valveNode.getChildMeshes().forEach(mesh => {
            mesh.dispose();
        });
        
        // Remover o nó principal
        valveNode.dispose();
        
        // Remover da lista
        _valveMeshes.splice(valveIndex, 1);
    }
    
    /**
     * Obtém todas as válvulas
     * @returns {Array} - Array de meshes de válvulas
     */
    function getValveMeshes() {
        return _valveMeshes;
    }
    
    /**
     * Obtém uma válvula específica pelo ID
     * @param {string} id - ID da válvula
     * @returns {BABYLON.TransformNode} - O nó da válvula ou null se não encontrado
     */
    function getValveById(id) {
        return _valveMeshes.find(valve => valve.name === id) || null;
    }
    
    // API pública
    return {
        initialize,
        createValves,
        changeValveState,
        addValve,
        removeValve,
        getValveMeshes,
        getValveById
    };
})();

