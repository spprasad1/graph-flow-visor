import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DataUploaderProps {
  onDataLoad: (data: any) => void;
}

const DataUploader: React.FC<DataUploaderProps> = ({ onDataLoad }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleData = {
    "dest_001": {
      "dest_hostname": "web-server-01.company.com",
      "dest_ip": "192.168.1.100",
      "sources": [
        {
          "source_hostname": "user-pc-01.company.com",
          "source_ip": "192.168.1.10",
          "port": "80"
        },
        {
          "source_hostname": "admin-workstation.company.com",
          "source_ip": "192.168.1.15",
          "port": "22"
        },
        {
          "source_hostname": "monitoring-server.company.com",
          "source_ip": "192.168.1.20",
          "port": "443"
        }
      ]
    },
    "dest_002": {
      "dest_hostname": "database-server.company.com",
      "dest_ip": "192.168.1.200",
      "sources": [
        {
          "source_hostname": "app-server-01.company.com",
          "source_ip": "192.168.1.50",
          "port": "3306"
        },
        {
          "source_hostname": "backup-server.company.com",
          "source_ip": "192.168.1.60",
          "port": "22"
        }
      ]
    },
    "dest_003": {
      "dest_hostname": "file-server.company.com",
      "dest_ip": "192.168.1.150",
      "sources": [
        {
          "source_hostname": "user-pc-01.company.com",
          "source_ip": "192.168.1.10",
          "port": "445"
        },
        {
          "source_hostname": "user-pc-02.company.com",
          "source_ip": "192.168.1.11",
          "port": "445"
        },
        {
          "source_hostname": "user-pc-03.company.com",
          "source_ip": "192.168.1.12",
          "port": "445"
        },
        {
          "source_hostname": "admin-workstation.company.com",
          "source_ip": "192.168.1.15",
          "port": "3389"
        }
      ]
    }
  };

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(sampleData, null, 2));
    setError(null);
  };

  const handleParseData = () => {
    setIsLoading(true);
    setError(null);

    try {
      const parsedData = JSON.parse(jsonInput);
      
      // Validate data structure
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Data must be a valid JSON object');
      }

      // Check if it has the expected structure
      const keys = Object.keys(parsedData);
      if (keys.length === 0) {
        throw new Error('Data object cannot be empty');
      }

      // Validate structure of first entry
      const firstEntry = parsedData[keys[0]];
      if (!firstEntry.dest_hostname || !firstEntry.dest_ip || !Array.isArray(firstEntry.sources)) {
        throw new Error('Invalid data structure. Each destination must have dest_hostname, dest_ip, and sources array');
      }

      onDataLoad(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
        setError(null);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Network Data Input
        </CardTitle>
        <CardDescription>
          Upload or paste your network connection data in JSON format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleLoadSample}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Load Sample Data
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload JSON File
            </Button>
          </div>
        </div>

        <Textarea
          placeholder="Paste your JSON data here..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleParseData} 
          disabled={!jsonInput.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Processing...' : 'Generate Network Graph'}
        </Button>

        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Color Legend:</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-network-source-danger"></div>
              <span>High Risk (ports 22, 3389, 23)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-network-source-warning"></div>
              <span>Medium Risk (ports 1024-5000)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-network-source-safe"></div>
              <span>Safe (ports 80, 443, 53)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-network-destination"></div>
              <span>Destinations (size = connections)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataUploader;