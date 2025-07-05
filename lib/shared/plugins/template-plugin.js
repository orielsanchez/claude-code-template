/**
 * Template Configuration Plugin
 * 
 * Handles template-specific configuration including:
 * - Template directory management
 * - Cache configuration
 * - Template preloading settings
 * - Custom template definitions
 */

const BaseConfigurationPlugin = require('../base-configuration-plugin');
const path = require('path');

class TemplatePlugin extends BaseConfigurationPlugin {
  constructor() {
    super('template', {
      fileName: 'template-config.json',
      defaults: {
        templateDir: path.join(__dirname, '../../command-utils/templates'),
        cacheEnabled: true,
        preloadTemplates: [
          'quality-standards',
          'learning-integration', 
          'integration-patterns'
        ],
        variables: {
          systemType: 'default',
          projectType: 'general',
          complexity: 'medium'
        },
        customTemplates: {}
      },
      schema: {
        templateDir: {
          type: 'string',
          required: false
        },
        cacheEnabled: {
          type: 'boolean',
          required: false
        },
        preloadTemplates: {
          type: 'array',
          required: false,
          items: { type: 'string' }
        },
        variables: {
          type: 'object',
          required: false
        },
        customTemplates: {
          type: 'object',
          required: false
        }
      }
    });
  }

  /**
   * Get plugin name for test compatibility
   * @returns {string} Plugin name
   */
  get name() {
    return this.pluginName;
  }

  /**
   * Apply environment variable overrides for template settings
   * @param {Object} config - Configuration to modify
   */
  applyEnvironmentOverrides(config) {
    if (process.env.CLAUDE_TEMPLATE_DIR) {
      config.templateDir = process.env.CLAUDE_TEMPLATE_DIR;
    }
    
    if (process.env.CLAUDE_TEMPLATE_CACHE === 'false') {
      config.cacheEnabled = false;
    }

    if (process.env.CLAUDE_TEMPLATE_PRELOAD) {
      config.preloadTemplates = process.env.CLAUDE_TEMPLATE_PRELOAD.split(',').map(t => t.trim());
    }
  }

  /**
   * Custom validation for template configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  async validateConfig(config) {
    const errors = [];

    // Validate template directory
    if (config.templateDir && typeof config.templateDir !== 'string') {
      errors.push({
        path: 'templateDir',
        message: 'Template directory must be a string'
      });
    }

    // Validate cache enabled flag
    if (config.cacheEnabled !== undefined && typeof config.cacheEnabled !== 'boolean') {
      errors.push({
        path: 'cacheEnabled',
        message: 'Cache enabled must be a boolean'
      });
    }

    // Validate preload templates
    if (config.preloadTemplates) {
      if (!Array.isArray(config.preloadTemplates)) {
        errors.push({
          path: 'preloadTemplates',
          message: 'Preload templates must be an array'
        });
      } else {
        config.preloadTemplates.forEach((template, index) => {
          if (typeof template !== 'string') {
            errors.push({
              path: `preloadTemplates[${index}]`,
              message: `Template name at index ${index} must be a string`
            });
          }
        });
      }
    }

    // Validate variables
    if (config.variables && typeof config.variables !== 'object') {
      errors.push({
        path: 'variables',
        message: 'Variables must be an object'
      });
    }

    // Validate custom templates
    if (config.customTemplates && typeof config.customTemplates !== 'object') {
      errors.push({
        path: 'customTemplates',
        message: 'Custom templates must be an object'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Migrate template configuration from older versions
   * @param {Object} oldConfig - Old configuration
   * @param {string} configDir - Configuration directory
   * @returns {Promise<Object>} Migrated configuration
   */
  async migrate(oldConfig, configDir) {
    if (!oldConfig) {
      return this.getDefaults();
    }

    const migratedConfig = { ...this.getDefaults() };

    // Handle old field names
    if (oldConfig.templatesPath) {
      migratedConfig.templateDir = oldConfig.templatesPath;
    }

    if (oldConfig.enableCache !== undefined) {
      migratedConfig.cacheEnabled = oldConfig.enableCache;
    }

    if (oldConfig.commonTemplates) {
      migratedConfig.preloadTemplates = oldConfig.commonTemplates;
    }

    // Preserve valid fields
    const validFields = ['templateDir', 'cacheEnabled', 'preloadTemplates', 'variables', 'customTemplates'];
    validFields.forEach(field => {
      if (oldConfig[field] !== undefined) {
        migratedConfig[field] = { ...migratedConfig[field], ...oldConfig[field] };
      }
    });

    return migratedConfig;
  }

  /**
   * Get available template names
   * @param {Object} config - Current configuration
   * @returns {Array} Array of template names
   */
  getAvailableTemplates(config) {
    const fs = require('fs');
    const templates = [];

    // Add preloaded templates
    if (config.preloadTemplates) {
      templates.push(...config.preloadTemplates);
    }

    // Add custom templates
    if (config.customTemplates) {
      templates.push(...Object.keys(config.customTemplates));
    }

    // Scan template directory if it exists
    try {
      if (config.templateDir && fs.existsSync(config.templateDir)) {
        const files = fs.readdirSync(config.templateDir);
        const templateFiles = files
          .filter(file => file.endsWith('.md'))
          .map(file => file.replace('.md', ''));
        templates.push(...templateFiles);
      }
    } catch (error) {
      // Ignore errors when scanning directory
    }

    // Remove duplicates and return
    return [...new Set(templates)];
  }

  /**
   * Get template configuration by name
   * @param {Object} config - Current configuration
   * @param {string} templateName - Template name
   * @returns {Object} Template configuration
   */
  getTemplateConfig(config, templateName) {
    if (config.customTemplates && config.customTemplates[templateName]) {
      return config.customTemplates[templateName];
    }

    // Return default configuration for built-in templates
    return {
      name: templateName,
      type: 'built-in',
      variables: config.variables || {}
    };
  }
}

module.exports = TemplatePlugin;