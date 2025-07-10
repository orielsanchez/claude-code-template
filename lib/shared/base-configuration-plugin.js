/**
 * Base Configuration Plugin
 * 
 * Provides standard implementation for configuration plugins to extend.
 * Handles common patterns like file loading, validation, and data management.
 */

const fs = require('fs');
const path = require('path');
const { createContextualLogger } = require('./logger');

class BaseConfigurationPlugin {
  constructor(pluginName, options = {}) {
    this.pluginName = pluginName;
    this.fileName = options.fileName || `${pluginName}.json`;
    this.defaults = options.defaults || {};
    this.logger = createContextualLogger(`${pluginName}-plugin`);
    this.schema = options.schema || {};
    this.validateSchema = options.validateSchema !== false;
  }

  /**
   * Get default configuration for this plugin
   * @returns {Object} Default configuration
   */
  getDefaults() {
    return { ...this.defaults };
  }

  /**
   * Load plugin configuration from file system
   * @param {string} configDir - Configuration directory path
   * @returns {Promise<Object>} Plugin configuration
   */
  async load(configDir) {
    const configFile = path.join(configDir, this.fileName);
    
    if (!fs.existsSync(configFile)) {
      return this.getDefaults();
    }
    
    try {
      const fileConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      return { ...this.getDefaults(), ...fileConfig };
    } catch (error) {
      this.logger.warn('Failed to load plugin config', {
        operation: 'load',
        pluginName: this.pluginName,
        fileName: this.fileName,
        errorMessage: error.message
      });
      return this.getDefaults();
    }
  }

  /**
   * Save plugin configuration to file system
   * @param {Object} config - Configuration to save
   * @param {string} configDir - Configuration directory path
   */
  async save(config, configDir) {
    const configFile = path.join(configDir, this.fileName);
    
    try {
      // Ensure directory exists
      fs.mkdirSync(configDir, { recursive: true });
      
      // Write configuration file
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save ${this.pluginName} config: ${error.message}`);
    }
  }

  /**
   * Validate plugin configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result with valid flag and errors
   */
  async validate(config) {
    const errors = [];
    
    if (!config || typeof config !== 'object') {
      errors.push({
        path: 'root',
        message: 'Configuration must be an object'
      });
      return { valid: false, errors, config: this.getDefaults() };
    }
    
    // Custom validation if implemented by subclass
    if (this.validateConfig) {
      try {
        const customValidation = await this.validateConfig(config);
        if (customValidation && !customValidation.valid) {
          errors.push(...customValidation.errors);
        }
      } catch (error) {
        errors.push({
          path: 'custom',
          message: `Custom validation failed: ${error.message}`
        });
      }
    }
    
    // Schema validation if enabled and schema provided
    if (this.validateSchema && this.schema && Object.keys(this.schema).length > 0) {
      const schemaErrors = this.validateAgainstSchema(config, this.schema);
      errors.push(...schemaErrors);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      config: errors.length === 0 ? config : this.getDefaults()
    };
  }

  /**
   * Apply environment variable overrides (to be implemented by subclasses)
   * @param {Object} config - Configuration to modify
   */
  applyEnvironmentOverrides(config) {
    // Default implementation does nothing
    // Subclasses can override to apply environment variables
  }

  /**
   * Migrate configuration from older versions (to be implemented by subclasses)
   * @param {Object} oldConfig - Old configuration
   * @param {string} configDir - Configuration directory
   * @returns {Promise<Object>} Migrated configuration
   */
  async migrate(oldConfig, configDir) {
    // Default implementation returns defaults merged with old config
    return { ...this.getDefaults(), ...oldConfig };
  }

  /**
   * Basic schema validation helper
   * @param {Object} config - Configuration to validate
   * @param {Object} schema - Schema definition
   * @returns {Array} Array of validation errors
   */
  validateAgainstSchema(config, schema) {
    const errors = [];
    
    // Simple type validation
    for (const [key, definition] of Object.entries(schema)) {
      const value = config[key];
      
      if (definition.required && (value === undefined || value === null)) {
        errors.push({
          path: key,
          message: `${key} is required`
        });
        continue;
      }
      
      if (value !== undefined && definition.type) {
        if (definition.type === 'array' && !Array.isArray(value)) {
          errors.push({
            path: key,
            message: `${key} must be of type array`
          });
        } else if (definition.type !== 'array' && typeof value !== definition.type) {
          errors.push({
            path: key,
            message: `${key} must be of type ${definition.type}`
          });
        }
      }
      
      if (value !== undefined && definition.enum && !definition.enum.includes(value)) {
        errors.push({
          path: key,
          message: `${key} must be one of: ${definition.enum.join(', ')}`
        });
      }
      
      if (definition.validate && typeof definition.validate === 'function') {
        try {
          const isValid = definition.validate(value);
          if (!isValid) {
            errors.push({
              path: key,
              message: `${key} failed custom validation`
            });
          }
        } catch (error) {
          errors.push({
            path: key,
            message: `${key} validation error: ${error.message}`
          });
        }
      }
    }
    
    return errors;
  }

  /**
   * Helper method to get file path for this plugin
   * @param {string} configDir - Configuration directory
   * @returns {string} Full file path
   */
  getConfigFilePath(configDir) {
    return path.join(configDir, this.fileName);
  }

  /**
   * Helper method to check if config file exists
   * @param {string} configDir - Configuration directory
   * @returns {boolean} True if config file exists
   */
  configFileExists(configDir) {
    return fs.existsSync(this.getConfigFilePath(configDir));
  }

  /**
   * Helper method to create backup of config file
   * @param {string} configDir - Configuration directory
   * @param {string} suffix - Backup file suffix
   */
  createBackup(configDir, suffix = 'backup') {
    const configFile = this.getConfigFilePath(configDir);
    const backupFile = `${configFile}.${suffix}`;
    
    if (fs.existsSync(configFile)) {
      fs.copyFileSync(configFile, backupFile);
    }
  }
}

module.exports = BaseConfigurationPlugin;