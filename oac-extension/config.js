/**
 * Configuration module for Network Analysis Visualization
 * Handles property panels and user interactions in Oracle Analytics Cloud
 */

(function() {
    'use strict';

    window.NetworkAnalysisConfig = {
        
        /**
         * Define property panel configuration
         */
        getPropertyPanelConfig: function() {
            return {
                sections: [
                    {
                        name: 'appearance',
                        displayName: 'Appearance',
                        properties: [
                            {
                                name: 'nodeSize',
                                displayName: 'Base Node Size',
                                type: 'slider',
                                min: 4,
                                max: 20,
                                step: 1,
                                defaultValue: 8,
                                description: 'Controls the base size of network nodes'
                            },
                            {
                                name: 'colorScheme',
                                displayName: 'Color Scheme',
                                type: 'dropdown',
                                options: [
                                    { value: 'security', label: 'Security (Red/Yellow/Green)' },
                                    { value: 'traffic', label: 'Traffic (Blue/Orange/Purple)' },
                                    { value: 'custom', label: 'Custom Colors' }
                                ],
                                defaultValue: 'security',
                                description: 'Color scheme for risk level visualization'
                            },
                            {
                                name: 'showLabels',
                                displayName: 'Show Node Labels',
                                type: 'checkbox',
                                defaultValue: true,
                                description: 'Display hostname/IP labels next to nodes'
                            }
                        ]
                    },
                    {
                        name: 'behavior',
                        displayName: 'Behavior',
                        properties: [
                            {
                                name: 'linkStrength',
                                displayName: 'Connection Strength',
                                type: 'slider',
                                min: 0.1,
                                max: 3.0,
                                step: 0.1,
                                defaultValue: 1.0,
                                description: 'Strength of connections in the force simulation'
                            },
                            {
                                name: 'chargeStrength',
                                displayName: 'Node Repulsion',
                                type: 'slider',
                                min: -1000,
                                max: -50,
                                step: 10,
                                defaultValue: -300,
                                description: 'How strongly nodes repel each other'
                            },
                            {
                                name: 'enableTooltips',
                                displayName: 'Enable Tooltips',
                                type: 'checkbox',
                                defaultValue: true,
                                description: 'Show detailed information when hovering over nodes'
                            }
                        ]
                    },
                    {
                        name: 'risk',
                        displayName: 'Risk Assessment',
                        properties: [
                            {
                                name: 'highRiskPorts',
                                displayName: 'High Risk Ports',
                                type: 'text',
                                defaultValue: '22,3389,23',
                                description: 'Comma-separated list of high-risk port numbers'
                            },
                            {
                                name: 'safePorts',
                                displayName: 'Safe Ports',
                                type: 'text',
                                defaultValue: '80,443,53',
                                description: 'Comma-separated list of safe port numbers'
                            },
                            {
                                name: 'highlightCritical',
                                displayName: 'Highlight Critical Paths',
                                type: 'checkbox',
                                defaultValue: false,
                                description: 'Emphasize connections to critical destinations'
                            }
                        ]
                    }
                ]
            };
        },

        /**
         * Validate data mapping requirements
         */
        validateDataMapping: function(dataMapping) {
            const errors = [];
            const warnings = [];

            // Check required fields
            if (!dataMapping.destination_id || dataMapping.destination_id.length === 0) {
                errors.push('Destination ID is required');
            }

            if (!dataMapping.destination_ip || dataMapping.destination_ip.length === 0) {
                errors.push('Destination IP is required');
            }

            if (!dataMapping.source_ip || dataMapping.source_ip.length === 0) {
                errors.push('Source IP is required');
            }

            if (!dataMapping.port || dataMapping.port.length === 0) {
                errors.push('Port is required');
            }

            // Check optional but recommended fields
            if (!dataMapping.destination_hostname || dataMapping.destination_hostname.length === 0) {
                warnings.push('Destination Hostname is recommended for better visualization');
            }

            if (!dataMapping.source_hostname || dataMapping.source_hostname.length === 0) {
                warnings.push('Source Hostname is recommended for better visualization');
            }

            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };
        },

        /**
         * Get sample data structure for user guidance
         */
        getSampleDataStructure: function() {
            return {
                description: 'Network Analysis requires the following data structure:',
                requiredColumns: [
                    {
                        name: 'Destination ID',
                        type: 'Dimension',
                        example: 'dest_001, dest_002',
                        description: 'Unique identifier for each destination'
                    },
                    {
                        name: 'Destination IP',
                        type: 'Dimension', 
                        example: '192.168.1.100',
                        description: 'IP address of the destination'
                    },
                    {
                        name: 'Source IP',
                        type: 'Dimension',
                        example: '192.168.1.10',
                        description: 'IP address of the source'
                    },
                    {
                        name: 'Port',
                        type: 'Dimension',
                        example: '80, 443, 22',
                        description: 'Port number for the connection'
                    }
                ],
                optionalColumns: [
                    {
                        name: 'Destination Hostname',
                        type: 'Dimension',
                        example: 'web-server-01.company.com',
                        description: 'Hostname of the destination'
                    },
                    {
                        name: 'Source Hostname', 
                        type: 'Dimension',
                        example: 'user-pc-01.company.com',
                        description: 'Hostname of the source'
                    },
                    {
                        name: 'Connection Count',
                        type: 'Measure',
                        example: '5, 10, 15',
                        description: 'Number of connections (for aggregated data)'
                    }
                ]
            };
        },

        /**
         * Generate property change handlers
         */
        getPropertyChangeHandlers: function() {
            return {
                nodeSize: function(newValue, visualization) {
                    if (visualization && visualization.properties) {
                        visualization.properties.nodeSize = newValue;
                        visualization.render();
                    }
                },

                colorScheme: function(newValue, visualization) {
                    if (visualization && visualization.properties) {
                        visualization.properties.colorScheme = newValue;
                        visualization.render();
                    }
                },

                showLabels: function(newValue, visualization) {
                    if (visualization && visualization.properties) {
                        visualization.properties.showLabels = newValue;
                        visualization.render();
                    }
                },

                linkStrength: function(newValue, visualization) {
                    if (visualization && visualization.simulation) {
                        visualization.properties.linkStrength = newValue;
                        visualization.simulation.force('link').strength(newValue);
                        visualization.simulation.alpha(0.3).restart();
                    }
                },

                chargeStrength: function(newValue, visualization) {
                    if (visualization && visualization.simulation) {
                        visualization.properties.chargeStrength = newValue;
                        visualization.simulation.force('charge').strength(newValue);
                        visualization.simulation.alpha(0.3).restart();
                    }
                },

                enableTooltips: function(newValue, visualization) {
                    if (visualization && visualization.properties) {
                        visualization.properties.enableTooltips = newValue;
                        // Re-bind tooltip events
                        visualization.render();
                    }
                }
            };
        },

        /**
         * Export functionality for the visualization
         */
        getExportOptions: function() {
            return {
                formats: ['PNG', 'SVG', 'PDF'],
                
                exportAsPNG: function(visualization, options) {
                    // Implementation for PNG export
                    const svg = visualization.svg.node();
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    
                    // Set canvas size
                    canvas.width = options.width || visualization.width;
                    canvas.height = options.height || visualization.height;
                    
                    // Convert SVG to canvas and download
                    // Note: This is a simplified implementation
                    return this.downloadCanvas(canvas, 'network-analysis.png');
                },

                exportAsSVG: function(visualization, options) {
                    // Implementation for SVG export
                    const svgData = new XMLSerializer().serializeToString(visualization.svg.node());
                    const blob = new Blob([svgData], { type: 'image/svg+xml' });
                    this.downloadBlob(blob, 'network-analysis.svg');
                },

                downloadCanvas: function(canvas, filename) {
                    canvas.toBlob(function(blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        a.click();
                        URL.revokeObjectURL(url);
                    });
                },

                downloadBlob: function(blob, filename) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            };
        }
    };

})();