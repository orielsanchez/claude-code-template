/**
 * CommitTemplates - Commit message template system
 * 
 * Provides intelligent commit message templates based on change analysis,
 * custom template support, and conventional commit validation.
 */

class CommitTemplates {
  constructor() {
    this.defaultTemplates = {
      'feat': {
        template: 'feat({scope}): {description}',
        description: 'A new feature',
        type: 'feat'
      },
      'fix': {
        template: 'fix({scope}): {description}',
        description: 'A bug fix',
        type: 'fix'
      },
      'docs': {
        template: 'docs({scope}): {description}',
        description: 'Documentation changes',
        type: 'docs'
      },
      'refactor': {
        template: 'refactor({scope}): {description}',
        description: 'Code refactoring',
        type: 'refactor'
      }
    };
    
    this.customTemplates = {};
  }

  /**
   * Get relevant templates based on change analysis
   */
  async getRelevantTemplates(changes) {
    if (!changes) {
      return Object.values(this.defaultTemplates);
    }

    const allTemplates = { ...this.defaultTemplates, ...this.customTemplates };
    
    // If changes specify a type, prioritize that template
    if (changes.type && allTemplates[changes.type]) {
      return [allTemplates[changes.type], ...Object.values(allTemplates).filter(t => t.type !== changes.type)];
    }

    return Object.values(allTemplates);
  }

  /**
   * Load custom templates from project configuration
   */
  loadCustomTemplates(config) {
    if (!config?.commitTemplates) {
      return;
    }

    for (const [type, template] of Object.entries(config.commitTemplates)) {
      this.customTemplates[type] = {
        template,
        description: `Custom ${type} template`,
        type
      };
    }
  }

  /**
   * Get specific template by type
   */
  getTemplate(type) {
    const allTemplates = { ...this.defaultTemplates, ...this.customTemplates };
    return allTemplates[type]?.template;
  }

  /**
   * Validate commit message format against conventional commits
   */
  validateFormat(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message is required' };
    }

    // Conventional commit pattern: type(scope): description
    const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+/;
    
    // Breaking change pattern: type!: or type(scope)!:
    const breakingPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?!: .+/;
    
    const isConventional = conventionalPattern.test(message);
    const isBreaking = breakingPattern.test(message);
    
    if (isConventional || isBreaking) {
      return { valid: true };
    }

    return { 
      valid: false, 
      error: 'Message does not follow conventional commit format' 
    };
  }

  /**
   * Generate template suggestions based on file patterns
   */
  suggestTemplateFromFiles(files) {
    if (!files || !Array.isArray(files)) {
      return 'feat';
    }

    const fileExtensions = files.map(f => f.split('.').pop().toLowerCase());
    const filePaths = files.map(f => f.toLowerCase());

    // Documentation files
    if (filePaths.some(f => f.includes('readme') || f.includes('docs')) || 
        fileExtensions.some(ext => ext === 'md')) {
      return 'docs';
    }

    // Test files
    if (filePaths.some(f => f.includes('test') || f.includes('spec')) ||
        fileExtensions.some(ext => ['test', 'spec'].includes(ext))) {
      return 'test';
    }

    // Configuration files
    if (fileExtensions.some(ext => ['json', 'yml', 'yaml', 'toml', 'ini'].includes(ext))) {
      return 'chore';
    }

    // Default to feature
    return 'feat';
  }

  /**
   * Format template with provided values
   */
  formatTemplate(templateType, values = {}) {
    const template = this.getTemplate(templateType);
    if (!template) {
      return `${templateType}: ${values.description || 'implement changes'}`;
    }

    let formatted = template;
    
    // Replace placeholders
    formatted = formatted.replace('{scope}', values.scope || '');
    formatted = formatted.replace('{description}', values.description || 'implement changes');
    
    // Clean up empty scope parentheses
    formatted = formatted.replace('():', ':');
    
    return formatted;
  }
}

module.exports = CommitTemplates;