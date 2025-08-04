import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface SourceNode {
  source_hostname: string;
  source_ip: string;
  port: string;
}

interface NetworkData {
  [key: string]: {
    dest_hostname: string;
    dest_ip: string;
    sources: SourceNode[];
  };
}

interface GraphNode {
  id: string;
  type: 'source' | 'destination';
  hostname: string;
  ip: string;
  port?: string;
  size: number;
  color: string;
  connectionCount?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface NetworkGraphProps {
  data: NetworkData;
  width: number;
  height: number;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, width, height }) => {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: []
  });

  // Function to determine source node color based on conditions
  const getSourceNodeColor = (source: SourceNode): string => {
    const port = parseInt(source.port);
    
    // Risk assessment logic - you can customize these conditions
    if (port === 22 || port === 3389 || port === 23) {
      return '#ff4444'; // RED - High risk ports (SSH, RDP, Telnet)
    } else if (port >= 1024 && port <= 5000) {
      return '#ffaa00'; // YELLOW - Medium risk range
    } else if (port === 80 || port === 443 || port === 53) {
      return '#00ff44'; // GREEN - Safe common ports (HTTP, HTTPS, DNS)
    } else {
      return '#ffaa00'; // YELLOW - Default for unknown
    }
  };

  useEffect(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const sourceNodeMap = new Map<string, GraphNode>();

    // Process each destination
    Object.entries(data).forEach(([destId, destInfo]) => {
      const connectionCount = destInfo.sources.length;
      
      // Add destination node with size based on connection count
      const destNode: GraphNode = {
        id: destId,
        type: 'destination',
        hostname: destInfo.dest_hostname,
        ip: destInfo.dest_ip,
        size: Math.max(8, Math.min(30, 8 + connectionCount * 2)), // Scale size based on connections
        color: '#4dd0e1', // Blue for destinations
        connectionCount
      };
      nodes.push(destNode);

      // Process sources for this destination
      destInfo.sources.forEach((source) => {
        const sourceId = `${source.source_ip}:${source.port}`;
        
        // Create or update source node
        if (!sourceNodeMap.has(sourceId)) {
          const sourceNode: GraphNode = {
            id: sourceId,
            type: 'source',
            hostname: source.source_hostname,
            ip: source.source_ip,
            port: source.port,
            size: 6,
            color: getSourceNodeColor(source)
          };
          sourceNodeMap.set(sourceId, sourceNode);
        }

        // Add link
        links.push({
          source: sourceId,
          target: destId
        });
      });
    });

    // Add all source nodes
    nodes.push(...Array.from(sourceNodeMap.values()));

    setGraphData({ nodes, links });
  }, [data]);

  return (
    <div className="relative">
      <ForceGraph2D
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor="transparent"
        nodeLabel={(node: any) => `
          <div class="bg-card border border-border rounded-lg p-3 shadow-lg">
            <div class="font-semibold text-foreground">${node.type === 'destination' ? 'Destination' : 'Source'}</div>
            <div class="text-sm text-muted-foreground">Host: ${node.hostname || 'Unknown'}</div>
            <div class="text-sm text-muted-foreground">IP: ${node.ip}</div>
            ${node.port ? `<div class="text-sm text-muted-foreground">Port: ${node.port}</div>` : ''}
            ${node.connectionCount ? `<div class="text-sm text-primary">Connections: ${node.connectionCount}</div>` : ''}
          </div>
        `}
        nodeColor={(node: any) => node.color}
        nodeVal={(node: any) => node.size}
        linkColor={() => '#666666'}
        linkWidth={1.5}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.hostname || node.ip;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();
          
          // Add glow effect for better visibility
          if (node.type === 'destination') {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          
          // Draw border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Draw label
          if (globalScale > 0.6) {
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth + 4, fontSize + 2];
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y + node.size + 2,
              bckgDimensions[0],
              bckgDimensions[1]
            );
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(
              label,
              node.x,
              node.y + node.size + 2 + fontSize / 2
            );
          }
        }}
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.02}
        cooldownTicks={100}
        enableNodeDrag={true}
        enablePanInteraction={true}
      />
    </div>
  );
};

export default NetworkGraph;