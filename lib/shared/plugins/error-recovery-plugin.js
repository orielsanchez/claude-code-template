/**
 * Error Recovery Plugin
 * 
 * Provides error pattern configuration and validation for the ErrorRecoverySystem.
 * Extends BaseConfigurationPlugin with error-specific validation and defaults.
 */

const BaseConfigurationPlugin = require('../base-configuration-plugin');

class ErrorRecoveryPlugin extends BaseConfigurationPlugin {
  constructor() {
    super();
    this.name = 'error-recovery';
    this.version = '1.0.0';
  }

  /**
   * Get default configuration for error recovery
   * @returns {Object} Default error recovery configuration
   */
  getDefaults() {
    return {
      patterns: [],
      maxPatterns: 100,
      enableLearning: true,
      autoSuggestions: true,
      preventionInsights: true
    };
  }

  /**
   * Get validation schema for error recovery configuration
   * @returns {Object} JSON schema for validation
   */
  getSchema() {
    return {
      type: 'object',
      properties: {
        patterns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              pattern: { type: 'object' }, // RegExp object
              suggestion: { type: 'string' }
            },
            required: ['type']
          }
        },
        maxPatterns: {
          type: 'number',
          minimum: 1,
          maximum: 1000
        },
        enableLearning: { type: 'boolean' },
        autoSuggestions: { type: 'boolean' },
        preventionInsights: { type: 'boolean' }
      },
      required: ['patterns', 'maxPatterns']
    };
  }

  /**
   * Validate error recovery configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validate(config) {
    const errors = [];
    
    // Basic type validation
    if (!config || typeof config !== 'object') {
      errors.push({ path: 'config', message: 'Configuration must be an object' });
    }

    // Validate patterns array
    if (config && config.patterns !== undefined) {
      if (!Array.isArray(config.patterns)) {
        errors.push({ path: 'patterns', message: 'Patterns must be an array' });
      } else {
        config.patterns.forEach((pattern, index) => {
          if (!pattern || typeof pattern !== 'object') {
            errors.push({ 
              path: `patterns[${index}]`, 
              message: 'Pattern must be an object' 
            });
          } else if (!pattern.type || typeof pattern.type !== 'string') {
            errors.push({ 
              path: `patterns[${index}].type`, 
              message: 'Pattern type must be a non-empty string' 
            });
          }
        });
      }
    }

    // Validate maxPatterns
    if (config && config.maxPatterns !== undefined) {
      if (typeof config.maxPatterns !== 'number' || 
          config.maxPatterns < 1 || 
          config.maxPatterns > 1000) {
        errors.push({ 
          path: 'maxPatterns', 
          message: 'Max patterns must be a number between 1 and 1000' 
        });
      }
    }

    // Validate boolean fields
    if (config) {
      ['enableLearning', 'autoSuggestions', 'preventionInsights'].forEach(field => {
        if (config[field] !== undefined && typeof config[field] !== 'boolean') {
          errors.push({ 
            path: field, 
            message: `${field} must be a boolean` 
          });
        }
      });
    }

    // Throw for test compatibility
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }

    return {
      valid: true,
      config: config || this.getDefaults(),
      errors: []
    };
  }

  /**
   * Load configuration from file system
   * @param {string} configDir - Configuration directory
   * @returns {Promise<Object>} Loaded configuration
   */
  async load(configDir) {
    const fs = require('fs');
    const path = require('path');
    const configFile = path.join(configDir, 'error-recovery.json');
    
    try {
      if (fs.existsSync(configFile)) {
        const configData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        return this.validate(configData).config;
      }
    } catch (error) {
      console.warn('Failed to load error recovery config:', error.message);
    }
    
    return this.getDefaults();
  }

  /**
   * Save configuration to file system
   * @param {Object} config - Configuration to save
   * @param {string} configDir - Configuration directory
   * @returns {Promise<void>}
   */
  async save(config, configDir) {
    const fs = require('fs');
    const path = require('path');
    const configFile = path.join(configDir, 'error-recovery.json');
    
    try {
      // Ensure directory exists
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Validate before saving
      const validatedConfig = this.validate(config).config;
      fs.writeFileSync(configFile, JSON.stringify(validatedConfig, null, 2));
    } catch (error) {
      console.warn('Failed to save error recovery config:', error.message);
      throw error;
    }
  }

  /**
   * Apply environment variable overrides
   * @param {Object} config - Configuration to modify
   */
  applyEnvironmentOverrides(config) {
    if (process.env.ERROR_RECOVERY_MAX_PATTERNS) {
      const maxPatterns = parseInt(process.env.ERROR_RECOVERY_MAX_PATTERNS, 10);
      if (!isNaN(maxPatterns)) {
        config.maxPatterns = maxPatterns;
      }
    }

    if (process.env.ERROR_RECOVERY_LEARNING !== undefined) {
      config.enableLearning = process.env.ERROR_RECOVERY_LEARNING === 'true';
    }

    if (process.env.ERROR_RECOVERY_AUTO_SUGGESTIONS !== undefined) {
      config.autoSuggestions = process.env.ERROR_RECOVERY_AUTO_SUGGESTIONS === 'true';
    }
  }

  /**
   * Migrate configuration from older version
   * @param {Object} oldConfig - Old configuration
   * @param {string} configDir - Configuration directory
   * @returns {Promise<Object>} Migrated configuration
   */
  async migrate(oldConfig, configDir) {
    if (!oldConfig) {
      return this.getDefaults();
    }

    const migrated = { ...this.getDefaults() };

    // Migrate patterns from old format
    if (oldConfig.errorPatterns) {
      migrated.patterns = oldConfig.errorPatterns;
    }

    // Migrate settings
    if (oldConfig.maxErrors !== undefined) {
      migrated.maxPatterns = oldConfig.maxErrors;
    }

    if (oldConfig.learning !== undefined) {
      migrated.enableLearning = oldConfig.learning;
    }

    return migrated;
  }
}

module.exports = ErrorRecoveryPlugin;