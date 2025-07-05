/**
 * TemplateUtils - Consolidated template loading and processing utilities
 * 
 * Combines the best patterns from:
 * - EnhancedTemplateLoader (variable processing, caching)
 * - TemplateManager (configuration integration, preloading)
 * - shared-utils (safe file operations)
 * - BaseManager (consistent patterns, error handling)
 * 
 * Provides unified interface for:
 * - File-based template loading with variable substitution
 * - Safe file operations with error handling
 * - Caching and performance optimization
 * - Configuration-driven template management
 * - In-memory template registration
 * - Template validation and discovery
 */

const fs = require('fs');
const path = require('path');
const BaseManager = require('./base-manager');

class TemplateUtils extends BaseManager {
  constructor(options = {}) {
    super({
      ...options,
      subDir: options.subDir || 'templates',
      pluginName: options.pluginName || 'template'
    });
    
    // Template-specific configuration
    this.templateCache = new Map();
    this.registeredTemplates = new Map();
    this.templateDir = options.templateDir || this.getDefaultTemplateDir();
    
    // Get plugin configuration
    const pluginConfig = this.getPluginConfig();
    this.cacheEnabled = pluginConfig.cacheEnabled !== undefined ? pluginConfig.cacheEnabled : true;
    this.commonTemplates = pluginConfig.preloadTemplates || [
      'quality-standards',
      'learning-integration',
      'integration-patterns',
      'workflow-phases',
      'planning-methodology'
    ];
    
    // Initialize templates - can be disabled for testing
    if (options.autoPreload !== false) {
      this.preloadCommonTemplates();
    }
  }

  /**
   * Get default template directory
   */
  getDefaultTemplateDir() {
    // First try relative to command-utils (existing location)
    const commandUtilsPath = path.join(__dirname, '../command-utils/templates');
    if (fs.existsSync(commandUtilsPath)) {
      return commandUtilsPath;
    }
    
    // Fall back to data directory
    return path.join(this.dataDir, 'templates');
  }

  /**
   * Load and process template with variable substitution
   * @param {string} templateName - Name of template (without .md extension)
   * @param {Object} variables - Variables to substitute
   * @returns {string} Processed template content
   */
  loadTemplate(templateName, variables = {}) {
    try {
      const content = this.getTemplateContent(templateName);
      return this.processVariables(content, variables);
    } catch (error) {
      this.logError(error, { templateName, variables });
      throw error;
    }
  }

  /**
   * Get raw template content (cached)
   * @param {string} templateName - Name of template
   * @returns {string} Raw template content
   */
  getTemplateContent(templateName) {
    // Check registered in-memory templates first
    if (this.registeredTemplates.has(templateName)) {
      return this.registeredTemplates.get(templateName);
    }
    
    // Check cache
    if (this.cacheEnabled && this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }

    // Load from file
    const content = this.loadTemplateFromFile(templateName);
    
    // Cache if enabled
    if (this.cacheEnabled) {
      this.templateCache.set(templateName, content);
    }
    
    return content;
  }

