const { EnhancedTemplateLoader } = require('./enhanced-template-loader');
const fs = require('fs');
const path = require('path');

class TemplateManager {
  constructor() {
    this.loader = new EnhancedTemplateLoader();
    this.commonTemplates = [
      'quality-standards',
      'learning-integration',
      'integration-patterns'
    ];
    this.preloadCommonTemplates();
  }

  preloadCommonTemplates() {
    this.loader.preloadTemplates(this.commonTemplates);
  }

  loadTemplate(templateName, variables = {}) {
    return this.loader.loadTemplate(templateName, variables);
  }

  validateAllTemplates() {
    const templateDir = path.dirname(__filename);
    const templateFiles = fs.readdirSync(templateDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));

    const results = {};
    templateFiles.forEach(templateName => {
      results[templateName] = this.loader.validateTemplate(templateName);
    });

    return results;
  }

  getTemplateVariables(templateName) {
    const validation = this.loader.validateTemplate(templateName);
    return validation.valid ? validation.variables : [];
  }

  clearCache() {
    this.loader.clearCache();
    this.preloadCommonTemplates();
  }

  getLoadedTemplates() {
    return Array.from(this.loader.cache.keys());
  }

  getCacheStats() {
    return {
      cached: this.loader.cache.size,
      templates: this.getLoadedTemplates()
    };
  }
}

const templateManager = new TemplateManager();

module.exports = {
  TemplateManager,
  templateManager
};