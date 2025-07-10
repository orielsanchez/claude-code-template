/**
 * Help System Plugin
 * 
 * Provides help system configuration and validation for the LayeredHelpSystem.
 * Extends BaseConfigurationPlugin with help-specific validation and defaults.
 */

const BaseConfigurationPlugin = require('../base-configuration-plugin');

class HelpSystemPlugin extends BaseConfigurationPlugin {
  constructor() {
    super();
    this.name = 'help-system';
    this.version = '1.0.0';
  }

  /**
   * Get default configuration for help system
   * @returns {Object} Default help system configuration
   */
  getDefaults() {
    return {
      defaultLevel: 'intermediate',
      enableAnalytics: true,
      showTutorials: true,
      contextualHelp: true,
      maxAnalyticsEntries: 1000,
      helpLevels: ['quick', 'detailed', 'tutorial'],
      autoSuggestHelp: true
    };
  }

  /**
   * Get validation schema for help system configuration
   * @returns {Object} JSON schema for validation
   */
  getSchema() {
    return {
      type: 'object',
      properties: {
        defaultLevel: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced']
        },
        enableAnalytics: { type: 'boolean' },
        showTutorials: { type: 'boolean' },
        contextualHelp: { type: 'boolean' },
        maxAnalyticsEntries: {
          type: 'number',
          minimum: 10,
          maximum: 10000
        },
        helpLevels: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['quick', 'detailed', 'tutorial']
          },
          minItems: 1
        },
        autoSuggestHelp: { type: 'boolean' }
      },
      required: ['defaultLevel', 'helpLevels']
    };
  }

  /**
   * Validate help system configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validate(config) {
    const errors = [];
    
    // Basic type validation
    if (!config || typeof config !== 'object') {
      errors.push({ path: 'config', message: 'Configuration must be an object' });
    }

    // Validate defaultLevel
    if (config && config.defaultLevel !== undefined) {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (!validLevels.includes(config.defaultLevel)) {
        errors.push({ 
          path: 'defaultLevel', 
          message: `Default level must be one of: ${validLevels.join(', ')}` 
        });
      }
    }

    // Validate helpLevels array
    if (config && config.helpLevels !== undefined) {
      if (!Array.isArray(config.helpLevels)) {
        errors.push({ path: 'helpLevels', message: 'Help levels must be an array' });
      } else {
        const validHelpLevels = ['quick', 'detailed', 'tutorial'];
        config.helpLevels.forEach((level, index) => {
          if (!validHelpLevels.includes(level)) {
            errors.push({ 
              path: `helpLevels[${index}]`, 
              message: `Help level must be one of: ${validHelpLevels.join(', ')}` 
            });
          }
        });
      }
    }

    // Validate maxAnalyticsEntries
    if (config && config.maxAnalyticsEntries !== undefined) {
      if (typeof config.maxAnalyticsEntries !== 'number' || 
          config.maxAnalyticsEntries < 10 || 
          config.maxAnalyticsEntries > 10000) {
        errors.push({ 
          path: 'maxAnalyticsEntries', 
          message: 'Max analytics entries must be a number between 10 and 10000' 
        });
      }
    }

    // Validate boolean fields
    if (config) {
      ['enableAnalytics', 'showTutorials', 'contextualHelp', 'autoSuggestHelp'].forEach(field => {
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
    const configFile = path.join(configDir, 'help-system.json');
    
    try {
      if (fs.existsSync(configFile)) {
        const configData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        return this.validate(configData).config;
      }
    } catch (error) {
      this.logger.warn('Failed to load help system config', {
        operation: 'load',
        errorMessage: error.message
      });
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
    const configFile = path.join(configDir, 'help-system.json');
    
    try {
      // Ensure directory exists
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Validate before saving
      const validatedConfig = this.validate(config).config;
      fs.writeFileSync(configFile, JSON.stringify(validatedConfig, null, 2));
    } catch (error) {
      this.logger.warn('Failed to save help system config', {
        operation: 'save',
        errorMessage: error.message
      });
      throw error;
    }
  }

  /**
   * Apply environment variable overrides
   * @param {Object} config - Configuration to modify
   */
  applyEnvironmentOverrides(config) {
    if (process.env.HELP_DEFAULT_LEVEL) {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (validLevels.includes(process.env.HELP_DEFAULT_LEVEL)) {
        config.defaultLevel = process.env.HELP_DEFAULT_LEVEL;
      }
    }

    if (process.env.HELP_ANALYTICS !== undefined) {
      config.enableAnalytics = process.env.HELP_ANALYTICS === 'true';
    }

    if (process.env.HELP_TUTORIALS !== undefined) {
      config.showTutorials = process.env.HELP_TUTORIALS === 'true';
    }

    if (process.env.HELP_CONTEXTUAL !== undefined) {
      config.contextualHelp = process.env.HELP_CONTEXTUAL === 'true';
    }

    if (process.env.HELP_MAX_ANALYTICS) {
      const maxEntries = parseInt(process.env.HELP_MAX_ANALYTICS, 10);
      if (!isNaN(maxEntries) && maxEntries >= 10 && maxEntries <= 10000) {
        config.maxAnalyticsEntries = maxEntries;
      }
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

    // Migrate user level preferences
    if (oldConfig.userLevel) {
      migrated.defaultLevel = oldConfig.userLevel;
    }

    // Migrate analytics settings
    if (oldConfig.trackUsage !== undefined) {
      migrated.enableAnalytics = oldConfig.trackUsage;
    }

    // Migrate tutorial preferences
    if (oldConfig.tutorials !== undefined) {
      migrated.showTutorials = oldConfig.tutorials;
    }

    // Migrate help levels
    if (oldConfig.availableLevels) {
      migrated.helpLevels = oldConfig.availableLevels;
    }

    return migrated;
  }
}

module.exports = HelpSystemPlugin;