const { generateUsageExamples } = require('./command-header');

class ContentGenerator {
  constructor(config) {
    this.config = config;
  }

  generate() {
    let output = '';
    
    output += this.generateTitle();
    output += this.generateSubtitle();
    output += this.generateUsageExamples();
    output += this.generateCommandContent();
    
    return output;
  }

  generateTitle() {
    const title = this.getTitle();
    return `# ${title}\n\n`;
  }

  generateSubtitle() {
    if (this.config.subtitle) {
      return `${this.config.subtitle}\n\n`;
    }
    return '';
  }

  generateUsageExamples() {
    if (this.config.usageExamples) {
      let output = generateUsageExamples(this.config.usageExamples);
      if (this.config.type === 'workflow' || this.config.phases) {
        output += '\n';
      }
      return output;
    }
    return '';
  }

  generateCommandContent() {
    let content = '';
    
    if (this.config.type === 'workflow' || this.config.phases) {
      content += this.generateWorkflowIntro();
    }
    
    if (this.config.content) {
      content += this.config.content;
    }
    
    return content;
  }

  getTitle() {
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

  generateWorkflowIntro() {
    return `**YOU MUST SAY:** "Let me systematically ${this.config.actionVerb || 'approach'} this ${this.config.target || 'task'} before ${this.config.action || 'proceeding'}."

For complex ${this.config.target || 'tasks'}, say: "Let me think deeply about this ${this.config.target || 'problem'} using systematic investigation."

`;
  }
}

module.exports = ContentGenerator;