  /**
   * Load template from file system
   * @param {string} templateName - Name of template
   * @returns {string} Template content
   */
  loadTemplateFromFile(templateName) {
    const templatePath = path.join(this.templateDir, `${templateName}.md`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName} at ${templatePath}`);
    }

    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read template ${templateName}: ${error.message}`);
    }
  }

  /**
   * Process variables in template content
   * @param {string} content - Template content
   * @param {Object} variables - Variables to substitute
   * @returns {string} Processed content
   */
  processVariables(content, variables) {
    let processed = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      
      if (Array.isArray(value)) {
        processed = this.processArrayVariable(processed, key, value, regex);
      } else if (this.isEmptyValue(value)) {
        processed = this.removeEmptyVariable(processed, key);
      } else {
        processed = processed.replace(regex, String(value));
      }
    });

    return processed;
  }

  /**
   * Process array variables with special handling
   * @param {string} content - Template content
   * @param {string} key - Variable key
   * @param {Array} value - Array value
   * @param {RegExp} regex - Replacement regex
   * @returns {string} Processed content
   */
  processArrayVariable(content, key, value, regex) {
    if (key === 'phaseSteps') {
      const numberedSteps = value.map((step, index) => `${index + 1}. ${step}`).join('\n');
      return content.replace(regex, numberedSteps);
    } else if (key === 'integrationList') {
      const listItems = value.map(item => `- ${item}`).join('\n');
      return content.replace(regex, listItems);
    } else if (value.length === 0) {
      return this.removeEmptyVariable(content, key);
    } else {
      return content.replace(regex, value.join(', '));
    }
  }

  /**
   * Remove empty variable placeholders
   * @param {string} content - Template content
   * @param {string} key - Variable key
   * @returns {string} Processed content
   */
  removeEmptyVariable(content, key) {
    // Remove variable and any surrounding newlines - be more careful about spacing
    let processed = content.replace(new RegExp(`\\n{{${key}}}\\n`, 'g'), '\n');
    processed = processed.replace(new RegExp(`\\n{{${key}}}`, 'g'), '');
    processed = processed.replace(new RegExp(`{{${key}}}\\n`, 'g'), '');
    processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), '');
    return processed;
  }

  /**
   * Check if value is empty
   * @param {*} value - Value to check
   * @returns {boolean} True if empty
   */
  isEmptyValue(value) {
    return value === '' || value === null || value === undefined;
  }

  /**
   * Register in-memory template
   * @param {string} name - Template name
   * @param {string} content - Template content
   */
  registerTemplate(name, content) {
    this.registeredTemplates.set(name, content);
  }

  /**
   * Get all registered template names
   * @returns {string[]} Array of template names
   */
  getRegisteredTemplates() {
    return Array.from(this.registeredTemplates.keys());
  }

  /**
   * Validate template exists and extract variables
   * @param {string} templateName - Name of template
   * @returns {Object} Validation result
   */
  validateTemplate(templateName) {
    try {
      const content = this.getTemplateContent(templateName);
      const variables = this.extractVariables(content);
      return { valid: true, variables };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Extract variables from template content
   * @param {string} content - Template content
   * @returns {string[]} Array of variable names
   */
  extractVariables(content) {
    const variableRegex = /{{([^}]+)}}/g;
    const variables = new Set();
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Get variables used in a template
   * @param {string} templateName - Name of template
   * @returns {string[]} Array of variable names
   */
  getTemplateVariables(templateName) {
    const validation = this.validateTemplate(templateName);
    return validation.valid ? validation.variables : [];
  }

  /**
   * Get all available templates
   * @returns {string[]} Array of template names
   */
  getAvailableTemplates() {
    const fileTemplates = this.getFileTemplates();
    const registered = this.getRegisteredTemplates();
    
    return [...new Set([...fileTemplates, ...registered])];
  }

  /**
   * Get file-based templates
   * @returns {string[]} Array of template names
   */
  getFileTemplates() {
    try {
      if (!fs.existsSync(this.templateDir)) {
        return [];
      }
      
      return fs.readdirSync(this.templateDir)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
    } catch (error) {
      this.logError(error, { action: 'getFileTemplates' });
      return [];
    }
  }

  /**
   * Preload common templates
   */
  preloadCommonTemplates() {
    if (!this.cacheEnabled) {
      return;
    }
    
    this.commonTemplates.forEach(templateName => {
      try {
        this.getTemplateContent(templateName);
      } catch (error) {
        // Log warning but don't fail - template might not exist
        this.logError(error, { action: 'preloadTemplate', templateName });
      }
    });
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.templateCache.clear();
    this.preloadCommonTemplates();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      cached: this.templateCache.size,
      registered: this.registeredTemplates.size,
      templates: Array.from(this.templateCache.keys()),
      registeredTemplates: this.getRegisteredTemplates()
    };
  }

  /**
   * Validate all available templates
   * @returns {Object} Validation results
   */
  validateAllTemplates() {
    const results = {};
    const templates = this.getAvailableTemplates();
    
    templates.forEach(templateName => {
      results[templateName] = this.validateTemplate(templateName);
    });
    
    return results;
  }

  // Safe file operations from shared-utils
  
  /**
   * Safely read and parse JSON file
   * @param {string} filePath - Path to JSON file
   * @returns {Object|null} Parsed JSON or null if error
   */
  safeReadJson(filePath) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      this.logError(error, { action: 'safeReadJson', filePath });
      return null;
    }
  }

  /**
   * Safely read text file
   * @param {string} filePath - Path to text file
   * @returns {string|null} File content or null if error
   */
  safeReadText(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      this.logError(error, { action: 'safeReadText', filePath });
      return null;
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to check
   * @returns {boolean} True if file exists
   */
  fileExists(filePath) {
    return fs.existsSync(filePath);
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
    
    if (!enabled) {
      this.clearCache();
    }
  }

  /**
   * Get cache enabled status
   * @returns {boolean} Whether caching is enabled
   */
  getCacheEnabled() {
    return this.cacheEnabled;
  }

  /**
   * Get template directory
   * @returns {string} Template directory path
   */
  getTemplateDir() {
    return this.templateDir;
  }

  /**
   * Set template directory
   * @param {string} dir - New template directory
   */
  setTemplateDir(dir) {
    this.templateDir = dir;
    this.clearCache();
  }
}

// Create singleton instance
const templateUtils = new TemplateUtils();

// Export class and singleton
module.exports = TemplateUtils;
module.exports.TemplateUtils = TemplateUtils;
module.exports.templateUtils = templateUtils;

// Export convenience functions for backward compatibility
module.exports.loadTemplate = (templateName, variables = {}) => {
  return templateUtils.loadTemplate(templateName, variables);
};

module.exports.validateTemplate = (templateName) => {
  return templateUtils.validateTemplate(templateName);
};

module.exports.getTemplateVariables = (templateName) => {
  return templateUtils.getTemplateVariables(templateName);
};

module.exports.clearTemplateCache = () => {
  return templateUtils.clearCache();
};

module.exports.getTemplateCacheStats = () => {
  return templateUtils.getCacheStats();
};

// Export safe file operations
module.exports.safeReadJson = (filePath) => {
  return templateUtils.safeReadJson(filePath);
};

module.exports.safeReadText = (filePath) => {
  return templateUtils.safeReadText(filePath);
};

module.exports.fileExists = (filePath) => {
  return templateUtils.fileExists(filePath);
};