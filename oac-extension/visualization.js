/**
 * Network Analysis Visualization for Oracle Analytics Cloud
 * Interactive network graph for analyzing entity connections with risk assessment
 */

(function() {
    'use strict';

    // Define the visualization
    window.NetworkAnalysisVisualization = class {
        constructor() {
            this.svg = null;
            this.simulation = null;
            this.nodes = [];
            this.links = [];
            this.tooltip = null;
            this.zoom = null;
            this.container = null;
        }

        /**
         * Initialize the visualization
         */
        init(container, width, height) {
            this.container = container;
            this.width = width;
            this.height = height;

            // Clear any existing content
            container.innerHTML = '';

            // Create SVG container
            this.svg = d3.select(container)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'network-viz');

            // Create main group for zoom/pan
            this.g = this.svg.append('g');

            // Setup zoom behavior
            this.zoom = d3.zoom()
                .scaleExtent([0.1, 4])
                .on('zoom', (event) => {
                    this.g.attr('transform', event.transform);
                });

            this.svg.call(this.zoom);

            // Create tooltip
            this.tooltip = d3.select(container)
                .append('div')
                .attr('class', 'network-tooltip')
                .style('opacity', 0);

            // Initialize force simulation
            this.initSimulation();
        }

        /**
         * Initialize D3 force simulation
         */
        initSimulation() {
            this.simulation = d3.forceSimulation()
                .force('link', d3.forceLink().id(d => d.id).distance(80))
                .force('charge', d3.forceManyBody().strength(-300))
                .force('center', d3.forceCenter(this.width / 2, this.height / 2))
                .force('collision', d3.forceCollide().radius(d => d.radius + 5));
        }

        /**
         * Update visualization with new data
         */
        update(data, properties) {
            this.properties = properties || {};
            this.processData(data);
            this.render();
        }

        /**
         * Process OAC data into network format
         */
        processData(data) {
            const nodes = new Map();
            const links = [];

            // Process each data row
            data.forEach(row => {
                const destId = this.getColumnValue(row, 'destination_id');
                const destHostname = this.getColumnValue(row, 'destination_hostname') || '';
                const destIp = this.getColumnValue(row, 'destination_ip');
                const sourceHostname = this.getColumnValue(row, 'source_hostname') || '';
                const sourceIp = this.getColumnValue(row, 'source_ip');
                const port = this.getColumnValue(row, 'port');

                // Create destination node
                if (!nodes.has(destId)) {
                    nodes.set(destId, {
                        id: destId,
                        type: 'destination',
                        hostname: destHostname,
                        ip: destIp,
                        connectionCount: 0,
                        radius: this.properties.nodeSize || 8
                    });
                }

                // Create source node
                const sourceId = `${sourceIp}:${port}`;
                if (!nodes.has(sourceId)) {
                    nodes.set(sourceId, {
                        id: sourceId,
                        type: 'source',
                        hostname: sourceHostname,
                        ip: sourceIp,
                        port: port,
                        radius: (this.properties.nodeSize || 8) * 0.8
                    });
                }

                // Increment destination connection count
                nodes.get(destId).connectionCount++;

                // Create link
                links.push({
                    source: sourceId,
                    target: destId,
                    port: port
                });
            });

            // Convert to arrays and apply styling
            this.nodes = Array.from(nodes.values()).map(node => {
                if (node.type === 'destination') {
                    // Scale destination node size based on connections
                    node.radius = Math.max(
                        this.properties.nodeSize || 8,
                        Math.min(30, (this.properties.nodeSize || 8) + node.connectionCount * 2)
                    );
                    node.color = this.getDestinationColor();
                } else {
                    node.color = this.getSourceColor(node.port);
                }
                return node;
            });

            this.links = links;
        }

        /**
         * Get column value from OAC data row
         */
        getColumnValue(row, columnRole) {
            // OAC provides data in a specific format
            // This function extracts values based on the data role mapping
            const column = row[columnRole];
            return column ? column.value || column : null;
        }

        /**
         * Determine source node color based on port risk assessment
         */
        getSourceColor(port) {
            const portNum = parseInt(port);
            const scheme = this.properties.colorScheme || 'security';

            if (scheme === 'security') {
                // High risk ports (SSH, RDP, Telnet)
                if (portNum === 22 || portNum === 3389 || portNum === 23) {
                    return '#ff4444';
                }
                // Safe ports (HTTP, HTTPS, DNS)
                else if (portNum === 80 || portNum === 443 || portNum === 53) {
                    return '#00ff44';
                }
                // Medium risk (custom range or unknown)
                else {
                    return '#ffaa00';
                }
            } else if (scheme === 'traffic') {
                if (portNum === 22 || portNum === 3389 || portNum === 23) {
                    return '#ff6b35';
                } else if (portNum === 80 || portNum === 443 || portNum === 53) {
                    return '#4a90e2';
                } else {
                    return '#8e44ad';
                }
            }

            return '#666666'; // Default
        }

        /**
         * Get destination node color
         */
        getDestinationColor() {
            const scheme = this.properties.colorScheme || 'security';
            return scheme === 'security' ? '#4dd0e1' : '#2ecc71';
        }

        /**
         * Render the network visualization
         */
        render() {
            // Update simulation forces based on properties
            this.simulation
                .force('charge')
                .strength(this.properties.chargeStrength || -300);

            this.simulation
                .force('link')
                .strength(this.properties.linkStrength || 1);

            // Bind data to links
            const link = this.g.selectAll('.link')
                .data(this.links);

            link.exit().remove();

            const linkEnter = link.enter()
                .append('line')
                .attr('class', 'link')
                .style('stroke', '#666')
                .style('stroke-width', 1.5)
                .style('stroke-opacity', 0.6);

            // Bind data to nodes
            const node = this.g.selectAll('.node')
                .data(this.nodes);

            node.exit().remove();

            const nodeEnter = node.enter()
                .append('g')
                .attr('class', 'node')
                .call(this.drag());

            // Add circles for nodes
            nodeEnter.append('circle')
                .attr('r', d => d.radius)
                .style('fill', d => d.color)
                .style('stroke', '#fff')
                .style('stroke-width', 2);

            // Add labels if enabled
            if (this.properties.showLabels !== false) {
                nodeEnter.append('text')
                    .attr('dx', d => d.radius + 5)
                    .attr('dy', '.35em')
                    .style('font-size', '10px')
                    .style('fill', '#333')
                    .text(d => d.hostname || d.ip);
            }

            // Add tooltips if enabled
            if (this.properties.enableTooltips !== false) {
                nodeEnter
                    .on('mouseover', (event, d) => this.showTooltip(event, d))
                    .on('mouseout', () => this.hideTooltip());
            }

            // Update simulation
            this.simulation.nodes(this.nodes);
            this.simulation.force('link').links(this.links);

            // Restart simulation
            this.simulation.alpha(1).restart();

            // Update positions on simulation tick
            this.simulation.on('tick', () => {
                linkEnter.merge(link)
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                nodeEnter.merge(node)
                    .attr('transform', d => `translate(${d.x},${d.y})`);
            });
        }

        /**
         * Create drag behavior for nodes
         */
        drag() {
            return d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                });
        }

        /**
         * Show tooltip with node information
         */
        showTooltip(event, d) {
            const content = `
                <div class="tooltip-header">${d.type === 'destination' ? 'Destination' : 'Source'}</div>
                <div class="tooltip-content">
                    <div><strong>Hostname:</strong> ${d.hostname || 'Unknown'}</div>
                    <div><strong>IP:</strong> ${d.ip}</div>
                    ${d.port ? `<div><strong>Port:</strong> ${d.port}</div>` : ''}
                    ${d.connectionCount ? `<div><strong>Connections:</strong> ${d.connectionCount}</div>` : ''}
                </div>
            `;

            this.tooltip
                .style('opacity', 1)
                .html(content)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        }

        /**
         * Hide tooltip
         */
        hideTooltip() {
            this.tooltip.style('opacity', 0);
        }

        /**
         * Resize the visualization
         */
        resize(width, height) {
            this.width = width;
            this.height = height;

            if (this.svg) {
                this.svg
                    .attr('width', width)
                    .attr('height', height);

                this.simulation
                    .force('center', d3.forceCenter(width / 2, height / 2))
                    .alpha(1)
                    .restart();
            }
        }

        /**
         * Cleanup resources
         */
        destroy() {
            if (this.simulation) {
                this.simulation.stop();
            }
            if (this.container) {
                this.container.innerHTML = '';
            }
        }
    };

    // Register visualization with OAC
    if (window.oracleAnalyticsCloud) {
        window.oracleAnalyticsCloud.registerVisualization('network-analysis-viz', {
            create: function(container, width, height) {
                const viz = new NetworkAnalysisVisualization();
                viz.init(container, width, height);
                return viz;
            }
        });
    }

})();