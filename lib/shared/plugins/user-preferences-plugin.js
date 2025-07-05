/**
 * User Preferences Configuration Plugin
 * 
 * Adapter for UserPreferenceManager to work with the unified configuration system.
 * Handles user preferences, themes, accessibility settings, and output formats.
 */

const BaseConfigurationPlugin = require('../base-configuration-plugin');
const { 
  OUTPUT_FORMATS, 
  THEME_NAMES, 
  ACCESSIBILITY_FEATURES 
} = require('../constants');

class UserPreferencesPlugin extends BaseConfigurationPlugin {
  constructor() {
    super('user-preferences', {
      fileName: 'config.json',
      defaults: {
        outputFormat: OUTPUT_FORMATS.HUMAN,
        theme: THEME_NAMES.DEFAULT,
        verbosity: 'normal',
        accessibility: {
          screenReader: false,
          highContrast: false,
          semanticPrefixes: true,
          structuredOutput: false,
          keyboardNavigation: false
        },
        customizations: {
          themes: {},
          outputFormats: {}
        }
      },
      schema: {
        outputFormat: {
          type: 'string',
          enum: Object.values(OUTPUT_FORMATS),
          required: false
        },
        theme: {
          type: 'string',
          required: false
        },
        verbosity: {
          type: 'string',
          enum: ['quiet', 'normal', 'verbose'],
          required: false
        },
        accessibility: {
          type: 'object',
          required: false
        }
      }
    });
  }

  /**
   * Apply environment variable overrides for user preferences
   * @param {Object} config - Configuration to modify
   */
  applyEnvironmentOverrides(config) {
    if (process.env.CLAUDE_OUTPUT_FORMAT) {
      config.outputFormat = process.env.CLAUDE_OUTPUT_FORMAT;
    }
    
    if (process.env.CLAUDE_THEME) {
      config.theme = process.env.CLAUDE_THEME;
    }
    
    if (process.env.CLAUDE_VERBOSITY) {
      config.verbosity = process.env.CLAUDE_VERBOSITY;
    }
    
    // Accessibility environment variables
    if (process.env.CLAUDE_SCREEN_READER === 'true') {
      config.accessibility.screenReader = true;
    }
    
    if (process.env.CLAUDE_HIGH_CONTRAST === 'true') {
      config.accessibility.highContrast = true;
    }
    
    if (process.env.CLAUDE_SEMANTIC_PREFIXES === 'false') {
      config.accessibility.semanticPrefixes = false;
    }
  }

  /**
   * Custom validation for user preferences
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  async validateConfig(config) {
    const errors = [];
    
    // Validate accessibility object structure
    if (config.accessibility) {
      const accessibilityKeys = Object.keys(ACCESSIBILITY_FEATURES);
      for (const [key, value] of Object.entries(config.accessibility)) {
        if (typeof value !== 'boolean' && typeof value !== 'object') {
          errors.push({
            path: `accessibility.${key}`,
            message: `Accessibility option ${key} must be a boolean`
          });
        }
      }
    }
    
    // Validate customizations structure
    if (config.customizations) {
      if (config.customizations.themes && typeof config.customizations.themes !== 'object') {
        errors.push({
          path: 'customizations.themes',
          message: 'Custom themes must be an object'
        });
      }
      
      if (config.customizations.outputFormats && typeof config.customizations.outputFormats !== 'object') {
        errors.push({
          path: 'customizations.outputFormats',
          message: 'Custom output formats must be an object'
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Migrate user preferences from older versions
   * @param {Object} oldConfig - Old configuration
   * @param {string} configDir - Configuration directory
   * @returns {Promise<Object>} Migrated configuration
   */
  async migrate(oldConfig, configDir) {
    if (!oldConfig) {
      return this.getDefaults();
    }
    
    const migratedConfig = { ...this.getDefaults() };
    
    // Handle old field names and structure changes
    if (oldConfig.colorMode === 'enabled') {
      migratedConfig.theme = THEME_NAMES.DEFAULT;
    } else if (oldConfig.colorMode === 'dark') {
      migratedConfig.theme = THEME_NAMES.DARK;
    }
    
    if (oldConfig.format === 'pretty') {
      migratedConfig.outputFormat = OUTPUT_FORMATS.HUMAN;
    } else if (oldConfig.format === 'json') {
      migratedConfig.outputFormat = OUTPUT_FORMATS.JSON;
    }
    
    // Migrate accessibility settings
    if (oldConfig.accessibility) {
      Object.assign(migratedConfig.accessibility, oldConfig.accessibility);
    }
    
    // Preserve valid fields that match current structure
    const validFields = ['outputFormat', 'theme', 'verbosity', 'accessibility', 'customizations'];
    validFields.forEach(field => {
      if (oldConfig[field] !== undefined) {
        migratedConfig[field] = oldConfig[field];
      }
    });
    
    return migratedConfig;
  }

