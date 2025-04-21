/**
 * PipesManager - Gerenciador de tubulações
 * 
 * Responsável por criar, modificar e gerenciar as tubulações
 * na cena 3D do terminal, incluindo a criação de redes complexas
 * de tubos e conexões.
 */

const PipesManager = (function() {
    // Variáveis privadas
    let _pipesGroup = null;
    const _pipeMeshes = [];
    
    // Configurações para as tubulações
    const _pipeConfig = {
        materials: {
            standard: {
                color: new BABYLON.Color3(0.5, 0.5, 0.5), // Cinza
                roughness: 0.6,
                metallic: 0.7
            },
            insulated: {
                color: new BABYLON.Color3(0.8, 0.8, 0.8), // Cinza claro
                roughness: 0.8,
                metallic: 0.2
            },
            highTemp: {
                color: new BABYLON.Color3(0.6, 0.3, 0.3), // Vermelho escuro
                roughness: 0.5,
                metallic: 0.6
            }
        },
        
        // Diâmetros padrão de tubulações (em unidades de cena)
        diameters: {
            small: 0.15,     // 2-4 polegadas
            medium: 0.3,     // 6-8 polegadas
            large: 0.5,      // 10-12 polegadas
            extraLarge: 0.8  // 16+ polegadas
        },
        
        // Segmentos para detalhamento dos tubos
        tessellation: {
            small: 8,
            medium: 12,
            large: 16,
            extraLarge: 20
        }
    };
    
    /**
     * Inicializa o gerenciador de tubulações
     */
    function initialize() {
        _pipesGroup = SceneManager.getGroup('pipes');
        if (!_pipesGroup) {
            console.error("Grupo de tubulações não encontrado na cena");
            return Promise.reject("Grupo de tubulações não encontrado");
        }
        return Promise.resolve();
    }
    
    /**
     * Cria as tubulações na cena
     * @returns {Promise} - Promessa resolvida quando todas as tubulações forem criadas
     */
    async function createPipes() {
        try {
            await initialize();
            
            // Criar tubulações a partir dos dados (simulados ou reais)
            if (EquipmentData && EquipmentData.pipes) {
                // Usar dados do arquivo equipment.js
                EquipmentData.pipes.forEach(createPipeFromData);
            } else {
                // Criar tubulações de demonstração se não houver dados
                createDemoPipes();
            }
            
            return Promise.resolve();
        } catch (error) {
            console.error("Erro ao criar tubulações:", error);
            return Promise.reject(error);
        }
    }
    
    /**
     * Cria uma tubulação a partir de dados
     * @param {Object} pipeData - Dados da tubulação
     */
    function createPipeFromData(pipeData) {
        // Verificar se temos os pontos necessários
        if (!pipeData.points || pipeData.points.length < 2) {
            console.warn(`Tubulação ${pipeData.id} não tem pontos suficientes`);
            return;
        }
        
        // Determinar o tamanho da tubulação
        const size = pipeData.size || 'medium';
        const diameter = _pipeConfig.diameters[size] || _pipeConfig.diameters.medium;
        const tessellation = _pipeConfig.tessellation[size] || _pipeConfig.tessellation.medium;
        
        // Determinar o tipo de material
        const materialType = pipeData.materialType || 'standard';
        
        // Criar o nó principal para esta tubulação
        const pipeNode = new BABYLON.TransformNode(pipeData.id, SceneManager.scene);
        pipeNode.parent = _pipesGroup;
        
        // Converter os pontos para Vector3 se necessário
        const points = pipeData.points.map(p => 
            p instanceof BABYLON.Vector3 ? p : new BABYLON.Vector3(p.x, p.y, p.z)
        );
        
        // Criar segmentos de tubulação entre pontos consecutivos
        for (let i = 0; i < points.length - 1; i++) {
            const segmentId = `${pipeData.id}_segment_${i}`;
            const segment = _createPipeSegment(
                segmentId,
                points[i],
                points[i + 1],
                diameter,
                tessellation,
                materialType
            );
            
            segment.parent = pipeNode;
            
            // Se não for o último segmento, adicionar uma conexão/curva
            if (i < points.length - 2) {
                const connectionId = `${pipeData.id}_connection_${i}`;
                const connection = _createPipeConnection(
                    connectionId,
                    points[i + 1],
                    points[i],
                    points[i + 2],
                    diameter,
                    tessellation,
                    materialType
                );
                
                connection.parent = pipeNode;
            }
        }
        
        // Configurar metadados para interação
        pipeNode.metadata = {
            id: pipeData.id,
            type: 'pipe',
            size: size,
            materialType: materialType,
            pipeData
        };
        
        // Adicionar à lista de malhas de tubulações
        _pipeMeshes.push(pipeNode);
    }
    
    /**
     * Cria tubulações de demonstração quando não há dados disponíveis
     */
    function createDemoPipes() {
        console.log("Criando tubulações de demonstração");
        
        // Rede principal de tubulações
        const mainLine = {
            id: 'PIPE-MAIN-01',
            size: 'large',
            materialType: 'standard',
            product: 'Diesel S10',
            points: [
                new BABYLON.Vector3(-15, 0.5, -5),
                new BABYLON.Vector3(-15, 0.5, 5),
                new BABYLON.Vector3(15, 0.5, 5)
            ]
        };
        
        // Linhas conectando aos tanques
        const tankConnections = [
            {
                id: 'PIPE-CONN-01',
                size: 'medium',
                materialType: 'standard',
                product: 'Diesel S10',
                points: [
                    new BABYLON.Vector3(-15, 0.5, -5),
                    new BABYLON.Vector3(-15, 0.5, -8),
                    new BABYLON.Vector3(-15, 0.5, -10)
                ]
            },
            {
                id: 'PIPE-CONN-02',
                size: 'medium',
                materialType: 'standard',
                product: 'Gasolina',
                points: [
                    new BABYLON.Vector3(-8, 0.5, 5),
                    new BABYLON.Vector3(-8, 0.5, -10)
                ]
            },
            {
                id: 'PIPE-CONN-03',
                size: 'medium',
                materialType: 'standard',
                product: 'Diesel Marítimo',
                points: [
                    new BABYLON.Vector3(-1, 0.5, 5),
                    new BABYLON.Vector3(-1, 0.5, -10)
                ]
            },
            {
                id: 'PIPE-CONN-04',
                size: 'small',
                materialType: 'standard',
                product: 'Óleo Lubrificante',
                points: [
                    new BABYLON.Vector3(6, 0.5, 5),
                    new BABYLON.Vector3(6, 0.5, -10)
                ]
            }
        ];
        
        // Linha de alta temperatura
        const highTempLine = {
            id: 'PIPE-HIGHTEMP-01',
            size: 'medium',
            materialType: 'highTemp',
            product: 'Vapor',
            points: [
                new BABYLON.Vector3(15, 0.5, -8),
                new BABYLON.Vector3(15, 0.5, 5),
                new BABYLON.Vector3(15, 0.5, 10)
            ]
        };
        
        // Linha isolada
        const insulatedLine = {
            id: 'PIPE-INSUL-01',
            size: 'small',
            materialType: 'insulated',
            product: 'GLP',
            points: [
                new BABYLON.Vector3(13, 0.5, -10),
                new BABYLON.Vector3(13, 0.5, 0),
                new BABYLON.Vector3(10, 0.5, 0),
                new BABYLON.Vector3(10, 0.5, 10)
            ]
        };
        
        // Criar todas as tubulações
        createPipeFromData(mainLine);
        tankConnections.forEach(createPipeFromData);
        createPipeFromData(highTempLine);
        createPipeFromData(insulatedLine);
        
        // Criar tubulação elevada
        const elevatedLine = {
            id: 'PIPE-ELEV-01',
            size: 'medium',
            materialType: 'standard',
            product: 'Água',
            points: [
                new BABYLON.Vector3(-10, 0.5, 8),
                new BABYLON.Vector3(-10, 4, 8),
                new BABYLON.Vector3(5, 4, 8),
                new BABYLON.Vector3(5, 0.5, 8)
            ]
        };
        createPipeFromData(elevatedLine);
        
        // Criar suportes para tubulação elevada
        _createPipeSupports(elevatedLine, 4);
    }
    
    /**
     * Cria um segmento de tubulação entre dois pontos
     * @param {string} id - Identificador do segmento
     * @param {BABYLON.Vector3} start - Ponto inicial
     * @param {BABYLON.Vector3} end - Ponto final
     * @param {number} diameter - Diâmetro do tubo
     * @param {number} tessellation - Número de segmentos da circunferência
     * @param {string} materialType - Tipo de material
     * @returns {BABYLON.Mesh} - O mesh do segmento criado
     */
    function _createPipeSegment(id, start, end, diameter, tessellation, materialType) {
        const scene = SceneManager.scene;
        
        // Calcular direção e comprimento
        const direction = end.subtract(start);
        const distance = direction.length();
        
        // Criar cilindro para representar o segmento
        const pipe = BABYLON.MeshBuilder.CreateCylinder(
            id, 
            {
                height: distance,
                diameter: diameter,
                tessellation: tessellation,
                updatable: true
            }, 
            scene
        );
        
        // Posicionar e orientar o tubo
        _positionCylinder(pipe, start, end);
        
        // Aplicar material
        pipe.material = _createPipeMaterial(id + "_material", materialType);
        
        // Tornar selecionável
        pipe.isPickable = true;
        
        return pipe;
    }
    
    /**
     * Cria uma conexão/curva entre segmentos de tubulação
     * @param {string} id - Identificador da conexão
     * @param {BABYLON.Vector3} center - Ponto central da conexão
     * @param {BABYLON.Vector3} prev - Ponto anterior
     * @param {BABYLON.Vector3} next - Próximo ponto
     * @param {number} diameter - Diâmetro do tubo
     * @param {number} tessellation - Número de segmentos
     * @param {string} materialType - Tipo de material
     * @returns {BABYLON.Mesh} - O mesh da conexão criada
     */
    function _createPipeConnection(id, center, prev, next, diameter, tessellation, materialType) {
        const scene = SceneManager.scene;
        
        // Calcular os vetores de direção
        const dirPrev = center.subtract(prev).normalize();
        const dirNext = next.subtract(center).normalize();
        
        // Determinar o tipo de conexão com base no ângulo entre as direções
        const dot = BABYLON.Vector3.Dot(dirPrev, dirNext);
        
        // Se o ângulo for próximo de 180 graus (segmentos quase colineares), não precisamos de conexão
        if (dot > 0.95) {
            return new BABYLON.TransformNode(id, scene);
        }
        
        // Se o ângulo for próximo de 90 graus, usamos uma curva (torus)
        const radius = diameter * 1.5; // Raio da curva
        
        // Criar uma esfera para representar a conexão (simplificado)
        // Em uma implementação mais avançada, usaríamos um torus ou elbow
        const connection = BABYLON.MeshBuilder.CreateSphere(
            id, 
            {
                diameter: diameter * 1.2,
                segments: tessellation
            }, 
            scene
        );
        
        // Posicionar no centro da conexão
        connection.position = center;
        
        // Aplicar material
        connection.material = _createPipeMaterial(id + "_material", materialType);
        
        return connection;
    }
    
    /**
     * Posiciona e orienta um cilindro entre dois pontos
     * @param {BABYLON.Mesh} cylinder - O cilindro a ser posicionado
     * @param {BABYLON.Vector3} start - Ponto inicial
     * @param {BABYLON.Vector3} end - Ponto final
     */
    function _positionCylinder(cylinder, start, end) {
        // Calcular a direção e distância
        const direction = end.subtract(start);
        const distance = direction.length();
        direction.normalize();
        
        // Posicionar no ponto médio
        cylinder.position = start.add(direction.scale(distance / 2));
        
        // Orientar o cilindro (que por padrão é orientado no eixo Y)
        // Precisamos rotacioná-lo para alinhar com a direção calculada
        if (Math.abs(direction.y) < 0.99999) {
            // Vetor para o qual queremos alinhar o eixo Y do cilindro
            const upVector = new BABYLON.Vector3(0, 1, 0);
            
            // Calcular o eixo e ângulo de rotação
            const axis = BABYLON.Vector3.Cross(upVector, direction).normalize();
            const angle = Math.acos(BABYLON.Vector3.Dot(upVector, direction));
            
            // Aplicar a rotação usando quaternion
            cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
        } else {
                // Caso especial: direção já está alinhada com o eixo Y
                if (direction.y < 0) {
                    // Invertido (apontando para baixo)
                    cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(
                        new BABYLON.Vector3(1, 0, 0), Math.PI);
                } else {
                    // Já está na orientação correta
                    cylinder.rotationQuaternion = BABYLON.Quaternion.Identity();
                }
            }
        }
    
    
    /**
     * Cria suportes para tubulações elevadas
     * @param {Object} pipeData - Dados da tubulação
     * @param {number} supportCount - Número de suportes a serem criados
     */
    function _createPipeSupports(pipeData, supportCount) {
        // Verificar se temos pontos elevados
        const points = pipeData.points;
        if (!points || points.length < 2) return;
        
        // Encontrar segmentos horizontais elevados
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            
            // Verificar se o segmento é horizontal e elevado
            if (Math.abs(start.y - end.y) < 0.1 && start.y > 1.0) {
                // Calcular direção e comprimento
                const dir = end.subtract(start);
                const distance = dir.length();
                const normalizedDir = dir.normalize();
                
                // Criar suportes distribuídos ao longo do segmento
                for (let j = 1; j <= supportCount; j++) {
                    const t = j / (supportCount + 1); // Posição relativa (0-1)
                    const supportPos = start.add(normalizedDir.scale(distance * t));
                    
                    // Criar o suporte
                    _createPipeSupport(
                        `${pipeData.id}_support_${i}_${j}`,
                        supportPos,
                        supportPos.y
                    );
                }
            }
        }
    }
    
    /**
     * Cria um suporte individual para tubulação
     * @param {string} id - Identificador do suporte
     * @param {BABYLON.Vector3} position - Posição do suporte
     * @param {number} height - Altura do suporte
     * @returns {BABYLON.Mesh} - O mesh do suporte criado
     */
    function _createPipeSupport(id, position, height) {
        const scene = SceneManager.scene;
        
        // Criar o nó principal do suporte
        const supportNode = new BABYLON.TransformNode(id, scene);
        supportNode.parent = _pipesGroup;
        
        // Poste principal
        const post = BABYLON.MeshBuilder.CreateCylinder(
            `${id}_post`, 
            {
                height: height,
                diameter: 0.15,
                tessellation: 8
            }, 
            scene
        );
        post.parent = supportNode;
        post.position = new BABYLON.Vector3(position.x, height / 2, position.z);
        
        // Base do suporte
        const base = BABYLON.MeshBuilder.CreateBox(
            `${id}_base`, 
            {
                width: 0.4,
                height: 0.1,
                depth: 0.4
            }, 
            scene
        );
        base.parent = supportNode;
        base.position = new BABYLON.Vector3(position.x, 0.05, position.z);
        
        // Topo do suporte (em forma de U para segurar o tubo)
        const topSupport = BABYLON.MeshBuilder.CreateBox(
            `${id}_top`, 
            {
                width: 0.3,
                height: 0.1,
                depth: 0.3
            }, 
            scene
        );
        topSupport.parent = supportNode;
        topSupport.position = new BABYLON.Vector3(position.x, height - 0.05, position.z);
        
        // Material para o suporte
        const supportMaterial = new BABYLON.StandardMaterial(`${id}_material`, scene);
        supportMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        supportMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        
        post.material = supportMaterial;
        base.material = supportMaterial;
        topSupport.material = supportMaterial;
        
        return supportNode;
    }
    
    /**
     * Cria um material para tubulação
     * @param {string} name - Nome do material
     * @param {string} type - Tipo de material (standard, insulated, highTemp)
     * @returns {BABYLON.Material} - Material criado
     */
    function _createPipeMaterial(name, type) {
        const scene = SceneManager.scene;
        const materialConfig = _pipeConfig.materials[type] || _pipeConfig.materials.standard;
        
        // Usar PBR para materiais mais realistas
        const material = new BABYLON.PBRMaterial(name, scene);
        
        material.albedoColor = materialConfig.color;
        material.metallic = materialConfig.metallic;
        material.roughness = materialConfig.roughness;
        material.useAmbientOcclusionFromMetallicTextureRed = true;
        material.useRoughnessFromMetallicTextureGreen = true;
        material.useMetallnessFromMetallicTextureBlue = true;
        
        return material;
    }
    
    /**
     * Atualiza a cor das tubulações de acordo com o produto transportado
     * @param {string} pipeId - ID da tubulação
     * @param {string} productType - Tipo de produto
     */
    function updateProductColor(pipeId, productType) {
        // Encontrar a tubulação pelo ID
        const pipeNode = _pipeMeshes.find(pipe => pipe.name === pipeId);
        if (!pipeNode) return;
        
        // Obter cor para o produto
        const productColor = _getProductColor(productType);
        
        // Atualizar cor de todos os segmentos da tubulação
        pipeNode.getChildMeshes().forEach(mesh => {
            if (mesh.material) {
                // Para manter as propriedades do material, apenas alteramos a cor
                if (mesh.material instanceof BABYLON.PBRMaterial) {
                    mesh.material.albedoColor = productColor;
                } else {
                    mesh.material.diffuseColor = productColor;
                }
            }
        });
        
        // Atualizar metadados
        if (pipeNode.metadata && pipeNode.metadata.pipeData) {
            pipeNode.metadata.pipeData.product = productType;
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
            'Vapor': new BABYLON.Color3(0.8, 0.8, 0.8),
            'Etanol': new BABYLON.Color3(0.1, 0.8, 0.3),
            'Querosene': new BABYLON.Color3(0.7, 0.7, 0.7),
            'default': new BABYLON.Color3(0.5, 0.5, 0.5)
        };
        
        return productColors[productType] || productColors.default;
    }
    
    /**
     * Simula fluxo em uma tubulação usando animação de textura
     * @param {string} pipeId - ID da tubulação
     * @param {number} flowRate - Taxa de fluxo (0-1)
     * @param {boolean} enabled - Se o fluxo está ativo
     */
    function simulateFlow(pipeId, flowRate, enabled) {
        // Implementação básica - em uma versão mais avançada, 
        // poderia usar shaders ou animação de textura
        
        // Encontrar a tubulação pelo ID
        const pipeNode = _pipeMeshes.find(pipe => pipe.name === pipeId);
        if (!pipeNode || !enabled) return;
        
        // Adicionar uma animação visual simples para indicar fluxo
        // (por exemplo, pulsação leve na cor)
        const segments = pipeNode.getChildMeshes().filter(mesh => 
            mesh.name.includes('segment') && mesh.material
        );
        
        segments.forEach(segment => {
            // Criar animação de pulsação para visualizar o fluxo
            const animation = new BABYLON.Animation(
                `flow_${segment.name}`,
                "material.emissiveColor",
                30, // frames por segundo
                BABYLON.Animation.ANIMATIONTYPE_COLOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            // Keyframes da animação
            const keys = [];
            const baseColor = segment.material.albedoColor || new BABYLON.Color3(0.5, 0.5, 0.5);
            const flowColor = baseColor.scale(1.3); // Cor mais brilhante para indicar fluxo
            
            keys.push({ frame: 0, value: baseColor });
            keys.push({ frame: 15, value: flowColor });
            keys.push({ frame: 30, value: baseColor });
            
            animation.setKeys(keys);
            
            // Aplicar a animação
            segment.animations = [animation];
            SceneManager.scene.beginAnimation(segment, 0, 30, true, flowRate * 2);
        });
    }
    
    /**
     * Adiciona uma nova tubulação à cena
     * @param {Object} pipeData - Dados da nova tubulação
     */
    function addPipe(pipeData) {
        createPipeFromData(pipeData);
    }
    
    /**
     * Remove uma tubulação da cena
     * @param {string} pipeId - ID da tubulação a ser removida
     */
    function removePipe(pipeId) {
        const pipeIndex = _pipeMeshes.findIndex(pipe => pipe.name === pipeId);
        if (pipeIndex === -1) return;
        
        const pipeNode = _pipeMeshes[pipeIndex];
        
        // Remover todos os filhos
        pipeNode.getChildMeshes().forEach(mesh => {
            mesh.dispose();
        });
        
        // Remover o nó principal
        pipeNode.dispose();
        
        // Remover da lista
        _pipeMeshes.splice(pipeIndex, 1);
    }
    
    /**
     * Obtém todas as tubulações
     * @returns {Array} - Array de meshes de tubulações
     */
    function getPipeMeshes() {
        return _pipeMeshes;
    }
    
    /**
     * Obtém uma tubulação específica pelo ID
     * @param {string} id - ID da tubulação
     * @returns {BABYLON.TransformNode} - O nó da tubulação ou null se não encontrado
     */
    function getPipeById(id) {
        return _pipeMeshes.find(pipe => pipe.name === id) || null;
    }
    
    // API pública
    return {
        initialize,
        createPipes,
        updateProductColor,
        simulateFlow,
        addPipe,
        removePipe,
        getPipeMeshes,
        getPipeById
    };
})();
