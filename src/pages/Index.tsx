import React, { useState } from 'react';
import NetworkGraph from '@/components/NetworkGraph';
import DataUploader from '@/components/DataUploader';
import NetworkStats from '@/components/NetworkStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, BarChart3 } from 'lucide-react';

const Index = () => {
  const [networkData, setNetworkData] = useState<any>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 800, height: 600 });

  React.useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('#graph-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setGraphDimensions({
          width: Math.max(600, rect.width - 40),
          height: Math.max(400, window.innerHeight * 0.6)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [networkData]);

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Network Analysis Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visualize and analyze network connections between entities. Upload your data to see interactive graphs 
            with color-coded risk levels and connection patterns.
          </p>
        </div>

        {/* Data Upload Section */}
        <DataUploader onDataLoad={setNetworkData} />

        {networkData && (
          <>
            {/* Statistics Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Network Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NetworkStats data={networkData} />
              </CardContent>
            </Card>

            {/* Network Graph Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Topology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  id="graph-container" 
                  className="w-full bg-gradient-to-br from-background to-muted/20 rounded-lg border"
                  style={{ height: `${graphDimensions.height}px` }}
                >
                  <NetworkGraph 
                    data={networkData} 
                    width={graphDimensions.width}
                    height={graphDimensions.height}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Zoom:</strong> Use mouse wheel to zoom in/out of the network graph</p>
                <p>• <strong>Pan:</strong> Click and drag to move around the graph</p>
                <p>• <strong>Node Details:</strong> Hover over nodes to see detailed information</p>
                <p>• <strong>Drag Nodes:</strong> Click and drag individual nodes to rearrange the layout</p>
                <p>• <strong>Color Coding:</strong> Red = High risk, Yellow = Medium risk, Green = Safe, Blue = Destinations</p>
                <p>• <strong>Node Size:</strong> Destination nodes scale with the number of incoming connections</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
