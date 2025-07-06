/**
 * BaseManager - Consolidated manager patterns
 * 
 * Provides common functionality used across all manager classes:
 * - Consistent constructor patterns (legacy and modern support)
 * - Data directory management with platform-appropriate paths
 * - ConfigurationManager integration
 * - Event system setup and tracking
 * - Error logging and handling
 * - Plugin configuration retrieval
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { PLATFORM_PATHS } = require('./constants');

class BaseManager {
  constructor(options = {}) {
    // Handle both legacy sharedData pattern and modern options pattern
    this.userId = options.userId || 'default-user';
    this.appName = options.appName || 'claude-code';
    
    // ConfigurationManager integration
    this.configManager = options.configManager;
    
    if (this.configManager) {
      // Modern pattern: use ConfigurationManager's directory structure
      this.configDir = this.configManager.configDir;
      this.dataDir = options.subDir 
        ? path.join(this.configDir, options.subDir)
        : this.configDir;
    } else {
      // Legacy pattern: create own directory structure
      this.configDir = options.configDir || options.dataDir || this.getDefaultConfigDir();
      this.dataDir = options.dataDir || (options.subDir 
        ? path.join(this.configDir, options.subDir)
        : this.configDir);
    }
    
    // Plugin configuration
    this.pluginName = options.pluginName || null;
    
    // Event tracking and error handling
    this.receivedEvents = [];
    this.errorLogs = [];
    this.listeners = [];
    
    // Initialize directory structure
    this.ensureDataDir();
    
    // Set up event listeners if ConfigurationManager is available
    this.setupEventListeners();
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
   * Ensure data directory exists
   */
  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Get user ID
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Log error with timestamp
   */
  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: error.message || error,
      context
    };
    this.errorLogs.push(errorEntry);
    
    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Manager Error:', errorEntry);
    }
  }

  /**
   * Get plugin configuration from ConfigurationManager
   */
  getPluginConfig(pluginName = null) {
    if (!this.configManager) {
      return {};
    }
    
    const name = pluginName || this.pluginName;
    if (!name) {
      return {};
    }
    
    return this.configManager.getPluginConfig(name);
  }

  /**
   * Set up event listeners for ConfigurationManager integration
   */
  setupEventListeners() {
    if (!this.configManager || typeof this.configManager.on !== 'function') {
      return;
    }
    
    // Common event patterns that managers typically listen for
    const commonEvents = [
      'theme:changed',
      'config:updated', 
      'preferences:changed',
      'plugin:loaded'
    ];
    
    commonEvents.forEach(eventType => {
      this.configManager.on(eventType, (event) => {
        this.receivedEvents.push({
          type: eventType,
          data: event.data || event,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  /**
   * Emit event through ConfigurationManager if available
   */
  emit(eventType, data) {
    if (this.configManager && typeof this.configManager.emit === 'function') {
      this.configManager.emit(eventType, { data, source: this.constructor.name });
    }
  }

  /**
   * Get received events (for testing and debugging)
   */
  getReceivedEvents() {
    return [...this.receivedEvents];
  }

  /**
   * Clear event history (for testing)
   */
  clearEventHistory() {
    this.receivedEvents = [];
  }

  /**
   * Get error logs
   */
  getErrorLogs() {
    return [...this.errorLogs];
  }

  /**
   * Clear error logs (for testing)
   */
  clearErrorLogs() {
    this.errorLogs = [];
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
}

module.exports = BaseManager;