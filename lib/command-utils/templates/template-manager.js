const { EnhancedTemplateLoader } = require('./enhanced-template-loader');
const fs = require('fs');
const path = require('path');

class TemplateManager {
  constructor(sharedData = {}) {
    this.loader = new EnhancedTemplateLoader();
    
    // Support both legacy and modern constructor patterns
    if (sharedData.configManager) {
      this.configManager = sharedData.configManager;
      this.dataDir = path.join(this.configManager.configDir, 'template');
      this.configDir = this.configManager.configDir;
      
      const pluginConfig = this.configManager.getPluginConfig('template');
      this.commonTemplates = pluginConfig.preloadTemplates || [
        'quality-standards',
        'learning-integration',
        'integration-patterns'
      ];
      this.cacheEnabled = pluginConfig.cacheEnabled !== undefined ? pluginConfig.cacheEnabled : true;
    } else {
      this.dataDir = path.dirname(__filename);
      this.configDir = this.dataDir;
      this.commonTemplates = [
        'quality-standards',
        'learning-integration',
        'integration-patterns'
      ];
      this.cacheEnabled = true;
    }
    
    this.preloadCommonTemplates();
  }

  preloadCommonTemplates() {
    this.loader.preloadTemplates(this.commonTemplates);
  }

  loadTemplate(templateName, variables = {}) {
    const result = this.loader.loadTemplate(templateName, variables);
    
    // Add additional properties for test expectations
    if (result && typeof result === 'object') {
      result.name = templateName;
      if (!result.content && result.template) {
        result.content = result.template;
      }
    } else if (typeof result === 'string') {
      return {
        name: templateName,
        content: result
      };
    }
    
    return result;
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

  /**
   * Get configuration directory
   * @returns {string} Configuration directory path
   */
  getConfigDir() {
    return this.configDir;
  }

  /**
   * Get data directory
   * @returns {string} Data directory path
   */
  getDataDir() {
    return this.dataDir;
  }

  /**
   * Get cache enabled status
   * @returns {boolean} Whether caching is enabled
   */
  getCacheEnabled() {
    return this.cacheEnabled;
  }

  /**
   * Set cache enabled status
   * @param {boolean} enabled - Whether to enable caching
   */
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled;
    if (this.configManager) {
      this.configManager.updatePluginConfig('template', { cacheEnabled: enabled });
    }
  }
}

const templateManager = new TemplateManager();

module.exports = TemplateManager;
module.exports.TemplateManager = TemplateManager;
module.exports.templateManager = templateManager;