  /**
   * Get available themes including custom themes
   * @param {Object} config - Current configuration
   * @returns {Array} Array of available theme names
   */
  getAvailableThemes(config) {
    const defaultThemes = Object.values(THEME_NAMES);
    const customThemes = config.customizations && config.customizations.themes 
      ? Object.keys(config.customizations.themes)
      : [];
    
    return [...defaultThemes, ...customThemes];
  }

  /**
   * Get available output formats including custom formats
   * @param {Object} config - Current configuration
   * @returns {Array} Array of available output format names
   */
  getAvailableOutputFormats(config) {
    const defaultFormats = Object.values(OUTPUT_FORMATS);
    const customFormats = config.customizations && config.customizations.outputFormats 
      ? Object.keys(config.customizations.outputFormats)
      : [];
    
    return [...defaultFormats, ...customFormats];
  }

  /**
   * Get theme configuration by name
   * @param {Object} config - Current configuration
   * @param {string} themeName - Name of the theme
   * @returns {Object} Theme configuration
   */
  getThemeConfiguration(config, themeName) {
    // Check custom themes first
    if (config.customizations && 
        config.customizations.themes && 
        config.customizations.themes[themeName]) {
      return config.customizations.themes[themeName];
    }
    
    // Default theme configurations
    const defaultThemes = {
      [THEME_NAMES.DEFAULT]: {
        success: '#00aa00',
        error: '#cc0000',
        warning: '#ff8800',
        info: '#0088cc'
      },
      [THEME_NAMES.DARK]: {
        success: '#00ff00',
        error: '#ff4444',
        warning: '#ffaa00',
        info: '#44aaff'
      },
      [THEME_NAMES.HIGH_CONTRAST]: {
        success: '#00ff00',
        error: '#ff0000',
        warning: '#ffff00',
        info: '#0000ff'
      },
      [THEME_NAMES.COLORBLIND_FRIENDLY]: {
        success: '#0077aa',
        error: '#cc4400',
        warning: '#eeaa00',
        info: '#6644aa'
      }
    };
    
    return defaultThemes[themeName] || defaultThemes[THEME_NAMES.DEFAULT];
  }

  /**
   * Add custom theme
   * @param {Object} config - Current configuration
   * @param {string} themeName - Name of the theme
   * @param {Object} themeConfig - Theme configuration
   */
  addCustomTheme(config, themeName, themeConfig) {
    if (!config.customizations) {
      config.customizations = {};
    }
    if (!config.customizations.themes) {
      config.customizations.themes = {};
    }
    
    config.customizations.themes[themeName] = themeConfig;
  }

  /**
   * Add custom output format
   * @param {Object} config - Current configuration
   * @param {string} formatName - Name of the format
   * @param {Object} formatConfig - Format configuration
   */
  addCustomOutputFormat(config, formatName, formatConfig) {
    if (!config.customizations) {
      config.customizations = {};
    }
    if (!config.customizations.outputFormats) {
      config.customizations.outputFormats = {};
    }
    
    config.customizations.outputFormats[formatName] = formatConfig;
  }
}

module.exports = UserPreferencesPlugin;