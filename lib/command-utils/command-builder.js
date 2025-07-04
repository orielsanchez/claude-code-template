const fs = require('fs');
const path = require('path');
const { generateHeader, generateUsageExamples } = require('./generators/command-header');
const { generatePhaseContent } = require('./generators/phase-content');
const { loadTemplate } = require('./templates/template-loader');

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
    let output = '';
    
    // Add YAML frontmatter
    output += generateHeader({
      allowedTools: this.config.allowedTools || 'all',
      description: this.config.description,
      customFields: this.config.customFields || {}
    });
    
    // Add title
    const title = this.generateTitle();
    output += `# ${title}\n\n`;
    
    // Add subtitle if provided
    if (this.config.subtitle) {
      output += `${this.config.subtitle}\n\n`;
    }
    
    // Add usage examples if provided
    if (this.config.usageExamples) {
      output += generateUsageExamples(this.config.usageExamples);
      // Only add extra spacing for workflow commands, not utility commands
      if (this.config.type === 'workflow' || this.config.phases) {
        output += '\n';
      }
    }
    
    // Add command-specific content
    output += this.generateCommandContent();
    
    // Add phases for workflow commands
    if (this.config.phases && this.config.type !== 'utility') {
      output += this.generatePhases();
    }
    
    // Add integration patterns
    if (this.config.integrations) {
      output += this.generateIntegrations();
    }
    
    // Add quality standards for workflow and quality commands
    if (this.config.type === 'workflow' || this.config.type === 'quality' || this.config.phases) {
      output += '\n' + loadTemplate('quality-standards') + '\n';
    }
    
    // Add learning integration only for workflow commands
    if (this.config.type === 'workflow' || this.config.phases) {
      output += loadTemplate('learning-integration');
    }
    
    return output;
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
  
  generateTitle() {
    const titles = {
      dev: 'TDD-First Development Workflow',
      debug: 'Systematic Debugging & Root Cause Analysis',
      refactor: 'Systematic Refactoring & Code Improvement',
      check: 'Quality Verification & Standards Enforcement',
      ship: 'Documentation Updates & Commit Workflow',
      help: 'Interactive Help & Guidance System',
      prompt: 'Context Handoff System',
      'claude-md': 'CLAUDE.md Maintenance'
    };
    
    return titles[this.config.name] || `${this.config.name.charAt(0).toUpperCase()}${this.config.name.slice(1)} Command`;
  }
  
  generateCommandContent() {
    let content = '';
    
    // Add command-specific opening content
    if (this.config.type === 'workflow' || this.config.phases) {
      content += this.generateWorkflowIntro();
    }
    
    // Add custom content if provided
    if (this.config.content) {
      content += this.config.content;
    }
    
    return content;
  }
  
  generateWorkflowIntro() {
    return `**YOU MUST SAY:** "Let me systematically ${this.config.actionVerb || 'approach'} this ${this.config.target || 'task'} before ${this.config.action || 'proceeding'}."

For complex ${this.config.target || 'tasks'}, say: "Let me think deeply about this ${this.config.target || 'problem'} using systematic investigation."

`;
  }
  
  generatePhases() {
    let output = '\n## The Systematic Process\n\n';
    
    this.config.phases.forEach((phase, index) => {
      if (typeof phase === 'string') {
        // Simple phase name - generate basic structure
        output += generatePhaseContent({
          number: index + 1, // Fix: phases should start at 1, not 0
          name: phase,
          goal: `Complete ${phase} phase`,
          learningObjective: `Understand ${phase} methodology`
        });
      } else {
        // Full phase configuration
        output += generatePhaseContent({
          number: index + 1, // Fix: phases should start at 1, not 0
          ...phase
        });
      }
    });
    
    return output;
  }
  
  generateIntegrations() {
    try {
      // Generate integration list
      const integrationList = this.config.integrations.map(integration => 
        `- **\`/${this.config.name}\` → \`/${integration}\`**: Integration workflow`
      ).join('\n');
      
      return loadTemplate('integration-patterns', {
        commandName: this.config.name,
        integrationList: integrationList
      });
    } catch (error) {
      // Fallback if template loading fails
      let output = '\n## Integration with Other Commands\n\n';
      this.config.integrations.forEach(integration => {
        output += `- **\`/${this.config.name}\` → \`/${integration}\`**: Integration workflow\n`;
      });
      return output;
    }
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