/**
 * TanksManager - Gerenciador de tanques
 * 
 * Responsável por criar, modificar e gerenciar os tanques
 * na cena 3D do terminal.
 */
const TanksManager = (function() {
    // Variáveis privadas
    let _tanksGroup = null;
    const _tankMeshes = [];
    
    // Configurações para os tanques
    const _tankConfig = {
        defaultMaterial: {
            color: new BABYLON.Color3(0, 0.47, 0.75),  // Azul petróleo
            metallic: 0.3,
            roughness: 0.4
        },
        
        // Tipos de tanques com suas dimensões
        types: {
            standard: { 
                height: 8, 
                diameter: 5, 
                segments: 24 
            },
            large: { 
                height: 12, 
                diameter: 8, 
                segments: 32 
            },
            small: { 
                height: 5, 
                diameter: 3, 
                segments: 20 
            },
            spherical: {
                diameter: 6,
                segments: 32
            }
        }
    };
    
    /**
     * Inicializa o gerenciador de tanques
     */
    function initialize() {
        _tanksGroup = SceneManager.getGroup('tanks');
        console.log("Grupo de tanques obtido:", _tanksGroup);
        
        if (!_tanksGroup) {
            console.error("Grupo de tanques não encontrado na cena");
            return Promise.reject("Grupo de tanques não encontrado");
        }
        
        // Garantir que o grupo de tanques tenha transformação adequada
        _tanksGroup.position = new BABYLON.Vector3(0, 0, 0);
        _tanksGroup.scaling = new BABYLON.Vector3(1, 1, 1);
        _tanksGroup.rotation = new BABYLON.Vector3(0, 0, 0);
        _tanksGroup.rotationQuaternion = null;
        
        return Promise.resolve();
    }
    
    /**
     * Cria os tanques na cena
     * @returns {Promise} - Promessa resolvida quando todos os tanques forem criados
     */
    async function createTanks() {
        try {
            await initialize();
            console.log("TanksManager inicializado com sucesso");
            
            // Criar tanques a partir dos dados (simulados ou reais)
            if (EquipmentData && EquipmentData.tanks) {
                // Usar dados do arquivo equipment.js
                EquipmentData.tanks.forEach(createTankFromData);
            } else {
                // Criar tanques de demonstração se não houver dados
                console.log("Dados de tanques não encontrados, criando tanques de demonstração");
                createDemoTanks();
            }
            
            console.log(`Total de tanques criados: ${_tankMeshes.length}`);
            
            return Promise.resolve();
        } catch (error) {
            console.error("Erro ao criar tanques:", error);
            return Promise.reject(error);
        }
    }
    
    /**
     * Cria um tanque a partir de dados
     * @param {Object} tankData - Dados do tanque
     */
    function createTankFromData(tankData) {
        // Determinar o tipo de tanque a ser criado
        const type = tankData.type || 'standard';
        const typeConfig = _tankConfig.types[type] || _tankConfig.types.standard;
        
        // Verificar e normalizar a posição
        let position;
        if (tankData.position instanceof BABYLON.Vector3) {
            position = tankData.position;
        } else if (tankData.position) {
            position = new BABYLON.Vector3(
                tankData.position.x || 0,
                tankData.position.y || 0,
                tankData.position.z || 0
            );
        } else {
            position = new BABYLON.Vector3(0, 0, 0);
        }
        
        // Criar o tanque adequado com base no tipo
        let tankMesh;
        if (type === 'spherical') {
            tankMesh = _createSphericalTank(tankData.id, typeConfig, position);
        } else {
            tankMesh = _createCylindricalTank(tankData.id, typeConfig, position);
        }
        
        // Garantir que a transformação seja correta
        tankMesh.rotationQuaternion = null;
        
        // Configurar metadados para interação
        tankMesh.metadata = {
            id: tankData.id,
            type: 'tank',
            equipmentType: type,
            data: tankData
        };
        
        // Adicionar à lista de malhas de tanques
        _tankMeshes.push(tankMesh);
    }
    
    /**
     * Cria tanques de demonstração quando não há dados disponíveis
     */
    function createDemoTanks() {
        console.log("Criando tanques de demonstração");
        
        // Tanques cilíndricos em linha
        const positions = [
            new BABYLON.Vector3(-15, 0, -10),
            new BABYLON.Vector3(-8, 0, -10),
            new BABYLON.Vector3(-1, 0, -10),
            new BABYLON.Vector3(6, 0, -10),
            new BABYLON.Vector3(13, 0, -10)
        ];
        
        // Criar diferentes tipos de tanques
        const demoTanks = [
            { id: 'TQ-0001', type: 'large', position: positions[0], product: 'Diesel S10', level: 0.85 },
            { id: 'TQ-0002', type: 'standard', position: positions[1], product: 'Gasolina', level: 0.65 },
            { id: 'TQ-0003', type: 'standard', position: positions[2], product: 'Diesel Marítimo', level: 0.45 },
            { id: 'TQ-0004', type: 'small', position: positions[3], product: 'Óleo Lubrificante', level: 0.75 },
            { id: 'TQ-0005', type: 'spherical', position: positions[4], product: 'GLP', level: 0.55 }
        ];
        
        // Criar cada tanque
        demoTanks.forEach(createTankFromData);
    }
    
    /**
     * Cria um tanque cilíndrico
     * @param {string} id - Identificador do tanque
     * @param {Object} config - Configurações do tanque
     * @param {BABYLON.Vector3} position - Posição do tanque
     * @returns {BABYLON.TransformNode} - O nó do tanque criado
     */
    function _createCylindricalTank(id, config, position) {
        const scene = SceneManager.scene;
        
        // Criar o grupo para este tanque específico
        const tankNode = new BABYLON.TransformNode(id, scene);
        
        // Posicionar o grupo antes de adicionar ao pai
        tankNode.position = position || new BABYLON.Vector3(0, 0, 0);
        
        // Adicionar ao grupo de tanques
        tankNode.parent = _tanksGroup;
        
        console.log(`Tanque ${id} - Posição:`, tankNode.position);
        
        // Corpo do tanque (cilindro)
        const body = BABYLON.MeshBuilder.CreateCylinder(
            `${id}_body`, 
            {
                height: config.height,
                diameter: config.diameter,
                tessellation: config.segments
            }, 
            scene
        );
        body.parent = tankNode;
        body.position.y = config.height / 2;
        console.log(`Tanque ${id} - Corpo criado:`, body, `Dimensões: altura=${config.height}, diâmetro=${config.diameter}`);
        
        // Teto do tanque (cone ou domo)
        const roofHeight = config.diameter * 0.15;
        const roof = BABYLON.MeshBuilder.CreateCylinder(
            `${id}_roof`, 
            {
                height: roofHeight,
                diameterTop: 0,
                diameterBottom: config.diameter,
                tessellation: config.segments
            }, 
            scene
        );
        roof.parent = tankNode;
        roof.position.y = config.height + (roofHeight / 2);
        
        // Plataforma no topo (opcional)
        if (config.height > 6) {
            const platform = BABYLON.MeshBuilder.CreateTorus(
                `${id}_platform`,
                {
                    diameter: config.diameter * 0.9,
                    thickness: 0.3,
                    tessellation: config.segments
                },
                scene
            );
            platform.parent = tankNode;
            platform.position.y = config.height - 0.1;
            platform.material = _createMaterial(`${id}_platformMat`, new BABYLON.Color3(0.3, 0.3, 0.3));
        }
        
        // Criar escada (opcional para tanques maiores)
        if (config.height > 5) {
            _addTankStairs(tankNode, id, config);
        }
        
        // Criar conexões de tubulação
        _addTankConnections(tankNode, id, config);
        
        // Material padrão para o tanque
        const tankMaterial = _createPBRMaterial(`${id}_material`);
        body.material = tankMaterial;
        roof.material = tankMaterial;
        
        // Adicionar capacidade de seleção
        body.isPickable = true;
        
        // Retornar o nó principal do tanque
        return tankNode;
    }
    
    /**
     * Cria um tanque esférico (para gases)
     * @param {string} id - Identificador do tanque
     * @param {Object} config - Configurações do tanque
     * @param {BABYLON.Vector3} position - Posição do tanque
     * @returns {BABYLON.TransformNode} - O nó do tanque criado
     */
    function _createSphericalTank(id, config, position) {
        const scene = SceneManager.scene;
        
        // Criar o grupo para este tanque específico
        const tankNode = new BABYLON.TransformNode(id, scene);
        
        // Posicionar o grupo antes de adicionar ao pai
        tankNode.position = position || new BABYLON.Vector3(0, 0, 0);
        
        // Adicionar ao grupo de tanques
        tankNode.parent = _tanksGroup;
        
        // Corpo do tanque (esfera)
        const body = BABYLON.MeshBuilder.CreateSphere(
            `${id}_body`, 
            {
                diameter: config.diameter,
                segments: config.segments
            }, 
            scene
        );
        body.parent = tankNode;
        body.position.y = config.diameter / 2;
        
        // Criar suportes
        const supportHeight = config.diameter * 0.3;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            const supportX = Math.cos(angle) * (config.diameter * 0.4);
            const supportZ = Math.sin(angle) * (config.diameter * 0.4);
            
            const support = BABYLON.MeshBuilder.CreateCylinder(
                `${id}_support_${i}`,
                {
                    height: supportHeight,
                    diameter: config.diameter * 0.1,
                    tessellation: 8
                },
                scene
            );
            support.parent = tankNode;
            support.position.x = supportX;
            support.position.z = supportZ;
            support.position.y = supportHeight / 2;
            support.material = _createMaterial(`${id}_supportMat`, new BABYLON.Color3(0.3, 0.3, 0.3));
        }
        
        // Criar conexões e válvulas
        const connection = BABYLON.MeshBuilder.CreateCylinder(
            `${id}_connection`,
            {
                height: config.diameter * 0.4,
                diameter: config.diameter * 0.15,
                tessellation: 12
            },
            scene
        );
        connection.parent = tankNode;
        connection.position.x = config.diameter * 0.7;
        connection.position.y = config.diameter / 2;
        connection.rotation.z = Math.PI / 2;
        connection.material = _createMaterial(`${id}_connectionMat`, new BABYLON.Color3(0.4, 0.4, 0.4));
        
        // Material para o tanque esférico
        const tankMaterial = _createPBRMaterial(`${id}_material`);
        body.material = tankMaterial;
        
        // Adicionar capacidade de seleção
        body.isPickable = true;
        
        // Retornar o nó principal do tanque
        return tankNode;
    }
    
    /**
     * Adiciona escadas ao tanque
     * @param {BABYLON.TransformNode} tankNode - Nó do tanque
     * @param {string} id - ID do tanque
     * @param {Object} config - Configuração do tanque
     */
    function _addTankStairs(tankNode, id, config) {
        const scene = SceneManager.scene;
        
        // Grupo para escada
        const stairsNode = new BABYLON.TransformNode(`${id}_stairs`, scene);
        stairsNode.parent = tankNode;
        stairsNode.position = new BABYLON.Vector3(0, 0, config.diameter / 2);
        
        // Material para escadas
        const stairsMaterial = _createMaterial(`${id}_stairsMat`, new BABYLON.Color3(0.2, 0.2, 0.2));
        
        // Criar escada vertical
        const stairHeight = config.height;
        const stairWidth = 0.8;
        
        // Montantes
        const rail1 = BABYLON.MeshBuilder.CreateCylinder(
            `${id}_rail1`,
            { height: stairHeight, diameter: 0.1 },
            scene
        );
        rail1.parent = stairsNode;
        rail1.position.x = stairWidth / 2;
        rail1.position.y = stairHeight / 2;
        rail1.material = stairsMaterial;
        
        const rail2 = BABYLON.MeshBuilder.CreateCylinder(
            `${id}_rail2`,
            { height: stairHeight, diameter: 0.1 },
            scene
        );
        rail2.parent = stairsNode;
        rail2.position.x = -stairWidth / 2;
        rail2.position.y = stairHeight / 2;
        rail2.material = stairsMaterial;
        
        // Degraus
        const stepCount = Math.floor(stairHeight / 0.4);
        for (let i = 0; i < stepCount; i++) {
            const step = BABYLON.MeshBuilder.CreateBox(
                `${id}_step_${i}`,
                { width: stairWidth, height: 0.05, depth: 0.2 },
                scene
            );
            step.parent = stairsNode;
            step.position.y = (i + 0.5) * (stairHeight / stepCount);
            step.material = stairsMaterial;
           }

}
    
    /**
     * Adiciona conexões de tubulação ao tanque
     * @param {BABYLON.TransformNode} tankNode - Nó do tanque
     * @param {string} id - ID do tanque
     * @param {Object} config - Configuração do tanque
     */
    function _addTankConnections(tankNode, id, config) {
        const scene = SceneManager.scene;
        
        // Material para conexões
        const connectionMaterial = _createMaterial(`${id}_connMat`, new BABYLON.Color3(0.4, 0.4, 0.4));
        
        // Conexão inferior
        const bottomConn = BABYLON.MeshBuilder.CreateCylinder(
            `${id}_bottomConn`,
            { height: 0.5, diameter: 0.4 },
            scene
        );
        bottomConn.parent = tankNode;
        bottomConn.position.z = config.diameter / 2;
        bottomConn.position.y = 0.25;
        bottomConn.rotation.x = Math.PI / 2;
        bottomConn.material = connectionMaterial;
        
        // Válvula na conexão (simplificada)
        const valve = BABYLON.MeshBuilder.CreateBox(
            `${id}_valve`,
            { width: 0.6, height: 0.6, depth: 0.3 },
            scene
        );
        valve.parent = tankNode;
        valve.position.z = config.diameter / 2 + 0.6;
        valve.position.y = 0.25;
        valve.material = _createMaterial(`${id}_valveMat`, new BABYLON.Color3(0.7, 0.1, 0.1));
    }
    
    /**
     * Cria um material PBR para o tanque
     * @param {string} name - Nome do material
     * @returns {BABYLON.PBRMaterial} - Material criado
     */
    function _createPBRMaterial(name) {
        const scene = SceneManager.scene;
        const material = new BABYLON.PBRMaterial(name, scene);
        
        // Configurar propriedades do material
        material.albedoColor = _tankConfig.defaultMaterial.color;
        material.metallic = _tankConfig.defaultMaterial.metallic;
        material.roughness = _tankConfig.defaultMaterial.roughness;
        material.useAmbientOcclusionFromMetallicTextureRed = true;
        material.useRoughnessFromMetallicTextureGreen = true;
        material.useMetallnessFromMetallicTextureBlue = true;
        
        return material;
    }
    
    /**
     * Cria um material standard simples
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
     * Atualiza o nível de produto no tanque
     * @param {string} tankId - ID do tanque a ser atualizado
     * @param {number} level - Nível do produto (0-1)
     */
    function updateProductLevel(tankId, level) {
        // Encontrar o tanque pelo ID
        const tankNode = _tankMeshes.find(tank => tank.name === tankId);
        if (!tankNode) return;
        
        // Verificar se já existe uma malha de nível
        let levelMesh = tankNode.getChildMeshes().find(mesh => mesh.name === `${tankId}_level`);
        
        // Se não existir, criar uma nova
        if (!levelMesh) {
            // Obter configurações do tanque
            const tankMetadata = tankNode.metadata;
            if (!tankMetadata) return;
            
            const tankType = tankMetadata.equipmentType || 'standard';
            const config = _tankConfig.types[tankType];
            
            // Criar malha para representar o nível
            if (tankType === 'spherical') {
                // Para tanques esféricos, usar uma esfera escalada
                levelMesh = BABYLON.MeshBuilder.CreateSphere(
                    `${tankId}_level`,
                    {
                        diameter: config.diameter * 0.95,
                        segments: config.segments
                    },
                    SceneManager.scene
                );
                levelMesh.parent = tankNode;
                levelMesh.position.y = config.diameter / 2;
            } else {
                // Para tanques cilíndricos
                levelMesh = BABYLON.MeshBuilder.CreateCylinder(
                    `${tankId}_level`,
                    {
                        height: config.height * 0.98,
                        diameter: config.diameter * 0.95,
                        tessellation: config.segments
                    },
                    SceneManager.scene
                );
                levelMesh.parent = tankNode;
                levelMesh.position.y = config.height / 2;
            }
            
            // Material para o nível
            const levelMaterial = new BABYLON.StandardMaterial(`${tankId}_levelMat`, SceneManager.scene);
            levelMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.1); // Cor amarelada para o produto
            levelMaterial.alpha = 0.8; // Semitransparente
            levelMesh.material = levelMaterial;
        }
        
        // Atualizar a escala ou posição para refletir o nível
        if (tankNode.metadata.equipmentType === 'spherical') {
            // Para tanques esféricos, ajustar a escala Y
            levelMesh.scaling.y = Math.max(0.01, Math.min(level, 1));
        } else {
            // Para tanques cilíndricos, ajustar a escala Y e posição
            const config = _tankConfig.types[tankNode.metadata.equipmentType || 'standard'];
            levelMesh.scaling.y = Math.max(0.01, Math.min(level, 1));
            
            // Ajustar posição para manter o nível alinhado com o fundo do tanque
            const originalHeight = config.height * 0.98;
            const newHeight = originalHeight * levelMesh.scaling.y;
            levelMesh.position.y = newHeight / 2;
        }
        
        // Atualizar os metadados
        if (tankNode.metadata && tankNode.metadata.data) {
            tankNode.metadata.data.level = level;
        }
    }
    
    /**
     * Atualiza a cor dos tanques de acordo com o tipo de produto
     * @param {string} tankId - ID do tanque
     * @param {string} productType - Tipo de produto
     */
    function updateProductColor(tankId, productType) {
        // Encontrar o tanque pelo ID
        const tankNode = _tankMeshes.find(tank => tank.name === tankId);
        if (!tankNode) return;
        
        // Encontrar a malha de nível
        const levelMesh = tankNode.getChildMeshes().find(mesh => mesh.name === `${tankId}_level`);
        if (!levelMesh) return;
        
        // Obter cor para o produto
        const productColor = _getProductColor(productType);
        
        // Atualizar cor do material
        if (levelMesh.material) {
            levelMesh.material.diffuseColor = productColor;
        }
        
        // Atualizar metadados
        if (tankNode.metadata && tankNode.metadata.data) {
            tankNode.metadata.data.product = productType;
        }
    }
    
    /**
     * Retorna a cor associada a um tipo de produto
     * @param {string} productType - Tipo de produto
     * @returns {BABYLON.Color3} - Cor do produto
     */
    function _getProductColor(productType) {
        // Mapeamento de produtos para cores
        const productColors = {
            'Diesel S10': new BABYLON.Color3(0.8, 0.7, 0.1),
            'Diesel Marítimo': new BABYLON.Color3(0.7, 0.6, 0.1),
            'Gasolina': new BABYLON.Color3(0.8, 0.4, 0.1),
            'Óleo Lubrificante': new BABYLON.Color3(0.5, 0.3, 0.1),
            'GLP': new BABYLON.Color3(0.3, 0.7, 0.7),
            'Água': new BABYLON.Color3(0.1, 0.5, 0.8),
            'Etanol': new BABYLON.Color3(0.1, 0.8, 0.3),
            'Querosene': new BABYLON.Color3(0.7, 0.7, 0.7),
            'default': new BABYLON.Color3(0.7, 0.7, 0.1)
        };
        
        return productColors[productType] || productColors.default;
    }
    
    /**
     * Atualiza todos os tanques com base nos dados fornecidos
     * @param {Array} tanksData - Array com dados atualizados dos tanques
     */
    function updateTanks(tanksData) {
        if (!tanksData || !Array.isArray(tanksData)) return;
        
        tanksData.forEach(data => {
            // Atualizar nível do produto
            if (data.id && data.level !== undefined) {
                updateProductLevel(data.id, data.level);
            }
            
            // Atualizar tipo de produto
            if (data.id && data.product) {
                updateProductColor(data.id, data.product);
            }
        });
    }
    
    /**
     * Obtém todos os meshes de tanques
     * @returns {Array} - Array de meshes de tanques
     */
    function getTankMeshes() {
        return _tankMeshes;
    }
    
    /**
     * Obtém um tanque específico pelo ID
     * @param {string} id - ID do tanque
     * @returns {BABYLON.TransformNode} - O nó do tanque ou null se não encontrado
     */
    function getTankById(id) {
        return _tankMeshes.find(tank => tank.name === id) || null;
    }
    
    // API pública
    return {
        initialize,
        createTanks,
        updateProductLevel,
        updateProductColor,
        updateTanks,
        getTankMeshes,
        getTankById
    };
})();

