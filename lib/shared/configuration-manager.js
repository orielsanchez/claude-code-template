/**
 * Unified Configuration Manager
 * 
 * Central configuration system that provides:
 * - Plugin-based architecture for phase-specific configurations
 * - Hierarchical configuration loading (CLI → env → file → defaults)
 * - Consistent data directory management
 * - Unified validation and error handling
 * - Cross-cutting concerns management
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { 
  CONFIG_PRIORITY, 
  CONFIG_VERSION, 
  PLATFORM_PATHS, 
  ERROR_MESSAGES 
} = require('./constants');

class ConfigurationManager {
  constructor(options = {}) {
    this.appName = options.appName || 'claude-code';
    this.userId = options.userId || 'default-user';
    this.configDir = options.configDir || this.getDefaultConfigDir();
    this.plugins = new Map();
    this.sharedData = {};
    this.defaults = this.getBaseDefaults();
    this.eventListeners = new Map();
    this.errorLogs = [];
    
    this.ensureConfigDir();
  }

  /**
   * Get platform-appropriate configuration directory
   */
  getDefaultConfigDir() {
    const platform = process.platform;
    const homeDir = os.homedir();
    
    switch (platform) {
      case 'win32':
        return path.join(homeDir, PLATFORM_PATHS.WIN32, this.appName);
      case 'darwin':
        return path.join(homeDir, PLATFORM_PATHS.DARWIN, this.appName);
      default:
        return path.join(homeDir, PLATFORM_PATHS.LINUX, this.appName);
    }
  }

  /**
   * Ensure configuration directory exists
   */
  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * Get base default configuration
   */
  getBaseDefaults() {
    return {
      version: CONFIG_VERSION,
      userId: this.userId,
      appName: this.appName,
      configDir: this.configDir,
      plugins: {}
    };
  }

  /**
   * Register a configuration plugin
   * @param {string} name - Plugin name
   * @param {Object} plugin - Plugin instance with validate, load, save methods
   */
  registerPlugin(name, plugin) {
    if (!plugin.validate || !plugin.load || !plugin.save) {
      throw new Error(`Plugin ${name} must implement validate, load, and save methods`);
    }
    
    this.plugins.set(name, plugin);
    this.defaults.plugins[name] = plugin.getDefaults ? plugin.getDefaults() : {};
  }

  /**
   * Get plugin by name
   * @param {string} name - Plugin name
   * @returns {Object|null} Plugin instance or null if not found
   */
  getPlugin(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * Load configuration using hierarchy: CLI args → env vars → config file → defaults
   * @param {Object} cliOptions - Command line options (highest priority)
   * @returns {Promise<Object>} Merged configuration object
   */
  async loadConfiguration(cliOptions = {}) {
    const config = { ...this.defaults };
    
    // Load configuration from file
    try {
      await this.loadFromFile(config);
    } catch (error) {
      console.warn('Failed to load main config file:', error.message);
    }
    
    // Load plugin configurations
    for (const [name, plugin] of this.plugins) {
      try {
        const pluginConfig = await plugin.load(this.configDir);
        config.plugins[name] = { ...config.plugins[name], ...pluginConfig };
      } catch (error) {
        console.warn(`Failed to load plugin config for ${name}:`, error.message);
      }
    }
    
    // Override with environment variables
    this.applyEnvironmentOverrides(config);
    
    // Override with CLI options (highest priority)
    Object.assign(config, cliOptions);
    
    // Validate final configuration
    const validation = await this.validateConfiguration(config);
    if (!validation.valid) {
      console.warn('Configuration validation errors:', validation.errors);
      return validation.config; // Return safe defaults
    }
    
    this.sharedData = config;
    return config;
  }

  /**
   * Load configuration from main config file
   * @param {Object} config - Configuration object to merge into
   */
  async loadFromFile(config) {
    const configFile = path.join(this.configDir, 'config.json');
    
    if (fs.existsSync(configFile)) {
      const fileConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      Object.assign(config, fileConfig);
    }
  }

  /**
   * Apply environment variable overrides
   * @param {Object} config - Configuration object to modify
   */
  applyEnvironmentOverrides(config) {
    // Base environment variables
    if (process.env.CLAUDE_USER_ID) {
      config.userId = process.env.CLAUDE_USER_ID;
    }
    if (process.env.CLAUDE_CONFIG_DIR) {
      config.configDir = process.env.CLAUDE_CONFIG_DIR;
    }
    
    // Plugin-specific environment variables
    for (const [name, plugin] of this.plugins) {
      if (plugin.applyEnvironmentOverrides) {
        plugin.applyEnvironmentOverrides(config.plugins[name]);
      }
    }
  }

  /**
   * Validate complete configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result with valid flag, config, and errors
   */
  async validateConfiguration(config) {
    const errors = [];
    
    // Validate base configuration
    if (!config.version || typeof config.version !== 'string') {
      errors.push({
        path: 'version',
        message: 'Configuration version is required and must be a string'
      });
    }
    
    if (!config.userId || typeof config.userId !== 'string') {
      errors.push({
        path: 'userId',
        message: 'User ID is required and must be a string'
      });
    }
    
    // Validate plugin configurations
    for (const [name, plugin] of this.plugins) {
      try {
        const pluginValidation = await plugin.validate(config.plugins[name]);
        if (!pluginValidation.valid) {
          errors.push(...pluginValidation.errors.map(err => ({
            ...err,
            path: `plugins.${name}.${err.path}`
          })));
        }
      } catch (error) {
        errors.push({
          path: `plugins.${name}`,
          message: `Plugin validation failed: ${error.message}`
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      config: errors.length === 0 ? config : this.defaults,
      errors
    };
  }

  /**
   * Save configuration to file system
   * @param {Object} config - Configuration to save
   */
  async saveConfiguration(config) {
    try {
      // Save main configuration
      const configFile = path.join(this.configDir, 'config.json');
      const mainConfig = { ...config };
      delete mainConfig.plugins; // Don't save plugin configs in main file
      
      fs.writeFileSync(configFile, JSON.stringify(mainConfig, null, 2));
      
      // Save plugin configurations
      for (const [name, plugin] of this.plugins) {
        try {
          await plugin.save(config.plugins[name], this.configDir);
        } catch (error) {
          console.warn(`Failed to save plugin config for ${name}:`, error.message);
        }
      }
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.SAVE_FAILED}: ${error.message}`);
    }
  }

  /**
   * Get shared data for cross-plugin communication
   * @returns {Object} Shared data object
   */
  getSharedData() {
    return { ...this.sharedData };
  }

  /**
   * Update shared data
   * @param {Object} data - Data to merge into shared data
   */
  updateSharedData(data) {
    Object.assign(this.sharedData, data);
  }

  /**
   * Get configuration for specific plugin
   * @param {string} pluginName - Name of the plugin
   * @returns {Object} Plugin configuration
   */
  getPluginConfig(pluginName) {
    return this.sharedData.plugins && this.sharedData.plugins[pluginName] 
      ? { ...this.sharedData.plugins[pluginName] }
      : {};
  }

  /**
   * Update configuration for specific plugin
   * @param {string} pluginName - Name of the plugin
   * @param {Object} config - Configuration to merge
   */
  updatePluginConfig(pluginName, config) {
    if (!this.sharedData.plugins) {
      this.sharedData.plugins = {};
    }
    if (!this.sharedData.plugins[pluginName]) {
      this.sharedData.plugins[pluginName] = {};
    }
    Object.assign(this.sharedData.plugins[pluginName], config);
  }

  /**
   * Create manager instance with shared configuration
   * @param {string} pluginName - Name of the plugin
   * @param {Function} ManagerClass - Manager class constructor
   * @returns {Object} Manager instance with shared data
   */
  createManager(pluginName, ManagerClass) {
    const sharedData = this.getSharedData();
    const pluginConfig = this.getPluginConfig(pluginName);
    
    return new ManagerClass({
      ...sharedData,
      ...pluginConfig,
      configManager: this
    });
  }

  /**
   * Migrate configuration from older versions
   */
  async migrateConfiguration() {
    const configFile = path.join(this.configDir, 'config.json');
    
    if (!fs.existsSync(configFile)) {
      return this.defaults;
    }
    
    try {
      const oldConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      const oldVersion = oldConfig.version || '1.0.0';
      
      // Create backup
      const backupPath = `${configFile}.backup-${oldVersion}`;
      fs.copyFileSync(configFile, backupPath);
      
      // Migrate main configuration
      const migratedConfig = { ...this.defaults };
      Object.keys(this.defaults).forEach(key => {
        if (oldConfig[key] !== undefined) {
          migratedConfig[key] = oldConfig[key];
        }
      });
      
      migratedConfig.version = CONFIG_VERSION;
      
      // Migrate plugin configurations
      for (const [name, plugin] of this.plugins) {
        if (plugin.migrate) {
          try {
            migratedConfig.plugins[name] = await plugin.migrate(
              oldConfig.plugins && oldConfig.plugins[name], 
              this.configDir
            );
          } catch (error) {
            console.warn(`Failed to migrate plugin ${name}:`, error.message);
          }
        }
      }
      
      // Save migrated configuration
      await this.saveConfiguration(migratedConfig);
      
      return migratedConfig;
    } catch (error) {
      console.warn('Failed to migrate configuration:', error.message);
      return this.defaults;
    }
  }

  /**
   * Event system for cross-plugin communication
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.logError('event-system', `Error in event listener for ${event}: ${error.message}`);
        }
      });
    }
  }

  /**
   * Log error for debugging and monitoring
   * @param {string} plugin - Plugin name
   * @param {string} error - Error message
   */
  logError(plugin, error) {
    this.errorLogs.push({
      timestamp: new Date().toISOString(),
      plugin,
      error
    });
  }

  /**
   * Get error logs
   * @returns {Array} Array of error log entries
   */
  getErrorLogs() {
    return [...this.errorLogs];
  }

  /**
   * Clear error logs
   */
  clearErrorLogs() {
    this.errorLogs = [];
  }

  /**
   * Get list of registered plugin names
   * @returns {Array} Array of registered plugin names
   */
  getRegisteredPlugins() {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get plugin instance by name
   * @param {string} name - Plugin name
   * @returns {Object} Plugin instance
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }
}

module.exports = ConfigurationManager;