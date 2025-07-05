/**
 * Unified User Preference Manager
 * 
 * Modern replacement for the legacy UserPreferenceManager that works
 * with the unified configuration system. Provides the same API but
 * uses the plugin-based architecture for better maintainability.
 */

const ConfigurationManager = require('./configuration-manager');
const { createStandardPlugins } = require('./plugins');

class UnifiedPreferenceManager {
  constructor(options = {}) {
    // Use provided ConfigurationManager or create new one
    if (options.configManager) {
      this.configManager = options.configManager;
    } else {
      this.configManager = new ConfigurationManager(options);
      
      // Register standard plugins only if we created the ConfigurationManager
      const plugins = createStandardPlugins();
      for (const [name, plugin] of plugins) {
        this.configManager.registerPlugin(name, plugin);
      }
    }
    
    this.currentConfig = null;
  }

  /**
   * Get user ID
   * @returns {string} User ID
   */
  getUserId() {
    return this.configManager.userId;
  }

  /**
   * Get configuration directory path
   * @returns {string} Configuration directory path
   */
  getConfigPath() {
    return this.configManager.configDir;
  }

  /**
   * Get platform-appropriate configuration path
   * @returns {string} Platform-specific config path
   */
  getPlatformAppropriateConfigPath() {
    return this.configManager.configDir;
  }

  /**
   * Get default configuration
   * @returns {Object} Default configuration
   */
  getDefaultConfiguration() {
    const userPrefsPlugin = this.configManager.getPlugin('user-preferences');
    return userPrefsPlugin ? userPrefsPlugin.getDefaults() : {};
  }

  /**
   * Load configuration using hierarchy: CLI args → env vars → config file → defaults
   * @param {Object} cliOptions - Command line options (highest priority)
   * @returns {Promise<Object>} Merged configuration object
   */
  async loadConfiguration(cliOptions = {}) {
    this.currentConfig = await this.configManager.loadConfiguration(cliOptions);
    
    // Extract user preferences and apply CLI options for backward compatibility
    const userPrefs = this.getUserPreferences();
    
    // Apply CLI options directly to preferences for backward compatibility
    const finalConfig = { ...userPrefs, ...cliOptions };
    
    return finalConfig;
  }

  /**
   * Get user preferences from current configuration
   * @returns {Object} User preferences
   */
  getUserPreferences() {
    if (!this.currentConfig) {
      return this.getDefaultConfiguration();
    }
    
    return this.currentConfig.plugins['user-preferences'] || this.getDefaultConfiguration();
  }

  /**
   * Validate configuration
   * @param {Object} config - Configuration to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateConfiguration(config) {
    const userPrefsPlugin = this.configManager.getPlugin('user-preferences');
    if (!userPrefsPlugin) {
      return {
        valid: false,
        config: this.getDefaultConfiguration(),
        errors: [{ path: 'plugin', message: 'User preferences plugin not found' }]
      };
    }
    
    // Validate just the user preferences part for backward compatibility
    const validation = await userPrefsPlugin.validate(config);
    return validation;
  }

  /**
   * Save preferences
   * @param {Object} preferences - Preferences to save
   */
  async savePreferences(preferences) {
    this.configManager.updatePluginConfig('user-preferences', preferences);
    await this.configManager.saveConfiguration(this.configManager.getSharedData());
  }

  /**
   * Load preferences
   * @returns {Promise<Object>} Loaded preferences
   */
  async loadPreferences() {
    if (!this.currentConfig) {
      await this.loadConfiguration();
    }
    return this.getUserPreferences();
  }

  /**
   * Migrate configuration from older versions
   * @returns {Promise<Object>} Migrated configuration
   */
  async migrateConfiguration() {
    const fullConfig = await this.configManager.migrateConfiguration();
    // Return user preferences with version for backward compatibility
    const userPrefs = fullConfig.plugins && fullConfig.plugins['user-preferences'] 
      ? fullConfig.plugins['user-preferences']
      : this.getDefaultConfiguration();
    
    // Add version field for backward compatibility
    return {
      ...userPrefs,
      version: fullConfig.version || '2.0.0'
    };
  }

  /**
   * Save customizations
   * @param {Object} customizations - Customizations to save
   */
  async saveCustomizations(customizations) {
    const currentPrefs = this.getUserPreferences();
    const updatedPrefs = {
      ...currentPrefs,
      customizations: {
        ...currentPrefs.customizations,
        ...customizations
      }
    };
    
    await this.savePreferences(updatedPrefs);
    
    // Reload configuration to reflect changes
    this.currentConfig = await this.configManager.loadConfiguration();
  }

