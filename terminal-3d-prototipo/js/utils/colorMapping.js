/**
 * ColorMapper - Mapeamento de cores para visualização de dados
 * 
 * Responsável por aplicar diferentes esquemas de cores aos objetos
 * da cena 3D de acordo com diferentes modos de visualização
 * (por produto, status, temperatura, etc.)
 */

const ColorMapper = (function() {
    // Variáveis privadas
    let _scene = null;
    let _currentMode = 'default';
    
    // Esquemas de cores para diferentes modos de visualização
    const _colorSchemes = {
        // Cores por tipo de produto
        product: {
            'Diesel S10': new BABYLON.Color3(0.8, 0.7, 0.1),      // Amarelo
            'Diesel Marítimo': new BABYLON.Color3(0.7, 0.6, 0.1), // Amarelo escuro
            'Gasolina': new BABYLON.Color3(0.8, 0.4, 0.1),        // Laranja
            'Etanol': new BABYLON.Color3(0.1, 0.8, 0.3),          // Verde
            'Óleo Lubrificante': new BABYLON.Color3(0.5, 0.3, 0.1), // Marrom
            'GLP': new BABYLON.Color3(0.3, 0.7, 0.7),             // Ciano
            'Água': new BABYLON.Color3(0.1, 0.5, 0.8),            // Azul
            'Vapor': new BABYLON.Color3(0.8, 0.8, 0.8),           // Branco
            'Querosene': new BABYLON.Color3(0.7, 0.7, 0.7),       // Cinza
            'default': new BABYLON.Color3(0.5, 0.5, 0.5)          // Cinza médio
        },
        
        // Cores por status operacional
        status: {
            'operational': new BABYLON.Color3(0.1, 0.7, 0.1),     // Verde
            'maintenance': new BABYLON.Color3(0.7, 0.7, 0.1),     // Amarelo
            'fault': new BABYLON.Color3(0.7, 0.1, 0.1),           // Vermelho
            'offline': new BABYLON.Color3(0.5, 0.5, 0.5),         // Cinza
            'standby': new BABYLON.Color3(0.1, 0.5, 0.8),         // Azul
            'default': new BABYLON.Color3(0.3, 0.3, 0.3)          // Cinza escuro
        },
        
        // Cores por temperatura (gradiente)
        temperature: {
            ranges: [
                { max: 0, color: new BABYLON.Color3(0.0, 0.0, 0.8) },    // Azul (frio)
                { max: 25, color: new BABYLON.Color3(0.0, 0.5, 0.8) },   // Azul claro
                { max: 50, color: new BABYLON.Color3(0.0, 0.8, 0.0) },   // Verde
                { max: 75, color: new BABYLON.Color3(0.8, 0.8, 0.0) },   // Amarelo
                { max: 100, color: new BABYLON.Color3(0.8, 0.4, 0.0) },  // Laranja
                { max: Infinity, color: new BABYLON.Color3(0.8, 0.0, 0.0) } // Vermelho (quente)
            ],
            default: new BABYLON.Color3(0.5, 0.5, 0.5)                   // Cinza (sem dados)
        },
        
        // Cores padrão por tipo de equipamento
        default: {
            'tank': new BABYLON.Color3(0.0, 0.47, 0.75),          // Azul petróleo
            'pipe': new BABYLON.Color3(0.5, 0.5, 0.5),            // Cinza
            'valve': new BABYLON.Color3(0.7, 0.1, 0.1),           // Vermelho
            'loadingArea': new BABYLON.Color3(0.8, 0.5, 0.2),     // Laranja escuro
            'default': new BABYLON.Color3(0.3, 0.3, 0.3)          // Cinza escuro
        }
    };
    
    /**
     * Inicializa o mapeador de cores
     * @param {BABYLON.Scene} scene - A cena Babylon.js
     */
    function initialize(scene) {
        _scene = scene;
        return Promise.resolve();
    }
    
    /**
     * Aplica um modo de coloração aos objetos da cena
     * @param {string} mode - Modo de coloração ('default', 'product', 'status', 'temperature')
     */
    function applyColorMode(mode) {
        if (!_colorSchemes[mode]) {
            console.warn(`Modo de coloração '${mode}' não encontrado. Usando 'default'.`);
            mode = 'default';
        }
        
        _currentMode = mode;
        console.log(`Aplicando modo de coloração: ${mode}`);
        
        // Aplicar cores aos tanques
        if (TanksManager && TanksManager.getTankMeshes) {
            const tanks = TanksManager.getTankMeshes();
            tanks.forEach(tank => {
                _colorizeObject(tank, mode);
            });
        }
        
        // Aplicar cores às tubulações
        if (PipesManager && PipesManager.getPipeMeshes) {
            const pipes = PipesManager.getPipeMeshes();
            pipes.forEach(pipe => {
                _colorizeObject(pipe, mode);
            });
        }
        
        // Aplicar cores às válvulas
        if (ValvesManager && ValvesManager.getValveMeshes) {
            const valves = ValvesManager.getValveMeshes ? ValvesManager.getValveMeshes() : [];
            valves.forEach(valve => {
                _colorizeObject(valve, mode);
            });
        }
        
        // Aplicar cores às áreas de carregamento
        if (LoadingAreasManager && LoadingAreasManager.getLoadingAreaMeshes) {
            const loadingAreas = LoadingAreasManager.getLoadingAreaMeshes();
            loadingAreas.forEach(area => {
                _colorizeObject(area, mode);
            });
        }
    }
    
    /**
     * Colorize um objeto específico com base no modo atual
     * @param {BABYLON.TransformNode} objectNode - Nó do objeto a ser colorido
     * @param {string} mode - Modo de coloração
     */
    function _colorizeObject(objectNode, mode) {
        if (!objectNode || !objectNode.metadata) return;
        
        const metadata = objectNode.metadata;
        let color = null;
        
        switch (mode) {
            case 'product':
                // Colorir por tipo de produto
                if (metadata.data && metadata.data.product) {
                    color = _getColorForProduct(metadata.data.product);
                }
                break;
                
            case 'status':
                // Colorir por status operacional
                if (metadata.data && metadata.data.status) {
                    color = _getColorForStatus(metadata.data.status);
                } else if (metadata.state) {
                    // Para válvulas que usam 'state' em vez de 'status'
                    color = _getColorForStatus(metadata.state);
                }
                break;
                
            case 'temperature':
                // Colorir por temperatura
                if (metadata.data && metadata.data.temperature !== undefined) {
                    color = _getColorForTemperature(metadata.data.temperature);
                }
                break;
                
            case 'default':
            default:
                // Colorir pelo tipo de equipamento
                color = _getDefaultColor(metadata.type);
                break;
        }
        
        // Se não encontrou cor específica, usar a cor padrão para o tipo
        if (!color) {
            color = _getDefaultColor(metadata.type);
        }
        
        // Aplicar a cor aos materiais do objeto
        _applyColorToMeshes(objectNode, color);
    }
    
    /**
     * Obtém a cor para um determinado produto
     * @param {string} productName - Nome do produto
     * @returns {BABYLON.Color3} - Cor do produto
     */
    function _getColorForProduct(productName) {
        return _colorSchemes.product[productName] || _colorSchemes.product.default;
    }
    
    /**
     * Obtém a cor para um determinado status
     * @param {string} status - Status operacional
     * @returns {BABYLON.Color3} - Cor do status
     */
    function _getColorForStatus(status) {
        return _colorSchemes.status[status] || _colorSchemes.status.default;
    }
    
    /**
     * Obtém a cor para uma determinada temperatura
     * @param {number} temperature - Temperatura em graus Celsius
     * @returns {BABYLON.Color3} - Cor correspondente à temperatura
     */
    function _getColorForTemperature(temperature) {
        if (temperature === undefined) {
            return _colorSchemes.temperature.default;
        }
        
        const ranges = _colorSchemes.temperature.ranges;
        for (let i = 0; i < ranges.length; i++) {
            if (temperature <= ranges[i].max) {
                return ranges[i].color;
            }
        }
        
        return _colorSchemes.temperature.default;
    }
    
    /**
     * Obtém a cor padrão para um tipo de equipamento
     * @param {string} equipmentType - Tipo de equipamento
     * @returns {BABYLON.Color3} - Cor padrão
     */
    function _getDefaultColor(equipmentType) {
        return _colorSchemes.default[equipmentType] || _colorSchemes.default.default;
    }
    
    /**
     * Aplica uma cor a todos os meshes filhos de um nó
     * @param {BABYLON.TransformNode} node - Nó pai
     * @param {BABYLON.Color3} color - Cor a aplicar
     */
    function _applyColorToMeshes(node, color) {
        // Aplicar apenas às malhas principais, não a indicadores ou detalhes
        const mainMeshes = node.getChildMeshes().filter(mesh => {
            // Filtrar para aplicar apenas ao corpo principal
            // Evitar colorir indicadores de estado, níveis de produto, etc.
            return mesh.name.includes('_body') || 
                   (!mesh.name.includes('_level') && 
                    !mesh.name.includes('_indicator') && 
                    !mesh.name.includes('_state'));
        });
        
        mainMeshes.forEach(mesh => {
            if (mesh.material) {
                // Preservar propriedades do material, apenas mudar a cor
                if (mesh.material instanceof BABYLON.PBRMaterial) {
                    mesh.material.albedoColor = color;
                } else {
                    mesh.material.diffuseColor = color;
                }
            }
        });
    }
    
    /**
     * Colorize um objeto específico por ID
     * @param {string} objectId - ID do objeto
     * @param {BABYLON.Color3} color - Cor a aplicar
     */
    function colorizeObjectById(objectId, color) {
        // Buscar o objeto por ID
        let object = null;
        
        // Verificar em cada gerenciador
        if (TanksManager && TanksManager.getTankById) {
            object = TanksManager.getTankById(objectId);
        }
        
        if (!object && PipesManager && PipesManager.getPipeById) {
            object = PipesManager.getPipeById(objectId);
        }
        
        if (!object && ValvesManager && ValvesManager.getValveById) {
            object = ValvesManager.getValveById(objectId);
        }
        
        if (!object && LoadingAreasManager && LoadingAreasManager.getLoadingAreaById) {
            object = LoadingAreasManager.getLoadingAreaById(objectId);
        }
        
        if (object) {
            _applyColorToMeshes(object, color);
        }
    }
    
    /**
     * Restaura a coloração original com base no modo atual
     * @param {string} objectId - ID do objeto (opcional, se não fornecido restaura todos)
     */
    function restoreColors(objectId) {
        if (objectId) {
            // Restaurar um objeto específico
            let object = null;
            
            // Verificar em cada gerenciador
            if (TanksManager && TanksManager.getTankById) {
                object = TanksManager.getTankById(objectId);
            }
            
            if (!object && PipesManager && PipesManager.getPipeById) {
                object = PipesManager.getPipeById(objectId);
            }
            
            if (!object && ValvesManager && ValvesManager.getValveById) {
                object = ValvesManager.getValveById(objectId);
            }
            
            if (!object && LoadingAreasManager && LoadingAreasManager.getLoadingAreaById) {
                object = LoadingAreasManager.getLoadingAreaById(objectId);
            }
            
            if (object) {
                _colorizeObject(object, _currentMode);
            }
        } else {
            // Restaurar todos os objetos
            applyColorMode(_currentMode);
        }
    }
    
    /**
     * Obtém o modo de coloração atual
     * @returns {string} - Modo atual
     */
    function getCurrentMode() {
        return _currentMode;
    }
    
    /**
     * Obtém a legenda para o modo de coloração atual
     * @returns {Array} - Array de objetos {label, color} para a legenda
     */
    function getLegendForCurrentMode() {
        const legend = [];
        let scheme;
        
        switch (_currentMode) {
            case 'product':
                scheme = _colorSchemes.product;
                for (const product in scheme) {
                    if (product !== 'default') {
                        legend.push({
                            label: product,
                            color: scheme[product]
                        });
                    }
                }
                break;
                
            case 'status':
                scheme = _colorSchemes.status;
                for (const status in scheme) {
                    if (status !== 'default') {
                        legend.push({
                            label: _getStatusLabel(status),
                            color: scheme[status]
                        });
                    }
                }
                break;
                
            case 'temperature':
                const ranges = _colorSchemes.temperature.ranges;
                for (let i = 0; i < ranges.length; i++) {
                    const min = i === 0 ? -Infinity : ranges[i-1].max;
                    const max = ranges[i].max;
                    
                    let label;
                    if (min === -Infinity) {
                        label = `< ${max}°C`;
                    } else if (max === Infinity) {
                        label = `> ${min}°C`;
                    } else {
                        label = `${min}°C - ${max}°C`;
                    }
                    
                    legend.push({
                        label: label,
                        color: ranges[i].color
                    });
                }
                break;
                
            case 'default':
            default:
                scheme = _colorSchemes.default;
                for (const type in scheme) {
                    if (type !== 'default') {
                        legend.push({
                            label: _getEquipmentTypeLabel(type),
                            color: scheme[type]
                        });
                    }
                }
                break;
        }
        
        return legend;
    }
    
    /**
     * Obtém um rótulo legível para um tipo de status
     * @param {string} status - Código do status
     * @returns {string} - Rótulo legível
     */
    function _getStatusLabel(status) {
        const statusLabels = {
            'operational': 'Operacional',
            'maintenance': 'Em Manutenção',
            'fault': 'Com Falha',
            'offline': 'Desativado',
            'standby': 'Em Espera',
            'open': 'Aberta',
            'closed': 'Fechada',
            'partial': 'Parcialmente Aberta',
            'available': 'Disponível',
            'loading': 'Em Carregamento'
        };
        
        return statusLabels[status] || status;
    }
    
    /**
     * Obtém um rótulo legível para um tipo de equipamento
     * @param {string} type - Código do tipo
     * @returns {string} - Rótulo legível
     */
    function _getEquipmentTypeLabel(type) {
        const typeLabels = {
            'tank': 'Tanques',
            'pipe': 'Tubulações',
            'valve': 'Válvulas',
            'loadingArea': 'Áreas de Carregamento'
        };
        
        return typeLabels[type] || type;
    }
    
    /**
     * Destaca um objeto específico na cena
     * @param {string} objectId - ID do objeto
     * @param {boolean} highlight - Se deve destacar (true) ou remover destaque (false)
     */
    function highlightObject(objectId, highlight = true) {
        // Buscar o objeto por ID em todos os gerenciadores
        let object = null;
        
        if (TanksManager && TanksManager.getTankById) {
            object = TanksManager.getTankById(objectId);
        }
        
        if (!object && PipesManager && PipesManager.getPipeById) {
            object = PipesManager.getPipeById(objectId);
        }
        
        if (!object && ValvesManager && ValvesManager.getValveById) {
            object = ValvesManager.getValveById(objectId);
        }
        
        if (!object && LoadingAreasManager && LoadingAreasManager.getLoadingAreaById) {
            object = LoadingAreasManager.getLoadingAreaById(objectId);
        }
        
        if (!object) return;
        
        const mainMeshes = object.getChildMeshes();
        
        if (highlight) {
            // Salvar cores originais (se ainda não salvas)
            mainMeshes.forEach(mesh => {
                if (mesh.material && !mesh._originalColor) {
                    if (mesh.material instanceof BABYLON.PBRMaterial) {
                        mesh._originalColor = mesh.material.albedoColor.clone();
                        mesh.material.albedoColor = new BABYLON.Color3(1, 0.8, 0);  // Amarelo brilhante
                        mesh.material.emissiveColor = new BABYLON.Color3(0.5, 0.3, 0);  // Brilho alaranjado
                    } else {
                        mesh._originalColor = mesh.material.diffuseColor.clone();
                        mesh.material.diffuseColor = new BABYLON.Color3(1, 0.8, 0);  // Amarelo brilhante
                        mesh.material.emissiveColor = new BABYLON.Color3(0.5, 0.3, 0);  // Brilho alaranjado
                    }
                }
            });
            
            // Adicionar efeito de destaque (glow)
            if (_scene.highlightLayer) {
                mainMeshes.forEach(mesh => {
                    _scene.highlightLayer.addMesh(mesh, new BABYLON.Color3(1, 0.8, 0));
                });
            } else {
                // Criar highlight layer se não existir
                const highlightLayer = new BABYLON.HighlightLayer("highlightLayer", _scene);
                _scene.highlightLayer = highlightLayer;
                mainMeshes.forEach(mesh => {
                    highlightLayer.addMesh(mesh, new BABYLON.Color3(1, 0.8, 0));
                });
            }
        } else {
            // Remover destaque e restaurar cores originais
            if (_scene.highlightLayer) {
                mainMeshes.forEach(mesh => {
                    _scene.highlightLayer.removeMesh(mesh);
                    
                    // Restaurar cor original se existir
                    if (mesh._originalColor && mesh.material) {
                        if (mesh.material instanceof BABYLON.PBRMaterial) {
                            mesh.material.albedoColor = mesh._originalColor;
                            mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
                        } else {
                            mesh.material.diffuseColor = mesh._originalColor;
                            mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
                        }
                        mesh._originalColor = null;
                    }
                });
            }
        }
    }
    
    /**
     * Aplica uma pulsação visual a um objeto para destacá-lo temporariamente
     * @param {string} objectId - ID do objeto
     * @param {number} duration - Duração da pulsação em milissegundos
     */
    function pulseObject(objectId, duration = 2000) {
        // Destacar o objeto
        highlightObject(objectId, true);
        
        // Configurar timer para remover o destaque
        setTimeout(() => {
            highlightObject(objectId, false);
        }, duration);
    }
    
    /**
     * Aplica um gradiente de cores a uma tubulação para visualizar fluxo
     * @param {string} pipeId - ID da tubulação
     * @param {BABYLON.Color3} startColor - Cor inicial
     * @param {BABYLON.Color3} endColor - Cor final
     * @param {boolean} animate - Se deve animar o gradiente
     */
    function applyGradientToPipe(pipeId, startColor, endColor, animate = false) {
        if (!PipesManager || !PipesManager.getPipeById) return;
        
        const pipeNode = PipesManager.getPipeById(pipeId);
        if (!pipeNode) return;
        
        // Encontrar todos os segmentos da tubulação em ordem
        const segments = pipeNode.getChildMeshes().filter(mesh => 
            mesh.name.includes('segment')
        );
        
        if (segments.length === 0) return;
        
        // Se for animado, configurar animação de fluxo
        if (animate) {
            // Criar um observador para atualizar o gradiente ao longo do tempo
            const observer = _scene.onBeforeRenderObservable.add(() => {
                const time = performance.now() / 1000;
                const offset = (Math.sin(time) + 1) / 2; // Valor entre 0 e 1
                
                segments.forEach((segment, index) => {
                    // Calcular posição no gradiente com deslocamento
                    const t = ((index / (segments.length - 1)) + offset) % 1;
                    const color = BABYLON.Color3.Lerp(startColor, endColor, t);
                    
                    if (segment.material) {
                        if (segment.material instanceof BABYLON.PBRMaterial) {
                            segment.material.albedoColor = color;
                        } else {
                            segment.material.diffuseColor = color;
                        }
                    }
                });
            });
            
            // Salvar referência ao observador para poder removê-lo depois
            pipeNode._gradientObserver = observer;
        } else {
            // Aplicar gradiente estático
            segments.forEach((segment, index) => {
                const t = index / (segments.length - 1);
                const color = BABYLON.Color3.Lerp(startColor, endColor, t);
                
                if (segment.material) {
                    if (segment.material instanceof BABYLON.PBRMaterial) {
                        segment.material.albedoColor = color;
                    } else {
                        segment.material.diffuseColor = color;
                    }
                }
            });
        }
    }
    
    /**
     * Remove o gradiente de uma tubulação e restaura sua coloração original
     * @param {string} pipeId - ID da tubulação
     */
    function removeGradientFromPipe(pipeId) {
        if (!PipesManager || !PipesManager.getPipeById) return;
        
        const pipeNode = PipesManager.getPipeById(pipeId);
        if (!pipeNode) return;
        
        // Remover o observador de animação se existir
        if (pipeNode._gradientObserver) {
            _scene.onBeforeRenderObservable.remove(pipeNode._gradientObserver);
            pipeNode._gradientObserver = null;
        }
        
        // Restaurar a coloração original
        _colorizeObject(pipeNode, _currentMode);
    }
    
    // API pública
    return {
        initialize,
        applyColorMode,
        colorizeObjectById,
        restoreColors,
        getCurrentMode,
        getLegendForCurrentMode,
        highlightObject,
        pulseObject,
        applyGradientToPipe,
        removeGradientFromPipe
    };
})();

