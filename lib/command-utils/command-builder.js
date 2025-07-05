const fs = require('fs');
const path = require('path');
const YamlGenerator = require('./generators/yaml-generator');
const ContentGenerator = require('./generators/content-generator');
const IntegrationGenerator = require('./generators/integration-generator');

class CommandBuilder {
  constructor(config) {
    if (!config.name) {
      throw new Error('Command name is required');
    }
    
    if (config.phases && !Array.isArray(config.phases)) {
      throw new Error('Phases must be an array');
    }
    
    this.config = config;
  }
  
  /**
   * Build complete command documentation
   */
  build() {
    const yamlGenerator = YamlGenerator;
    const contentGenerator = new ContentGenerator(this.config);
    const integrationGenerator = new IntegrationGenerator(this.config);
    
    return yamlGenerator.generate(this.config) + 
           contentGenerator.generate() + 
           integrationGenerator.generate();
  }
  
  /**
   * Build from existing command file, preserving custom content
   */
  buildFromExisting(existingPath) {
    if (!fs.existsSync(existingPath)) {
      return this.build();
    }
    
    const existingContent = fs.readFileSync(existingPath, 'utf8');
    
    // Extract YAML frontmatter
    const yamlMatch = existingContent.match(/^---\n([\s\S]*?)\n---/);
    if (yamlMatch && this.config.preserveCustomFields) {
      // Parse existing YAML and merge with new config
      const existingYaml = this.parseYaml(yamlMatch[1]);
      
      // Separate known fields from custom fields
      const knownFields = ['allowedTools', 'description'];
      const customFields = {};
      
      Object.entries(existingYaml).forEach(([key, value]) => {
        if (!knownFields.includes(key)) {
          customFields[key] = value;
        }
      });
      
      // Merge custom fields into config
      this.config.customFields = { ...customFields, ...this.config.customFields };
      
      // Update known fields with new values, keeping existing if not specified
      this.config.allowedTools = this.config.allowedTools || existingYaml.allowedTools;
      this.config.description = this.config.description || existingYaml.description;
    }
    
    return this.build();
  }
  
  /**
   * Create backup of existing file
   */
  backupExisting(filePath) {
    if (fs.existsSync(filePath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${filePath}.backup-${timestamp}`;
      fs.copyFileSync(filePath, backupPath);
      return backupPath;
    }
    return null;
  }
  
  
  parseYaml(yamlContent) {
    const result = {};
    const lines = yamlContent.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        // Convert key to camelCase for consistency
        const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        result[camelKey] = value;
      }
    });
    
    return result;
  }
}

module.exports = CommandBuilder;