  /**
   * Get available themes
   * @returns {Array} Array of available theme names
   */
  getAvailableThemes() {
    const userPrefsPlugin = this.configManager.getPlugin('user-preferences');
    
    if (userPrefsPlugin && userPrefsPlugin.getAvailableThemes) {
      // Load current preferences first to get customizations
      const currentPrefs = this.currentConfig && this.currentConfig.plugins 
        ? this.currentConfig.plugins['user-preferences'] 
        : this.getDefaultConfiguration();
      return userPrefsPlugin.getAvailableThemes(currentPrefs);
    }
    
    return ['default', 'dark', 'high-contrast', 'colorblind-friendly'];
  }

  /**
   * Get available output formats
   * @returns {Array} Array of available output format names
   */
  getAvailableOutputFormats() {
    const userPrefsPlugin = this.configManager.getPlugin('user-preferences');
    const currentPrefs = this.getUserPreferences();
    
    if (userPrefsPlugin && userPrefsPlugin.getAvailableOutputFormats) {
      return userPrefsPlugin.getAvailableOutputFormats(currentPrefs);
    }
    
    return ['human', 'json', 'table', 'structured'];
  }

  /**
   * Get theme configuration
   * @param {string} themeName - Name of the theme
   * @returns {Object} Theme configuration
   */
  getThemeConfiguration(themeName) {
    const userPrefsPlugin = this.configManager.getPlugin('user-preferences');
    const currentPrefs = this.getUserPreferences();
    
    if (userPrefsPlugin && userPrefsPlugin.getThemeConfiguration) {
      return userPrefsPlugin.getThemeConfiguration(currentPrefs, themeName);
    }
    
    // Fallback default theme
    return {
      success: '#00aa00',
      error: '#cc0000',
      warning: '#ff8800',
      info: '#0088cc'
    };
  }

  /**
   * Get configuration schema for validation
   * @returns {Object} Configuration schema
   */
  getConfigurationSchema() {
    const userPrefsPlugin = this.configManager.getPlugin('user-preferences');
    return userPrefsPlugin ? userPrefsPlugin.schema : {};
  }

  /**
   * Get the underlying configuration manager
   * @returns {ConfigurationManager} Configuration manager instance
   */
  getConfigurationManager() {
    return this.configManager;
  }

  /**
   * Create a manager instance using the unified configuration
   * @param {string} pluginName - Name of the plugin
   * @param {Function} ManagerClass - Manager class constructor
   * @returns {Object} Manager instance
   */
  createManager(pluginName, ManagerClass) {
    return this.configManager.createManager(pluginName, ManagerClass);
  }

  /**
   * Simple preference API for backward compatibility
   */
  setPreference(key, value) {
    if (!this.currentConfig) {
      this.currentConfig = { plugins: {} };
    }
    
    if (!this.currentConfig.plugins['user-preferences']) {
      this.currentConfig.plugins['user-preferences'] = this.getDefaultConfiguration();
    }
    
    // Handle nested keys like 'accessibility.fontSize'
    const keys = key.split('.');
    let target = this.currentConfig.plugins['user-preferences'];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    
    target[keys[keys.length - 1]] = value;
    
    // Synchronous save for backward compatibility
    this.configManager.updatePluginConfig('user-preferences', this.currentConfig.plugins['user-preferences']);
    
    // Save to disk synchronously
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(this.configManager.configDir, 'config.json');
      
      // Ensure directory exists
      if (!fs.existsSync(this.configManager.configDir)) {
        fs.mkdirSync(this.configManager.configDir, { recursive: true });
      }
      
      fs.writeFileSync(configPath, JSON.stringify(this.currentConfig, null, 2));
    } catch (error) {
      // Ignore write errors for now - this is minimal implementation
    }
  }

  getPreference(key) {
    // Auto-load configuration if not loaded
    if (!this.currentConfig) {
      // Synchronous load for backward compatibility
      try {
        const configPath = require('path').join(this.configManager.configDir, 'config.json');
        if (require('fs').existsSync(configPath)) {
          const configData = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
          this.currentConfig = configData;
        }
      } catch (error) {
        // Ignore errors, will return undefined for missing preferences
      }
    }
    
    if (!this.currentConfig) {
      return undefined;
    }
    
    const userPrefs = this.currentConfig.plugins['user-preferences'] || {};
    
    // Handle nested keys like 'accessibility.fontSize'
    const keys = key.split('.');
    let value = userPrefs;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  removePreference(key) {
    if (!this.currentConfig || !this.currentConfig.plugins['user-preferences']) {
      return;
    }
    
    // Handle nested keys like 'accessibility.fontSize'
    const keys = key.split('.');
    let target = this.currentConfig.plugins['user-preferences'];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        return; // Key doesn't exist
      }
      target = target[keys[i]];
    }
    
    delete target[keys[keys.length - 1]];
    
    // Update ConfigurationManager
    this.configManager.updatePluginConfig('user-preferences', this.currentConfig.plugins['user-preferences']);
  }
}

module.exports = UnifiedPreferenceManager;