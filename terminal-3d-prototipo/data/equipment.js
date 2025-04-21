/**
 * EquipmentData - Dados simulados de equipamentos
 * 
 * Este arquivo contém dados simulados para os equipamentos do terminal,
 * incluindo tanques, tubulações, válvulas e áreas de carregamento.
 * Em um ambiente de produção, estes dados viriam de uma API ou banco de dados.
 */

const EquipmentData = {
    /**
     * Dados dos tanques
     */
    tanks: [
        {
            id: 'TQ-0001',
            name: 'Tanque de Diesel S10 Principal',
            type: 'large',
            position: { x: -15, y: 0, z: -10 },
            product: 'Diesel S10',
            capacity: 5000,
            level: 0.85,
            temperature: 25.3,
            status: 'operational',
            lastInspection: '2023-06-15',
            details: {
                manufacturer: 'Petrobras Equipamentos',
                yearBuilt: 2018,
                material: 'Aço Carbono',
                coating: 'Epóxi interno',
                roofType: 'Teto fixo',
                mixers: true,
                heatingSystem: false
            }
        },
        {
            id: 'TQ-0002',
            name: 'Tanque de Gasolina',
            type: 'standard',
            position: { x: -8, y: 0, z: -10 },
            product: 'Gasolina',
            capacity: 3000,
            level: 0.65,
            temperature: 22.8,
            status: 'operational',
            lastInspection: '2023-04-10',
            details: {
                manufacturer: 'Petrobras Equipamentos',
                yearBuilt: 2019,
                material: 'Aço Carbono',
                coating: 'Epóxi interno',
                roofType: 'Teto flutuante',
                mixers: false,
                heatingSystem: false
            }
        },
        {
            id: 'TQ-0003',
            name: 'Tanque de Diesel Marítimo',
            type: 'standard',
            position: { x: -1, y: 0, z: -10 },
            product: 'Diesel Marítimo',
            capacity: 3000,
            level: 0.45,
            temperature: 23.5,
            status: 'maintenance',
            lastInspection: '2022-11-22',
            maintenanceInfo: {
                startDate: '2023-10-25',
                estimatedEndDate: '2023-11-10',
                type: 'Inspeção interna',
                responsible: 'Equipe de Manutenção T3'
            },
            details: {
                manufacturer: 'Petrobras Equipamentos',
                yearBuilt: 2017,
                material: 'Aço Carbono',
                coating: 'Epóxi interno',
                roofType: 'Teto fixo',
                mixers: true,
                heatingSystem: false
            }
        },
        {
            id: 'TQ-0004',
            name: 'Tanque de Óleo Lubrificante',
            type: 'small',
            position: { x: 6, y: 0, z: -10 },
            product: 'Óleo Lubrificante',
            capacity: 1000,
            level: 0.75,
            temperature: 35.2,
            status: 'operational',
            lastInspection: '2023-02-18',
            details: {
                manufacturer: 'TecTanques',
                yearBuilt: 2020,
                material: 'Aço Inox',
                coating: 'N/A',
                roofType: 'Teto fixo',
                mixers: true,
                heatingSystem: true
            }
        },
        {
            id: 'TQ-0005',
            name: 'Tanque de GLP',
            type: 'spherical',
            position: { x: 13, y: 0, z: -10 },
            product: 'GLP',
            capacity: 2000,
            level: 0.55,
            temperature: 18.6,
            pressure: 12.5,
            status: 'operational',
            lastInspection: '2023-01-05',
            details: {
                manufacturer: 'EsferoTech',
                yearBuilt: 2016,
                material: 'Aço Especial P355NL1',
                coating: 'Anticorrosivo externo',
                pressureRating: '16 bar',
                safetyValves: 4,
                coolingSystem: true
            }
        },
        {
            id: 'TQ-0006',
            name: 'Tanque de Água',
            type: 'small',
            position: { x: -20, y: 0, z: -5 },
            product: 'Água',
            capacity: 1000,
            level: 0.90,
            status: 'operational',
            purpose: 'Sistema de combate a incêndio',
            details: {
                manufacturer: 'AguaTech',
                yearBuilt: 2018,
                material: 'Aço Carbono',
                coating: 'Epóxi interno e externo',
                pumpSystem: true
            }
        },
        {
            id: 'TQ-0007',
            name: 'Tanque de Etanol',
            type: 'standard',
            position: { x: -20, y: 0, z: -15 },
            product: 'Etanol',
            capacity: 2500,
            level: 0.30,
            temperature: 21.4,
            status: 'offline',
            lastInspection: '2022-08-15',
            details: {
                manufacturer: 'Petrobras Equipamentos',
                yearBuilt: 2015,
                material: 'Aço Carbono',
                coating: 'Epóxi especial para álcool',
                roofType: 'Teto flutuante interno',
                mixers: false,
                heatingSystem: false
            }
        }
    ],

    /**
     * Dados das tubulações
     */
    pipes: [
        {
            id: 'PIPE-MAIN-01',
            name: 'Linha Principal de Diesel',
            size: 'large',
            materialType: 'standard',
            product: 'Diesel S10',
            diameter: 12, // polegadas
            pressure: 6.5, // bar
            flowRate: 350, // m³/h
            status: 'operational',
            points: [
                { x: -15, y: 0.5, z: -5 },
                { x: -15, y: 0.5, z: 5 },
                { x: 15, y: 0.5, z: 5 }
            ],
            details: {
                material: 'Aço Carbono',
                schedule: '40',
                insulation: false,
                heatTracing: false,
                yearInstalled: 2018
            }
        },
        {
            id: 'PIPE-CONN-01',
            name: 'Conexão Tanque Diesel S10',
            size: 'medium',
            materialType: 'standard',
            product: 'Diesel S10',
            diameter: 8, // polegadas
            pressure: 5.8, // bar
            flowRate: 150, // m³/h
            status: 'operational',
            points: [
                { x: -15, y: 0.5, z: -5 },
                { x: -15, y: 0.5, z: -8 },
                { x: -15, y: 0.5, z: -10 }
            ],
            details: {
                material: 'Aço Carbono',
                schedule: '40',
                insulation: false,
                heatTracing: false,
                yearInstalled: 2018
            }
        },
        {
            id: 'PIPE-CONN-02',
            name: 'Conexão Tanque Gasolina',
            size: 'medium',
            materialType: 'standard',
            product: 'Gasolina',
            diameter: 8, // polegadas
            pressure: 5.2, // bar
            flowRate: 120, // m³/h
            status: 'operational',
            points: [
                { x: -8, y: 0.5, z: 5 },
                { x: -8, y: 0.5, z: -10 }
            ],
            details: {
                material: 'Aço Carbono',
                schedule: '40',
                insulation: false,
                heatTracing: false,
                yearInstalled: 2019
            }
        },
        {
            id: 'PIPE-CONN-03',
            name: 'Conexão Tanque Diesel Marítimo',
            size: 'medium',
            materialType: 'standard',
            product: 'Diesel Marítimo',
            diameter: 8, // polegadas
            pressure: 5.5, // bar
            flowRate: 0, // m³/h (em manutenção)
            status: 'maintenance',
            points: [
                { x: -1, y: 0.5, z: 5 },
                { x: -1, y: 0.5, z: -10 }
            ],
            details: {
                material: 'Aço Carbono',
                schedule: '40',
                insulation: false,
                heatTracing: false,
                yearInstalled: 2017
            }
        },
        {
            id: 'PIPE-CONN-04',
            name: 'Conexão Tanque Óleo Lubrificante',
            size: 'small',
            materialType: 'standard',
            product: 'Óleo Lubrificante',
            diameter: 4, // polegadas
            pressure: 4.8, // bar
            flowRate: 30, // m³/h
            status: 'operational',
            points: [
                { x: 6, y: 0.5, z: 5 },
                { x: 6, y: 0.5, z: -10 }
            ],
            details: {
                material: 'Aço Inox',
                schedule: '40',
                insulation: true,
                heatTracing: true,
                yearInstalled: 2020
            }
        },
        {
            id: 'PIPE-HIGHTEMP-01',
            name: 'Linha de Vapor',
            size: 'medium',
            materialType: 'highTemp',
            product: 'Vapor',
            diameter: 6, // polegadas
            pressure: 8.5, // bar
            temperature: 180, // °C
            status: 'operational',
            points: [
                { x: 15, y: 0.5, z: -8 },
                { x: 15, y: 0.5, z: 5 },
                { x: 15, y: 0.5, z: 10 }
            ],
            details: {
                material: 'Aço Liga',
                schedule: '80',
                insulation: true,
                heatTracing: false,
                yearInstalled: 2018
            }
        },
        {
            id: 'PIPE-INSUL-01',
            name: 'Linha de GLP',
            size: 'small',
            materialType: 'insulated',
            product: 'GLP',
            diameter: 4, // polegadas
            pressure: 12.5, // bar
            temperature: 18.6, // °C
            status: 'operational',
            points: [
                { x: 13, y: 0.5, z: -10 },
                { x: 13, y: 0.5, z: 0 },
                { x: 10, y: 0.5, z: 0 },
                { x: 10, y: 0.5, z: 10 }
            ],
            details: {
                material: 'Aço Especial',
                schedule: '80',
                insulation: true,
                heatTracing: false,
                yearInstalled: 2016
            }
        },
        {
            id: 'PIPE-ELEV-01',
            name: 'Linha Elevada de Água',
            size: 'medium',
            materialType: 'standard',
            product: 'Água',
            diameter: 8, // polegadas
            pressure: 6.0, // bar
            status: 'operational',
            points: [
                { x: -10, y: 0.5, z: 8 },
                { x: -10, y: 4, z: 8 },
                { x: 5, y: 4, z: 8 },
                { x: 5, y: 0.5, z: 8 }
            ],
            details: {
                material: 'Aço Carbono',
                schedule: '40',
                insulation: false,
                heatTracing: false,
                purpose: 'Sistema de combate a incêndio',
                yearInstalled: 2018
            }
        }
    ],

    /**
     * Dados das válvulas
     */
    valves: [
        {
            id: 'XV-1001',
            name: 'Válvula de Bloqueio Principal',
            type: 'gate',
            position: { x: -15, y: 0.5, z: 0 },
            state: 'open',
            product: 'Diesel S10',
            diameter: 12, // polegadas
            pressure: 6.5, // bar
            lastMaintenance: '2023-07-10',
            details: {
                manufacturer: 'ValveTech',
                model: 'GT-1200',
                material: 'Aço Carbono',
                actuationType: 'Manual',
                yearInstalled: 2018
            }
        },
        {
            id: 'XV-1002',
            name: 'Válvula de Bloqueio Intermediária',
            type: 'gate',
            position: { x: -5, y: 0.5, z: 5 },
            state: 'open',
            product: 'Diesel S10',
            diameter: 12, // polegadas
            pressure: 6.3, // bar
            lastMaintenance: '2023-06-22',
            details: {
                manufacturer: 'ValveTech',
                model: 'GT-1200',
                material: 'Aço Carbono',
                actuationType: 'Manual',
                yearInstalled: 2018
            }
        },
        {
            id: 'XV-1003',
	    name: 'Válvula de Bloqueio Final',
            type: 'gate',
            position: { x: 5, y: 0.5, z: 5 },
            state: 'closed',
            product: 'Diesel S10',
            diameter: 12, // polegadas
            pressure: 0, // bar (fechada)
            lastMaintenance: '2023-08-05',
            details: {
                manufacturer: 'ValveTech',
                model: 'GT-1200',
                material: 'Aço Carbono',
                actuationType: 'Manual',
                yearInstalled: 2018
            }
        },
        {
            id: 'FV-1001',
            name: 'Válvula de Controle de Fluxo Diesel',
            type: 'control',
            position: { x: -10, y: 0.5, z: -8 },
            state: 'partial',
            openPercentage: 45,
            product: 'Diesel S10',
            diameter: 8, // polegadas
            pressure: 5.8, // bar
            flowRate: 75, // m³/h
            lastMaintenance: '2023-05-18',
            details: {
                manufacturer: 'FlowControl',
                model: 'FC-800',
                material: 'Aço Inox',
                actuationType: 'Elétrico',
                controlSystem: 'PID',
                yearInstalled: 2018
            }
        },
        {
            id: 'FV-1002',
            name: 'Válvula de Controle de Fluxo Diesel Marítimo',
            type: 'control',
            position: { x: 0, y: 0.5, z: -8 },
            state: 'open',
            openPercentage: 100,
            product: 'Diesel Marítimo',
            diameter: 8, // polegadas
            pressure: 5.5, // bar
            flowRate: 150, // m³/h
            lastMaintenance: '2023-04-12',
            details: {
                manufacturer: 'FlowControl',
                model: 'FC-800',
                material: 'Aço Inox',
                actuationType: 'Elétrico',
                controlSystem: 'PID',
                yearInstalled: 2017
            }
        },
        {
            id: 'RV-1001',
            name: 'Válvula de Retenção Linha Gasolina',
            type: 'check',
            position: { x: -8, y: 0.5, z: 0 },
            rotation: { y: Math.PI / 2 },
            state: 'open',
            product: 'Gasolina',
            diameter: 8, // polegadas
            pressure: 5.2, // bar
            lastMaintenance: '2023-03-25',
            details: {
                manufacturer: 'CheckValve Inc.',
                model: 'CV-800',
                material: 'Aço Carbono',
                type: 'Portinhola',
                springLoaded: true,
                yearInstalled: 2019
            }
        },
        {
            id: 'RV-1002',
            name: 'Válvula de Retenção Linha Óleo',
            type: 'check',
            position: { x: 8, y: 0.5, z: 0 },
            rotation: { y: Math.PI / 2 },
            state: 'open',
            product: 'Óleo Lubrificante',
            diameter: 4, // polegadas
            pressure: 4.8, // bar
            lastMaintenance: '2023-02-15',
            details: {
                manufacturer: 'CheckValve Inc.',
                model: 'CV-400',
                material: 'Aço Inox',
                type: 'Portinhola',
                springLoaded: true,
                yearInstalled: 2020
            }
        },
        {
            id: 'BV-1001',
            name: 'Válvula Esférica Linha Água',
            type: 'ball',
            position: { x: -12, y: 0.5, z: 8 },
            state: 'open',
            product: 'Água',
            diameter: 8, // polegadas
            pressure: 6.0, // bar
            lastMaintenance: '2023-08-20',
            details: {
                manufacturer: 'BallValve Co.',
                model: 'BV-800',
                material: 'Aço Inox',
                sealMaterial: 'PTFE',
                actuationType: 'Manual',
                yearInstalled: 2018
            }
        },
        {
            id: 'BV-1002',
            name: 'Válvula Esférica Linha Água 2',
            type: 'ball',
            position: { x: 0, y: 0.5, z: 8 },
            state: 'closed',
            product: 'Água',
            diameter: 8, // polegadas
            pressure: 0, // bar (fechada)
            lastMaintenance: '2023-07-05',
            details: {
                manufacturer: 'BallValve Co.',
                model: 'BV-800',
                material: 'Aço Inox',
                sealMaterial: 'PTFE',
                actuationType: 'Manual',
                yearInstalled: 2018
            }
        },
        {
            id: 'BFV-1001',
            name: 'Válvula Borboleta Linha Água',
            type: 'butterfly',
            position: { x: 10, y: 0.5, z: 8 },
            state: 'partial',
            openPercentage: 60,
            product: 'Água',
            diameter: 8, // polegadas
            pressure: 5.8, // bar
            lastMaintenance: '2023-06-10',
            details: {
                manufacturer: 'FlowTech',
                model: 'BFV-800',
                material: 'Aço Inox',
                sealMaterial: 'EPDM',
                actuationType: 'Alavanca',
                yearInstalled: 2018
            }
        },
        {
            id: 'XV-1004',
            name: 'Válvula de Bloqueio Vapor',
            type: 'gate',
            position: { x: 15, y: 0.5, z: -5 },
            state: 'maintenance',
            product: 'Vapor',
            diameter: 6, // polegadas
            pressure: 0, // bar (em manutenção)
            lastMaintenance: '2023-10-25',
            maintenanceInfo: {
                startDate: '2023-10-25',
                estimatedEndDate: '2023-11-02',
                type: 'Substituição de gaxetas',
                responsible: 'Equipe de Manutenção T2'
            },
            details: {
                manufacturer: 'ValveTech',
                model: 'GT-600-HT',
                material: 'Aço Liga',
                actuationType: 'Manual',
                highTemp: true,
                yearInstalled: 2018
            }
        },
        {
            id: 'XV-1005',
            name: 'Válvula de Bloqueio GLP',
            type: 'gate',
            position: { x: 15, y: 0.5, z: 0 },
            state: 'fault',
            product: 'GLP',
            diameter: 4, // polegadas
            pressure: 0, // bar (com falha)
            lastMaintenance: '2023-01-15',
            faultInfo: {
                detectedDate: '2023-10-28',
                type: 'Vazamento na haste',
                severity: 'Média',
                maintenancePlanned: '2023-11-05'
            },
            details: {
                manufacturer: 'ValveTech',
                model: 'GT-400-SP',
                material: 'Aço Especial',
                actuationType: 'Manual',
                yearInstalled: 2016
            }
        }
    ],

    /**
     * Dados das áreas de carregamento
     */
    loadingAreas: [
        {
            id: 'TRUCK-BAY-01',
            name: 'Baia de Carregamento de Caminhões 1',
            type: 'truckBay',
            position: { x: -20, y: 0, z: 15 },
            rotation: { y: Math.PI / 4 },
            state: 'available',
            product: 'Diesel S10',
            loadingArms: 2,
            capacity: 60, // m³/h
            lastMaintenance: '2023-09-10',
            details: {
                yearInstalled: 2018,
                loadingType: 'Top loading',
                vaporRecovery: true,
                automationLevel: 'Semi-automático',
                weighbridge: true
            }
        },
        {
            id: 'TRUCK-BAY-02',
            name: 'Baia de Carregamento de Caminhões 2',
            type: 'truckBay',
            position: { x: -10, y: 0, z: 15 },
            rotation: { y: Math.PI / 4 },
            state: 'loading',
            product: 'Gasolina',
            loadingArms: 2,
            capacity: 60, // m³/h
            currentOperation: {
                startTime: '14:30',
                estimatedEndTime: '15:15',
                truckId: 'PBR-5280',
                volume: 30, // m³
                progress: 65 // %
            },
            lastMaintenance: '2023-08-22',
            details: {
                yearInstalled: 2018,
                loadingType: 'Bottom loading',
                vaporRecovery: true,
                automationLevel: 'Automático',
                weighbridge: true
            }
        },
        {
            id: 'TRUCK-BAY-03',
            name: 'Baia de Carregamento de Caminhões 3',
            type: 'truckBay',
            position: { x: 0, y: 0, z: 15 },
            rotation: { y: Math.PI / 4 },
            state: 'maintenance',
            loadingArms: 2,
            capacity: 60, // m³/h
            lastMaintenance: '2023-10-26',
            maintenanceInfo: {
                startDate: '2023-10-26',
                estimatedEndDate: '2023-11-03',
                type: 'Manutenção preventiva',
                responsible: 'Equipe de Manutenção T1'
            },
            details: {
                yearInstalled: 2018,
                loadingType: 'Bottom loading',
                vaporRecovery: true,
                automationLevel: 'Automático',
                weighbridge: true
            }
        },
        {
            id: 'RAIL-LOAD-01',
            name: 'Carregamento Ferroviário',
            type: 'railLoading',
            position: { x: 20, y: 0, z: -15 },
            rotation: { y: Math.PI / 2 },
            state: 'available',
            product: 'Diesel S10',
            loadingArms: 3,
            capacity: 150, // m³/h
            lastMaintenance: '2023-07-15',
            details: {
                yearInstalled: 2019,
                loadingType: 'Top loading',
                vaporRecovery: true,
                automationLevel: 'Automático',
                railcarCapacity: 60, // m³ por vagão
                simultaneousRailcars: 3
            }
        },
        {
            id: 'MARINE-PIER-01',
            name: 'Píer Marítimo',
            type: 'marinePier',
            position: { x: -25, y: 0, z: -20 },
            state: 'loading',
            product: 'Diesel Marítimo',
            loadingArms: 4,
            capacity: 800, // m³/h
            currentOperation: {
                startTime: '08:00',
                estimatedEndTime: '20:00',
                vesselName: 'MV Petrobras Navigator',
                volume: 8500, // m³
                progress: 45 // %
            },
            lastMaintenance: '2023-05-20',
            details: {
                yearInstalled: 2017,
                maxVesselSize: 'Panamax',
                maxDraft: 12, // metros
                automationLevel: 'Totalmente automatizado',
                mooringSystem: 'Cabeços convencionais',
                fenderSystem: 'Pneumáticos'
            }
        },
        {
            id: 'BARGE-DOCK-01',
            name: 'Doca de Barcaças',
            type: 'bargeDock',
            position: { x: 25, y: 0, z: -20 },
            rotation: { y: Math.PI / 6 },
            state: 'available',
            product: 'Óleo Lubrificante',
            loadingArms: 2,
            capacity: 200, // m³/h
            lastMaintenance: '2023-04-10',
            details: {
                yearInstalled: 2020,
                maxBargeSize: 2000, // toneladas
                maxDraft: 4, // metros
                automationLevel: 'Semi-automático',
                mooringSystem: 'Cabeços convencionais'
            }
        }
    ],

    /**
     * Dados de alarmes ativos
     */
    alarms: [
        {
            id: 'ALM-2023-156',
            timestamp: '2023-10-28T14:23:45',
            type: 'Vazamento',
            priority: 'Alta',
            status: 'Ativo',
            description: 'Detectado vazamento na válvula XV-1005',
            location: 'Área de válvulas - Setor GLP',
            equipment: 'XV-1005',
            actions: [
                'Isolar área',
                'Acionar equipe de emergência',
                'Preparar para manutenção corretiva'
            ]
        },
        {
            id: 'ALM-2023-155',
            timestamp: '2023-10-27T18:45:12',
            type: 'Nível Alto',
            priority: 'Média',
            status: 'Ativo',
            description: 'Nível do tanque TQ-0001 acima de 85%',
            location: 'Área de tanques - Diesel S10',
            equipment: 'TQ-0001',
            actions: [
                'Monitorar taxa de enchimento',
                'Preparar plano de transferência'
            ]
        },
        {
            id: 'ALM-2023-154',
            timestamp: '2023-10-25T09:12:30',
            type: 'Manutenção Programada',
            priority: 'Baixa',
            status: 'Ativo',
            description: 'Tanque TQ-0003 em manutenção preventiva',
            location: 'Área de tanques - Diesel Marítimo',
            equipment: 'TQ-0003',
            actions: [
                'Seguir cronograma de manutenção',
                'Verificar disponibilidade de tanques alternativos'
            ]
        }
    ],

    /**
     * Dados de operações recentes
     */
    operations: [
        {
            id: 'OP-2023-425',
            type: 'Recebimento',
            product: 'Diesel S10',
            volume: 3500, // m³
            startTime: '2023-10-27T08:00:00',
            endTime: '2023-10-27T16:30:00',
            source: 'Navio MT Petrobras Supplier',
            destination: 'TQ-0001',
            status: 'Concluída',
            details: {
                flowRate: 420, // m³/h
                temperature: 25.3, // °C
                pressure: 6.5, // bar
                density: 0.845, // kg/L
                operator: 'João Silva'
            }
        },
        {
            id: 'OP-2023-426',
            type: 'Carregamento',
            product: 'Gasolina',
            volume: 30, // m³
            startTime: '2023-10-28T14:30:00',
            estimatedEndTime: '2023-10-28T15:15:00',
            source: 'TQ-0002',
            destination: 'Caminhão PBR-5280',
            status: 'Em Andamento',
            details: {
                flowRate: 60, // m³/h
                temperature: 22.8, // °C
                pressure: 5.2, // bar
                density: 0.735, // kg/L
                operator: 'Maria Oliveira'
            }
        },
        {
            id: 'OP-2023-427',
            type: 'Transferência',
            product: 'Diesel Marítimo',
            volume: 8500, // m³
            startTime: '2023-10-28T08:00:00',
            estimatedEndTime: '2023-10-28T20:00:00',
            source: 'Navio MV Petrobras Navigator',
            destination: 'MARINE-PIER-01',
            status: 'Em Andamento',
            details: {
                flowRate: 720, // m³/h
                temperature: 23.5, // °C
                pressure: 7.2, // bar
                density: 0.855, // kg/L
                operator: 'Carlos Santos'
            }
        },
        {
            id: 'OP-2023-428',
            type: 'Carregamento',
            product: 'Diesel S10',
            volume: 180, // m³
            startTime: '2023-10-29T09:00:00',
            estimatedEndTime: '2023-10-29T10:30:00',
            source: 'TQ-0001',
            destination: 'Trem de carga - 3 vagões',
            status: 'Agendada',
            details: {
                flowRate: 150, // m³/h
                operator: 'Roberto Almeida'
            }
        },
        {
            id: 'OP-2023-424',
            type: 'Transferência',
            product: 'Óleo Lubrificante',
            volume: 500, // m³
            startTime: '2023-10-26T10:00:00',
            endTime: '2023-10-26T14:30:00',
            source: 'TQ-0004',
            destination: 'Barcaça BG-045',
            status: 'Concluída',
            details: {
                flowRate: 120, // m³/h
                temperature: 35.2, // °C
                pressure: 4.8, // bar
                density: 0.880, // kg/L
                operator: 'Ana Ferreira'
            }
        }
    ],

    /**
     * Dados de manutenção programada
     */
    maintenanceSchedule: [
        {
            id: 'MAINT-2023-045',
            equipment: 'TQ-0003',
            type: 'Inspeção interna',
            status: 'Em Andamento',
            startDate: '2023-10-25',
            estimatedEndDate: '2023-11-10',
            description: 'Inspeção interna completa com limpeza de sedimentos e verificação de revestimento',
            responsible: 'Equipe de Manutenção T3',
            priority: 'Alta'
        },
        {
            id: 'MAINT-2023-046',
            equipment: 'XV-1004',
            type: 'Substituição de gaxetas',
            status: 'Em Andamento',
            startDate: '2023-10-25',
            estimatedEndDate: '2023-11-02',
            description: 'Substituição do conjunto de gaxetas e verificação da haste',
            responsible: 'Equipe de Manutenção T2',
            priority: 'Média'
        },
        {
            id: 'MAINT-2023-047',
            equipment: 'TRUCK-BAY-03',
            type: 'Manutenção preventiva',
            status: 'Em Andamento',
            startDate: '2023-10-26',
            estimatedEndDate: '2023-11-03',
            description: 'Manutenção preventiva nos braços de carregamento e sistemas de controle',
            responsible: 'Equipe de Manutenção T1',
            priority: 'Média'
        },
        {
            id: 'MAINT-2023-048',
            equipment: 'XV-1005',
            type: 'Reparo de vazamento',
            status: 'Agendada',
            startDate: '2023-11-05',
            estimatedEndDate: '2023-11-07',
            description: 'Reparo do vazamento na haste e substituição de vedações',
            responsible: 'Equipe de Manutenção T2',
            priority: 'Alta'
        },
        {
            id: 'MAINT-2023-049',
            equipment: 'MARINE-PIER-01',
            type: 'Inspeção estrutural',
            status: 'Agendada',
            startDate: '2023-11-15',
            estimatedEndDate: '2023-11-17',
            description: 'Inspeção estrutural do píer e verificação dos sistemas de amarração',
            responsible: 'Equipe de Engenharia Civil',
            priority: 'Média'
        }
    ],

    /**
     * Dados de inventário de produtos
     */
    inventory: [
        {
            product: 'Diesel S10',
            totalCapacity: 5000, // m³
            currentVolume: 4250, // m³
            tanks: ['TQ-0001'],
            averageTemperature: 25.3, // °C
            density: 0.845, // kg/L
            api: 36.0,
            lastQualityCheck: '2023-10-25',
            status: 'Conforme'
        },
        {
            product: 'Gasolina',
            totalCapacity: 3000, // m³
            currentVolume: 1950, // m³
            tanks: ['TQ-0002'],
            averageTemperature: 22.8, // °C
            density: 0.735, // kg/L
            api: 61.0,
            lastQualityCheck: '2023-10-26',
            status: 'Conforme'
        },
        {
            product: 'Diesel Marítimo',
            totalCapacity: 3000, // m³
            currentVolume: 1350, // m³
            tanks: ['TQ-0003'],
            averageTemperature: 23.5, // °C
            density: 0.855, // kg/L
            api: 34.0,
            lastQualityCheck: '2023-10-20',
            status: 'Em manutenção'
        },
        {
            product: 'Óleo Lubrificante',
            totalCapacity: 1000, // m³
            currentVolume: 750, // m³
            tanks: ['TQ-0004'],
            averageTemperature: 35.2, // °C
            density: 0.880, // kg/L
            api: 29.3,
            lastQualityCheck: '2023-10-24',
            status: 'Conforme'
        },
        {
            product: 'GLP',
            totalCapacity: 2000, // m³
            currentVolume: 1100, // m³
            tanks: ['TQ-0005'],
            averageTemperature: 18.6, // °C
            pressure: 12.5, // bar
            density: 0.550, // kg/L
            lastQualityCheck: '2023-10-27',
            status: 'Conforme'
        },
        {
            product: 'Etanol',
            totalCapacity: 2500, // m³
            currentVolume: 750, // m³
            tanks: ['TQ-0007'],
            averageTemperature: 21.4, // °C
            density: 0.790, // kg/L
            lastQualityCheck: '2023-09-15',
            status: 'Fora de operação'
        }
    ],

    /**
     * Dados de configuração do terminal
     */
    terminalConfig: {
        name: 'Terminal de Armazenamento e Distribuição',
        location: {
            latitude: -23.9618,
            longitude: -46.3322,
            address: 'Av. Portuária, 1000 - Porto Industrial'
        },
        capacity: {
            storage: 16500, // m³
            throughput: 5000 // m³/dia
        },
        operationalInfo: {
            operatingHours: '24/7',
            mainProducts: ['Diesel S10', 'Gasolina', 'Diesel Marítimo', 'GLP'],
            transportModes: ['Marítimo', 'Rodoviário', 'Ferroviário'],
            certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001']
        },
        safetyInfo: {
            emergencyContacts: [
                { name: 'Centro de Controle', phone: '(13) 3591-1000' },
                { name: 'Brigada de Emergência', phone: '(13) 3591-1112' }
            ],
            evacuationPoints: [
                { id: 'EP-01', location: 'Portão Principal', coordinates: { x: -30, y: 0, z: 20 } },
                { id: 'EP-02', location: 'Píer', coordinates: { x: -25, y: 0, z: -25 } }
            ],
            fireEquipment: [
                { id: 'FE-01', type: 'Hidrante', location: { x: -5, y: 0, z: 0 } },
                { id: 'FE-02', type: 'Hidrante', location: { x: 10, y: 0, z: -5 } },
                { id: 'FE-03', type: 'Canhão Monitor', location: { x: -15, y: 0, z: -15 } },
                { id: 'FE-04', type: 'Canhão Monitor', location: { x: 15, y: 0, z: -15 } }
            ]
        }
    }
};
            
