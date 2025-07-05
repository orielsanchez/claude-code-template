/**
 * Configuration Plugins Registry
 * 
 * Central registry for all configuration plugins.
 * Provides easy access to all available plugins for the unified configuration system.
 */

const UserPreferencesPlugin = require('./user-preferences-plugin');
const AccessibilityPlugin = require('./accessibility-plugin');
const ThemePlugin = require('./theme-plugin');
const TemplatePlugin = require('./template-plugin');
const ErrorRecoveryPlugin = require('./error-recovery-plugin');
const HelpSystemPlugin = require('./help-system-plugin');
const RustPlugin = require('./rust-plugin');

// Registry of all available plugins
const AVAILABLE_PLUGINS = {
  'user-preferences': UserPreferencesPlugin,
  'accessibility': AccessibilityPlugin,
  'theme': ThemePlugin,
  'template': TemplatePlugin,
  'error-recovery': ErrorRecoveryPlugin,
  'help-system': HelpSystemPlugin,
  'rust': RustPlugin,
};

/**
 * Create and return all standard plugins
 * @returns {Map} Map of plugin name to plugin instance
 */
function createStandardPlugins() {
  const plugins = new Map();
  
  // Create instances of all standard plugins
  plugins.set('user-preferences', new UserPreferencesPlugin());
  plugins.set('accessibility', new AccessibilityPlugin());
  plugins.set('theme', new ThemePlugin());
  plugins.set('template', new TemplatePlugin());
  plugins.set('error-recovery', new ErrorRecoveryPlugin());
  plugins.set('help-system', new HelpSystemPlugin());
  plugins.set('rust', new RustPlugin());
  
  return plugins;
}

/**
 * Create a specific plugin by name
 * @param {string} pluginName - Name of the plugin to create
 * @param {...any} args - Arguments to pass to plugin constructor
 * @returns {Object} Plugin instance
 */
function createPlugin(pluginName, ...args) {
  const PluginClass = AVAILABLE_PLUGINS[pluginName];
  if (!PluginClass) {
    throw new Error(`Unknown plugin: ${pluginName}`);
  }
  
  return new PluginClass(...args);
}

/**
 * Get list of available plugin names
 * @returns {Array} Array of plugin names
 */
function getAvailablePluginNames() {
  return Object.keys(AVAILABLE_PLUGINS);
}

/**
 * Check if a plugin is available
 * @param {string} pluginName - Name of the plugin
 * @returns {boolean} True if plugin is available
 */
function isPluginAvailable(pluginName) {
  return pluginName in AVAILABLE_PLUGINS;
}

module.exports = {
  AVAILABLE_PLUGINS,
  createStandardPlugins,
  createPlugin,
  getAvailablePluginNames,
  isPluginAvailable
};