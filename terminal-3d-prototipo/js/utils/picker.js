/**
 * ObjectPicker - Utilitário para seleção de objetos na cena 3D
 * 
 * Responsável por gerenciar a interação do usuário com objetos na cena,
 * incluindo seleção, destaque visual e rastreamento do objeto selecionado.
 */

const ObjectPicker = (function() {
    // Variáveis privadas
    let _scene = null;
    let _canvas = null;
    let _selectedObject = null;
    let _highlightLayer = null;
    let _pointerObserver = null;
    let _pointerMoveObserver = null;
    let _enabled = true;
    
    // Configurações
    const _config = {
        highlightColor: new BABYLON.Color3(1, 0.8, 0.2),  // Amarelo
        highlightIntensity: 0.5,
        outlineWidth: 0.02,
        tooltipDelay: 1000,  // Milissegundos para mostrar tooltip
        selectionMode: 'click',  // 'click' ou 'hover'
        hoverHighlight: true,
        clickSound: null  // Caminho para som de clique (opcional)
    };
    
    // Estado temporário
    let _hoveredObject = null;
    let _tooltipTimeout = null;
    let _currentTooltip = null;
    
    /**
     * Inicializa o seletor de objetos
     * @param {BABYLON.Scene} scene - Cena Babylon.js
     * @param {HTMLCanvasElement} canvas - Elemento canvas para capturar eventos
     * @returns {Promise} - Promessa resolvida quando a inicialização estiver completa
     */
    function initialize(scene, canvas) {
        _scene = scene;
        _canvas = canvas;
        
        // Criar camada de destaque
        _highlightLayer = new BABYLON.HighlightLayer("selectionHighlight", _scene);
        _highlightLayer.innerGlow = false;
        _highlightLayer.outerGlow = true;
        
        // Configurar observadores de eventos
        _setupEventObservers();
        
        // Configurar som de clique (opcional)
        if (_config.clickSound) {
            _loadSoundEffect(_config.clickSound);
        }
        
        return Promise.resolve();
    }
    
    /**
     * Configura os observadores de eventos para interação
     */
    function _setupEventObservers() {
        // Limpar observadores existentes se houver
        if (_pointerObserver) {
            _scene.onPointerObservable.remove(_pointerObserver);
        }
        
        if (_pointerMoveObserver) {
            _scene.onPointerObservable.remove(_pointerMoveObserver);
        }
        
        // Observador para cliques
        _pointerObserver = _scene.onPointerObservable.add((pointerInfo) => {
            if (!_enabled) return;
            
            // Processar apenas eventos de clique
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                _handlePointerDown(pointerInfo);
            }
        });
        
        // Observador para movimento do mouse (hover)
        _pointerMoveObserver = _scene.onPointerObservable.add((pointerInfo) => {
            if (!_enabled) return;
            
            // Processar apenas eventos de movimento
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
                _handlePointerMove(pointerInfo);
            }
        });
        
        // Evento para quando o mouse sai do canvas
        _canvas.addEventListener('mouseout', () => {
            _clearHoverState();
        });
        
        // Evento para tecla ESC (cancelar seleção)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearSelection();
            }
        });
    }
    
    /**
     * Manipula eventos de clique do mouse
     * @param {BABYLON.PointerInfo} pointerInfo - Informações do evento
     */
    function _handlePointerDown(pointerInfo) {
        // Verificar se foi um clique com botão principal (esquerdo)
        if (pointerInfo.event.button !== 0) return;
        
        // Verificar se há um objeto sob o ponteiro
        const pickResult = _scene.pick(
            _scene.pointerX, 
            _scene.pointerY, 
            (mesh) => mesh.isPickable
        );
        
        // Se encontramos um objeto válido
        if (pickResult.hit && pickResult.pickedMesh) {
            _processSelection(pickResult.pickedMesh);
            
            // Tocar som de clique se configurado
            if (_config.clickSound && _scene.soundsReady) {
                _scene.getSoundByName("clickSound").play();
            }
        } else {
            // Clique no vazio, limpar seleção
            clearSelection();
        }
    }
    
    /**
     * Manipula eventos de movimento do mouse
     * @param {BABYLON.PointerInfo} pointerInfo - Informações do evento
     */
    function _handlePointerMove(pointerInfo) {
        // Verificar se há um objeto sob o ponteiro
        const pickResult = _scene.pick(
            _scene.pointerX, 
            _scene.pointerY, 
            (mesh) => mesh.isPickable
        );
        
        // Se encontramos um objeto válido
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            
            // Se estivermos sobre um novo objeto
            if (_hoveredObject !== mesh) {
                // Limpar estado anterior
                _clearHoverState();
                
                // Definir novo objeto sob hover
                _hoveredObject = mesh;
                
                // Destacar o objeto se configurado
                if (_config.hoverHighlight && mesh !== _selectedObject) {
                    _highlightLayer.addMesh(mesh, _config.highlightColor, true);
                    mesh.renderOutline = true;
                    mesh.outlineColor = _config.highlightColor;
                    mesh.outlineWidth = _config.outlineWidth;
                }
                
                // Configurar tooltip após delay
                _tooltipTimeout = setTimeout(() => {
                    _showTooltip(mesh, pointerInfo.event);
                }, _config.tooltipDelay);
                
                // Atualizar cursor
                _canvas.style.cursor = 'pointer';
                
                // Se o modo de seleção for hover, selecionar o objeto
                if (_config.selectionMode === 'hover') {
                    _processSelection(mesh);
                }
            } else {
                // Mesmo objeto, apenas atualizar posição do tooltip
                if (_currentTooltip) {
                    _updateTooltipPosition(pointerInfo.event);
                }
            }
        } else {
            // Mouse não está sobre nenhum objeto
            _clearHoverState();
        }
    }
    
    /**
     * Limpa o estado de hover atual
     */
    function _clearHoverState() {
        if (_hoveredObject) {
            // Remover destaque se não for o objeto selecionado
            if (_hoveredObject !== _selectedObject) {
                _highlightLayer.removeMesh(_hoveredObject);
                _hoveredObject.renderOutline = false;
            }
            
            _hoveredObject = null;
        }
        
        // Limpar timeout do tooltip
        if (_tooltipTimeout) {
            clearTimeout(_tooltipTimeout);
            _tooltipTimeout = null;
        }
        
        // Remover tooltip existente
        if (_currentTooltip) {
            document.body.removeChild(_currentTooltip);
            _currentTooltip = null;
        }
        
        // Restaurar cursor
        _canvas.style.cursor = 'default';
    }
    
    /**
     * Processa a seleção de um objeto
     * @param {BABYLON.AbstractMesh} mesh - O objeto selecionado
     */
    function _processSelection(mesh) {
        // Se for o mesmo objeto já selecionado, ignorar
        if (mesh === _selectedObject) return;
        
        // Limpar seleção anterior
        clearSelection();
        
        // Definir novo objeto selecionado
        _selectedObject = mesh;
        
        // Aplicar destaque visual
        _highlightLayer.addMesh(mesh, _config.highlightColor, true);
        mesh.renderOutline = true;
        mesh.outlineColor = _config.highlightColor;
        mesh.outlineWidth = _config.outlineWidth;
        
        // Encontrar o objeto pai com metadados (pode ser um TransformNode pai)
        let objectWithMetadata = mesh;
        
        // Subir na hierarquia até encontrar metadados ou chegar à raiz
        while (objectWithMetadata && !objectWithMetadata.metadata) {
            if (objectWithMetadata.parent) {
                objectWithMetadata = objectWithMetadata.parent;
            } else {
                break;
            }
        }
        
        // Atualizar barra de status
        const statusElement = document.getElementById('selectedObject');
        if (statusElement) {
            if (objectWithMetadata && objectWithMetadata.metadata) {
                const type = objectWithMetadata.metadata.type || 'objeto';
                const id = objectWithMetadata.metadata.id || objectWithMetadata.name;
                statusElement.textContent = `Selecionado: ${type} ${id}`;
            } else {
                statusElement.textContent = `Selecionado: ${mesh.name || 'Objeto sem nome'}`;
            }
        }
        
        // Disparar evento de seleção
        const event = new CustomEvent('objectSelected', {
            detail: {
                object: objectWithMetadata,
                mesh: mesh
            }
        });
        document.dispatchEvent(event);
        
        // Armazenar referência global para acesso de outros módulos
        Terminal3D.selectedObjectId = objectWithMetadata.metadata ? 
            objectWithMetadata.metadata.id : mesh.name;
    }
    
    /**
     * Mostra um tooltip para o objeto
     * @param {BABYLON.AbstractMesh} mesh - O objeto sob hover
     * @param {MouseEvent} event - Evento do mouse
     */
    function _showTooltip(mesh, event) {
        // Verificar se já existe um tooltip
        if (_currentTooltip) {
            document.body.removeChild(_currentTooltip);
        }
        
        // Encontrar objeto com metadados
        let objectWithMetadata = mesh;
        while (objectWithMetadata && !objectWithMetadata.metadata) {
            if (objectWithMetadata.parent) {
                objectWithMetadata = objectWithMetadata.parent;
            } else {
                break;
            }
        }
        
        // Criar conteúdo do tooltip
        let tooltipContent = '';
        
        if (objectWithMetadata && objectWithMetadata.metadata) {
            const metadata = objectWithMetadata.metadata;
            const type = metadata.type || 'Objeto';
            const id = metadata.id || objectWithMetadata.name;
            
            tooltipContent = `<strong>${_formatType(type)}: ${id}</strong>`;
            
            // Adicionar informações adicionais se disponíveis
            if (metadata.data) {
                const data = metadata.data;
                
                if (data.product) {
                    tooltipContent += `<br>Produto: ${data.product}`;
                }
                
                if (data.state) {
                    tooltipContent += `<br>Estado: ${data.state}`;
                }
                
                if (data.level) {
                    const level = typeof data.level === 'number' ? 
                        `${(data.level * 100).toFixed(0)}%` : data.level;
                    tooltipContent += `<br>Nível: ${level}`;
                }
            }
        } else {
            tooltipContent = `<strong>${mesh.name || 'Objeto'}</strong>`;
        }
        
        // Criar elemento tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = tooltipContent;
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        _positionTooltip(tooltip, event);
        
        _currentTooltip = tooltip;
    }
    
    /**
     * Posiciona o tooltip próximo ao cursor
     * @param {HTMLElement} tooltip - Elemento do tooltip
     * @param {MouseEvent} event - Evento do mouse
     */
    function _positionTooltip(tooltip, event) {
        const x = event.clientX;
        const y = event.clientY;
        
        // Posicionar inicialmente
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 10}px`;
        
        // Ajustar se estiver fora da tela
        setTimeout(() => {
            const rect = tooltip.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            if (rect.right > windowWidth) {
                tooltip.style.left = `${x - rect.width - 10}px`;
            }
            
            if (rect.bottom > windowHeight) {
                tooltip.style.top = `${y - rect.height - 10}px`;
            }
        }, 0);
    }
    
    /**
     * Atualiza a posição do tooltip existente
     * @param {MouseEvent} event - Evento do mouse
     */
    function _updateTooltipPosition(event) {
        if (!_currentTooltip) return;
        _positionTooltip(_currentTooltip, event);
    }
    
    /**
     * Formata o tipo de objeto para exibição
     * @param {string} type - Tipo do objeto
     * @returns {string} - Tipo formatado
     */
    function _formatType(type) {
        switch (type.toLowerCase()) {
            case 'tank':
                return 'Tanque';
            case 'pipe':
                return 'Tubulação';
            case 'valve':
                return 'Válvula';
            case 'loadingarea':
                return 'Área de Carregamento';
            default:
                return type;
        }
    }
    
    /**
     * Carrega um efeito sonoro para feedback de clique
     * @param {string} soundUrl - URL do arquivo de som
     */
    function _loadSoundEffect(soundUrl) {
        // Criar e carregar o som
        const clickSound = new BABYLON.Sound(
            "clickSound", 
            soundUrl, 
            _scene, 
            null, 
            {
                volume: 0.5,
                playbackRate: 1,
                autoplay: false,
                loop: false
            }
        );
    }
    
    /**
     * Limpa a seleção atual
     */
    function clearSelection() {
        if (_selectedObject) {
            // Remover destaque visual
            _highlightLayer.removeMesh(_selectedObject);
            _selectedObject.renderOutline = false;
            
            // Limpar referência
            _selectedObject = null;
            
            // Atualizar barra de status
            const statusElement = document.getElementById('selectedObject');
            if (statusElement) {
                statusElement.textContent = 'Nenhum objeto selecionado';
            }
            
            // Limpar referência global
            Terminal3D.selectedObjectId = null;
            
            // Disparar evento de desseleção
            const event = new CustomEvent('objectDeselected');
            document.dispatchEvent(event);
        }
    }
    
    /**
     * Seleciona um objeto específico por ID
     * @param {string} objectId - ID do objeto a ser selecionado
     * @returns {boolean} - true se o objeto foi encontrado e selecionado
     */
    function selectObjectById(objectId) {
        if (!objectId) return false;
        
        // Procurar em todos os meshes da cena
        for (const mesh of _scene.meshes) {
            // Verificar se o próprio mesh tem o ID
            if (mesh.id === objectId || mesh.name === objectId) {
                _processSelection(mesh);
                return true;
            }
            
            // Verificar se o mesh tem metadados com o ID
            if (mesh.metadata && mesh.metadata.id === objectId) {
                _processSelection(mesh);
                return true;
            }
            
            // Verificar se algum pai na hierarquia tem o ID
            let parent = mesh.parent;
            while (parent) {
                if (parent.id === objectId || parent.name === objectId || 
                    (parent.metadata && parent.metadata.id === objectId)) {
                    _processSelection(mesh);
                    return true;
                }
                parent = parent.parent;
            }
        }
        
        // Verificar nos TransformNodes (que não são meshes)
        for (const node of _scene.transformNodes) {
            if (node.id === objectId || node.name === objectId || 
                (node.metadata && node.metadata.id === objectId)) {
                
                // Encontrar um mesh filho para selecionar
                const childMeshes = node.getChildMeshes();
                if (childMeshes.length > 0) {
                    _processSelection(childMeshes[0]);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Ativa ou desativa o seletor de objetos
     * @param {boolean} enabled - Se o seletor deve estar ativo
     */
    function setEnabled(enabled) {
        _enabled = enabled;
        
        if (!enabled) {
            // Limpar seleção e estado de hover
            clearSelection();
            _clearHoverState();
        }
    }
    
    /**
     * Define o modo de seleção
     * @param {string} mode - Modo ('click' ou 'hover')
     */
    function setSelectionMode(mode) {
        if (mode === 'click' || mode === 'hover') {
            _config.selectionMode = mode;
        }
    }
    
    /**
     * Ativa ou desativa o destaque ao passar o mouse
     * @param {boolean} enabled - Se o destaque deve estar ativo
     */
    function setHoverHighlight(enabled) {
        _config.hoverHighlight = enabled;
    }
    
    /**
     * Define a cor de destaque
     * @param {BABYLON.Color3} color - Nova cor de destaque
     */
    function setHighlightColor(color) {
        _config.highlightColor = color;
        
        // Atualizar objeto selecionado se houver
        if (_selectedObject) {
            _highlightLayer.removeMesh(_selectedObject);
            _highlightLayer.addMesh(_selectedObject, color, true);
            _selectedObject.outlineColor = color;
        }
    }
    
    /**
     * Obtém o objeto atualmente selecionado
     * @returns {BABYLON.AbstractMesh|null} - Objeto selecionado ou null
     */
    function getSelectedObject() {
        return _selectedObject;
    }
    
    /**
     * Obtém o objeto com metadados associado à seleção atual
     * @returns {BABYLON.AbstractMesh|BABYLON.TransformNode|null} - Objeto com metadados ou null
     */
    function getSelectedObjectWithMetadata() {
        if (!_selectedObject) return null;
        
        // Procurar objeto com metadados na hierarquia
        let obj = _selectedObject;
        while (obj && !obj.metadata) {
            if (obj.parent) {
                obj = obj.parent;
            } else {
                break;
            }
        }
        
        return obj && obj.metadata ? obj : null;
    }
    
    /**
     * Adiciona uma lista de objetos que devem ser ignorados pela seleção
     * @param {Array<BABYLON.AbstractMesh>} meshes - Lista de meshes para ignorar
     */
    function addIgnoredMeshes(meshes) {
        if (!Array.isArray(meshes)) return;
        
        for (const mesh of meshes) {
            if (mesh) {
                mesh.isPickable = false;
            }
        }
    }
    
    /**
     * Foca a câmera no objeto selecionado
     */
    function focusOnSelected() {
        if (!_selectedObject) return;
        
        SceneManager.focusOnObject(_selectedObject);
    }
    
    // API pública
    return {
        initialize,
        clearSelection,
        selectObjectById,
        setEnabled,
        setSelectionMode,
        setHoverHighlight,
        setHighlightColor,
        getSelectedObject,
        getSelectedObjectWithMetadata,
        addIgnoredMeshes,
        focusOnSelected
    };
})();
