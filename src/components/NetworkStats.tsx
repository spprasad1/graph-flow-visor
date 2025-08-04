import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface NetworkStatsProps {
  data: any;
}

const NetworkStats: React.FC<NetworkStatsProps> = ({ data }) => {
  const stats = React.useMemo(() => {
    const destinations = Object.keys(data).length;
    let totalConnections = 0;
    let highRiskConnections = 0;
    let mediumRiskConnections = 0;
    let safeConnections = 0;
    const uniqueSources = new Set<string>();

    Object.values(data).forEach((dest: any) => {
      dest.sources.forEach((source: any) => {
        totalConnections++;
        uniqueSources.add(`${source.source_ip}:${source.port}`);
        
        const port = parseInt(source.port);
        if (port === 22 || port === 3389 || port === 23) {
          highRiskConnections++;
        } else if (port >= 1024 && port <= 5000) {
          mediumRiskConnections++;
        } else if (port === 80 || port === 443 || port === 53) {
          safeConnections++;
        } else {
          mediumRiskConnections++;
        }
      });
    });

    const mostConnectedDest = Object.entries(data).reduce((max: any, [id, dest]: [string, any]) => {
      return dest.sources.length > (max?.sources?.length || 0) ? { id, ...dest } : max;
    }, null);

    return {
      destinations,
      uniqueSources: uniqueSources.size,
      totalConnections,
      highRiskConnections,
      mediumRiskConnections,
      safeConnections,
      mostConnectedDest
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Destinations</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.destinations}</div>
          <p className="text-xs text-muted-foreground">
            Network endpoints
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Sources</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueSources}</div>
          <p className="text-xs text-muted-foreground">
            Connection origins
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalConnections}</div>
          <p className="text-xs text-muted-foreground">
            All network links
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="destructive" className="text-xs">High</Badge>
              <span className="text-sm font-medium">{stats.highRiskConnections}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge className="text-xs bg-network-source-warning text-primary-foreground">Medium</Badge>
              <span className="text-sm font-medium">{stats.mediumRiskConnections}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge className="text-xs bg-network-source-safe text-primary-foreground">Safe</Badge>
              <span className="text-sm font-medium">{stats.safeConnections}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.mostConnectedDest && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Most Connected Destination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hostname:</span>
                <span className="font-medium">{stats.mostConnectedDest.dest_hostname}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IP Address:</span>
                <span className="font-medium">{stats.mostConnectedDest.dest_ip}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connections:</span>
                <Badge variant="outline">{stats.mostConnectedDest.sources.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NetworkStats;