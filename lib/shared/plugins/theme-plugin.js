/**
 * Theme Configuration Plugin
 * 
 * Handles theme-specific configuration including:
 * - Predefined theme definitions
 * - Custom theme management
 * - Accessibility validation for themes
 */

const BaseConfigurationPlugin = require('../base-configuration-plugin');
const { THEME_NAMES } = require('../constants');

class ThemePlugin extends BaseConfigurationPlugin {
  constructor() {
    super('theme', {
      fileName: 'theme-config.json',
      defaults: {
        currentTheme: THEME_NAMES.DEFAULT,
        themes: {
          [THEME_NAMES.DEFAULT]: {
            name: THEME_NAMES.DEFAULT,
            colors: {
              success: '#00aa00',
              error: '#cc0000',
              warning: '#ff8800',
              info: '#0088cc'
            },
            semantics: {
              success: '✓ Success:',
              error: '✗ Error:',
              warning: '⚠ Warning:',
              info: 'ℹ Info:'
            },
            accessibility: {
              contrastValidated: false,
              wcagCompliance: 'A'
            }
          },
          [THEME_NAMES.DARK]: {
            name: THEME_NAMES.DARK,
            colors: {
              success: '#00dd00',
              error: '#ff4444',
              warning: '#ffaa00',
              info: '#44aaff'
            },
            semantics: {
              success: '✓ Success:',
              error: '✗ Error:',
              warning: '⚠ Warning:',
              info: 'ℹ Info:'
            },
            accessibility: {
              contrastValidated: true,
              wcagCompliance: 'AA'
            }
          },
          [THEME_NAMES.HIGH_CONTRAST]: {
            name: THEME_NAMES.HIGH_CONTRAST,
            colors: {
              success: '#00ff00',
              error: '#ff0000',
              warning: '#ffff00',
              info: '#00ffff'
            },
            semantics: {
              success: '✓ Success:',
              error: '✗ Error:',
              warning: '⚠ Warning:',
              info: 'ℹ Info:'
            },
            accessibility: {
              contrastValidated: true,
              wcagCompliance: 'AA'
            }
          },
          [THEME_NAMES.COLORBLIND_FRIENDLY]: {
            name: THEME_NAMES.COLORBLIND_FRIENDLY,
            colors: {
              success: '#0077bb',
              error: '#cc3311',
              warning: '#ee7733',
              info: '#33bbee'
            },
            semantics: {
              success: '✓ Success:',
              error: '✗ Error:',
              warning: '⚠ Warning:',
              info: 'ℹ Info:'
            },
            accessibility: {
              contrastValidated: true,
              wcagCompliance: 'AA'
            }
          }
        },
        customThemes: {}
      },
      schema: {
        currentTheme: {
          type: 'string',
          required: false
        },
        themes: {
          type: 'object',
          required: false
        },
        customThemes: {
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
   * Apply environment variable overrides for theme settings
   * @param {Object} config - Configuration to modify
   */
  applyEnvironmentOverrides(config) {
    if (process.env.CLAUDE_THEME) {
      config.currentTheme = process.env.CLAUDE_THEME;
    }
    
    if (process.env.CLAUDE_HIGH_CONTRAST === 'true') {
      config.currentTheme = THEME_NAMES.HIGH_CONTRAST;
    }
  }

  /**
   * Custom validation for theme configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  async validateConfig(config) {
    const errors = [];

    // Validate current theme exists (check against defaults + provided themes)
    if (config.currentTheme) {
      const defaultThemes = this.getDefaults().themes || {};
      const configThemes = config.themes || {};
      const customThemes = config.customThemes || {};
      const allThemes = { ...defaultThemes, ...configThemes, ...customThemes };
      
      if (!allThemes[config.currentTheme]) {
        errors.push({
          path: 'currentTheme',
          message: `Theme '${config.currentTheme}' does not exist`
        });
      }
    }

    // Validate theme structures
    const validateThemeStructure = (themes, basePath) => {
      if (typeof themes !== 'object') {
        errors.push({
          path: basePath,
          message: `${basePath} must be an object`
        });
        return;
      }

      for (const [themeName, theme] of Object.entries(themes)) {
        const themePath = `${basePath}.${themeName}`;
        
        if (typeof theme !== 'object') {
          errors.push({
            path: themePath,
            message: `Theme ${themeName} must be an object`
          });
          continue;
        }

        // Validate colors
        if (theme.colors && typeof theme.colors !== 'object') {
          errors.push({
            path: `${themePath}.colors`,
            message: `Theme ${themeName} colors must be an object`
          });
        }

        // Validate accessibility compliance
        if (theme.accessibility) {
          if (typeof theme.accessibility !== 'object') {
            errors.push({
              path: `${themePath}.accessibility`,
              message: `Theme ${themeName} accessibility must be an object`
            });
          } else if (theme.accessibility.wcagCompliance && 
                     !['A', 'AA', 'AAA'].includes(theme.accessibility.wcagCompliance)) {
            errors.push({
              path: `${themePath}.accessibility.wcagCompliance`,
              message: `Theme ${themeName} WCAG compliance must be A, AA, or AAA`
            });
          }
        }
      }
    };

    if (config.themes) {
      validateThemeStructure(config.themes, 'themes');
    }

    if (config.customThemes) {
      validateThemeStructure(config.customThemes, 'customThemes');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Migrate theme configuration from older versions
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
    if (oldConfig.activeTheme) {
      migratedConfig.currentTheme = oldConfig.activeTheme;
    }

    if (oldConfig.colorMode === 'dark') {
      migratedConfig.currentTheme = THEME_NAMES.DARK;
    } else if (oldConfig.colorMode === 'high-contrast') {
      migratedConfig.currentTheme = THEME_NAMES.HIGH_CONTRAST;
    }

    // Preserve valid fields
    const validFields = ['currentTheme', 'themes', 'customThemes'];
    validFields.forEach(field => {
      if (oldConfig[field] !== undefined) {
        migratedConfig[field] = { ...migratedConfig[field], ...oldConfig[field] };
      }
    });

    return migratedConfig;
  }

  /**
   * Get available theme names
   * @param {Object} config - Current configuration
   * @returns {Array} Array of theme names
   */
  getAvailableThemes(config) {
    const defaultThemes = Object.keys(config.themes || {});
    const customThemes = Object.keys(config.customThemes || {});
    return [...defaultThemes, ...customThemes];
  }

  /**
   * Get theme configuration by name
   * @param {Object} config - Current configuration
   * @param {string} themeName - Theme name
   * @returns {Object} Theme configuration
   */
  getThemeConfig(config, themeName) {
    const allThemes = { ...config.themes, ...config.customThemes };
    return allThemes[themeName] || null;
  }
}

module.exports = ThemePlugin;