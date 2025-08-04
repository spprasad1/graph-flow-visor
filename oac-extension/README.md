# Network Analysis Visualization for Oracle Analytics Cloud

An interactive network graph visualization extension for Oracle Analytics Cloud that analyzes connections between entities with built-in risk assessment capabilities.

## Features

- **Interactive Network Graph**: Zoom, pan, and drag nodes for optimal viewing
- **Risk-Based Color Coding**: Automatic color assignment based on port risk levels
- **Dynamic Node Sizing**: Destination nodes scale based on connection count
- **Detailed Tooltips**: Hover information showing hostnames, IPs, ports, and connection counts
- **Customizable Properties**: Adjust appearance, behavior, and risk assessment rules
- **Multiple Color Schemes**: Security, traffic, and custom color options
- **Export Capabilities**: PNG, SVG, and PDF export options

## Data Requirements

### Required Columns

| Column Name | Type | Description | Example |
|-------------|------|-------------|---------|
| Destination ID | Dimension | Unique identifier for destinations | `dest_001`, `dest_002` |
| Destination IP | Dimension | IP address of destination | `192.168.1.100` |
| Source IP | Dimension | IP address of source | `192.168.1.10` |
| Port | Dimension | Connection port number | `80`, `443`, `22` |

### Optional Columns

| Column Name | Type | Description | Example |
|-------------|------|-------------|---------|
| Destination Hostname | Dimension | Hostname of destination | `web-server-01.company.com` |
| Source Hostname | Dimension | Hostname of source | `user-pc-01.company.com` |
| Connection Count | Measure | Number of connections | `5`, `10`, `15` |

## Installation

1. **Download the Extension**: Download all files from the `oac-extension` folder
2. **Create DVA Package**: 
   ```bash
   # Create a zip file with all extension files
   zip network-analysis-viz.dva manifest.json visualization.js config.js style.css
   ```
3. **Upload to OAC**:
   - Navigate to Console → Extensions
   - Click "Upload Extension"
   - Select the `network-analysis-viz.dva` file
   - Enable the extension

## Configuration Options

### Appearance
- **Base Node Size**: Controls the minimum size of network nodes (4-20 pixels)
- **Color Scheme**: Choose between Security, Traffic, or Custom color schemes
- **Show Node Labels**: Toggle visibility of hostname/IP labels

### Behavior
- **Connection Strength**: Adjust the force simulation link strength (0.1-3.0)
- **Node Repulsion**: Control how strongly nodes repel each other (-1000 to -50)
- **Enable Tooltips**: Show/hide detailed hover information

### Risk Assessment
- **High Risk Ports**: Comma-separated list of high-risk ports (default: 22,3389,23)
- **Safe Ports**: Comma-separated list of safe ports (default: 80,443,53)
- **Highlight Critical Paths**: Emphasize connections to critical destinations

## Color Coding Logic

### Security Scheme (Default)
- 🔴 **Red (High Risk)**: SSH (22), RDP (3389), Telnet (23)
- 🟡 **Yellow (Medium Risk)**: Custom port ranges or unknown ports
- 🟢 **Green (Safe)**: HTTP (80), HTTPS (443), DNS (53)
- 🔵 **Blue (Destinations)**: All destination nodes

### Traffic Scheme
- 🟠 **Orange**: High-traffic ports
- 🟣 **Purple**: Medium-traffic ports  
- 🔵 **Blue**: Standard traffic ports
- 🟢 **Green**: Destination nodes

## Usage Examples

### Basic Network Security Analysis
```sql
SELECT 
    server_id as "Destination ID",
    server_hostname as "Destination Hostname", 
    server_ip as "Destination IP",
    client_hostname as "Source Hostname",
    client_ip as "Source IP",
    port_number as "Port"
FROM network_connections
WHERE connection_date >= CURRENT_DATE - 7
```

### Aggregated Connection Analysis
```sql
SELECT 
    dest_server as "Destination ID",
    dest_hostname as "Destination Hostname",
    dest_ip as "Destination IP", 
    src_hostname as "Source Hostname",
    src_ip as "Source IP",
    port as "Port",
    COUNT(*) as "Connection Count"
FROM connection_logs
GROUP BY dest_server, dest_hostname, dest_ip, src_hostname, src_ip, port
```

## Troubleshooting

### Common Issues

1. **Visualization Not Loading**
   - Verify D3.js library is available in OAC environment
   - Check browser console for JavaScript errors
   - Ensure all required data columns are mapped

2. **Nodes Not Appearing**
   - Verify data contains valid IP addresses
   - Check that Port column contains numeric values
   - Ensure Destination ID column has unique values

3. **Performance Issues**
   - Limit data to reasonable size (< 1000 nodes recommended)
   - Consider aggregating data at source level
   - Adjust force simulation parameters

### Data Validation

The extension performs automatic validation:
- Checks for required column mappings
- Validates IP address formats
- Ensures port numbers are numeric
- Warns about missing optional columns

## Browser Compatibility

- **Supported**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Requires**: ES6 support, SVG support, Canvas API
- **Recommended**: Modern browsers with hardware acceleration

## Performance Recommendations

- **Optimal Data Size**: 100-500 network connections
- **Maximum Recommended**: 1000 connections
- **Large Datasets**: Use data aggregation and filtering in OAC

## Security Considerations

- Extension runs in OAC's sandboxed environment
- No external network calls or data transmission
- All processing happens client-side
- Respects OAC's security policies and data governance

## Support and Customization

For custom risk assessment rules, additional color schemes, or specific organizational requirements, the extension can be modified by updating:

- `getSourceColor()` function in `visualization.js`
- Color scheme definitions in `config.js` 
- Risk assessment logic in property panels

## Version History

- **v1.0.0**: Initial release with core network analysis features
- Risk-based color coding
- Interactive force simulation
- Property panel configuration
- Export capabilities