const { generatePhaseContent } = require('./phase-content');
const { loadTemplate } = require('../templates/template-loader');

class IntegrationGenerator {
  constructor(config) {
    this.config = config;
  }

  generate() {
    let output = '';
    
    output += this.generatePhases();
    output += this.generateIntegrations();
    output += this.generateQualityStandards();
    output += this.generateLearningIntegration();
    
    return output;
  }

  generatePhases() {
    if (this.config.phases && this.config.type !== 'utility') {
      let output = '\n## The Systematic Process\n\n';
      
      this.config.phases.forEach((phase, index) => {
        if (typeof phase === 'string') {
          output += generatePhaseContent({
            number: index + 1,
            name: phase,
            goal: `Complete ${phase} phase`,
            learningObjective: `Understand ${phase} methodology`
          });
        } else {
          output += generatePhaseContent({
            number: index + 1,
            ...phase
          });
        }
      });
      
      return output;
    }
    return '';
  }

  generateIntegrations() {
    if (this.config.integrations) {
      try {
        const integrationList = this.config.integrations.map(integration => 
          `- **\`/${this.config.name}\` → \`/${integration}\`**: Integration workflow`
        ).join('\n');
        
        return loadTemplate('integration-patterns', {
          commandName: this.config.name,
          integrationList: integrationList
        });
      } catch (error) {
        let output = '\n## Integration with Other Commands\n\n';
        this.config.integrations.forEach(integration => {
          output += `- **\`/${this.config.name}\` → \`/${integration}\`**: Integration workflow\n`;
        });
        return output;
      }
    }
    return '';
  }

  generateQualityStandards() {
    if (this.config.type === 'workflow' || this.config.type === 'quality' || this.config.phases) {
      return '\n' + loadTemplate('quality-standards') + '\n';
    }
    return '';
  }

  generateLearningIntegration() {
    if (this.config.type === 'workflow' || this.config.phases) {
      return loadTemplate('learning-integration');
    }
    return '';
  }
}

module.exports = IntegrationGenerator;