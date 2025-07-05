/**
 * Accessibility Configuration Plugin
 * 
 * Handles accessibility-specific configuration including:
 * - WCAG standards and contrast ratios
 * - Semantic prefix configurations
 * - Output format preferences for screen readers
 */

const BaseConfigurationPlugin = require('../base-configuration-plugin');
const { WCAG_STANDARDS, SEMANTIC_PREFIXES, ACCESSIBILITY_FEATURES } = require('../constants');

class AccessibilityPlugin extends BaseConfigurationPlugin {
  constructor() {
    super('accessibility', {
      fileName: 'accessibility-config.json',
      defaults: {
        wcagStandards: {
          aaContrastRatio: WCAG_STANDARDS.AA_CONTRAST_RATIO,
          aaaContrastRatio: WCAG_STANDARDS.AAA_CONTRAST_RATIO
        },
        semanticPrefixes: {
          success: SEMANTIC_PREFIXES.SUCCESS,
          error: SEMANTIC_PREFIXES.ERROR,
          warning: SEMANTIC_PREFIXES.WARNING,
          info: SEMANTIC_PREFIXES.INFO,
          progress: SEMANTIC_PREFIXES.PROGRESS
        },
        outputFormats: {
          screenReader: false,
          highContrast: false,
          structuredOutput: false,
          semanticPrefixes: true,
          keyboardNavigation: false
        }
      },
      schema: {
        wcagStandards: {
          type: 'object',
          required: false,
          properties: {
            aaContrastRatio: { type: 'number', minimum: 0 },
            aaaContrastRatio: { type: 'number', minimum: 0 }
          }
        },
        semanticPrefixes: {
          type: 'object',
          required: false
        },
        outputFormats: {
          type: 'object',
          required: false,
          properties: {
            screenReader: { type: 'boolean' },
            highContrast: { type: 'boolean' },
            structuredOutput: { type: 'boolean' }
          }
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
   * Apply environment variable overrides for accessibility settings
   * @param {Object} config - Configuration to modify
   */
  applyEnvironmentOverrides(config) {
    if (process.env.CLAUDE_SCREEN_READER === 'true') {
      config.outputFormats.screenReader = true;
    }
    
    if (process.env.CLAUDE_HIGH_CONTRAST === 'true') {
      config.outputFormats.highContrast = true;
    }
    
    if (process.env.CLAUDE_SEMANTIC_PREFIXES === 'false') {
      config.outputFormats.semanticPrefixes = false;
    }

    if (process.env.CLAUDE_STRUCTURED_OUTPUT === 'true') {
      config.outputFormats.structuredOutput = true;
    }
  }

  /**
   * Custom validation for accessibility configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  async validateConfig(config) {
    const errors = [];

    // Validate WCAG standards
    if (config.wcagStandards) {
      if (typeof config.wcagStandards !== 'object') {
        errors.push({
          path: 'wcagStandards',
          message: 'WCAG standards must be an object'
        });
      } else {
        if (config.wcagStandards.aaContrastRatio && typeof config.wcagStandards.aaContrastRatio !== 'number') {
          errors.push({
            path: 'wcagStandards.aaContrastRatio',
            message: 'AA contrast ratio must be a number'
          });
        }
        if (config.wcagStandards.aaaContrastRatio && typeof config.wcagStandards.aaaContrastRatio !== 'number') {
          errors.push({
            path: 'wcagStandards.aaaContrastRatio',
            message: 'AAA contrast ratio must be a number'
          });
        }
      }
    }

    // Validate semantic prefixes
    if (config.semanticPrefixes) {
      if (typeof config.semanticPrefixes !== 'object') {
        errors.push({
          path: 'semanticPrefixes',
          message: 'Semantic prefixes must be an object'
        });
      } else {
        for (const [key, value] of Object.entries(config.semanticPrefixes)) {
          if (typeof value !== 'string') {
            errors.push({
              path: `semanticPrefixes.${key}`,
              message: `Semantic prefix ${key} must be a string`
            });
          }
        }
      }
    }

    // Validate output formats
    if (config.outputFormats) {
      if (typeof config.outputFormats !== 'object') {
        errors.push({
          path: 'outputFormats',
          message: 'Output formats must be an object'
        });
      } else {
        for (const [key, value] of Object.entries(config.outputFormats)) {
          if (typeof value !== 'boolean') {
            errors.push({
              path: `outputFormats.${key}`,
              message: `Output format ${key} must be a boolean`
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Migrate accessibility configuration from older versions
   * @param {Object} oldConfig - Old configuration
   * @param {string} configDir - Configuration directory
   * @returns {Promise<Object>} Migrated configuration
   */
  async migrate(oldConfig, configDir) {
    if (!oldConfig) {
      return this.getDefaults();
    }

    const migratedConfig = { ...this.getDefaults() };

    // Handle old structure migrations
    if (oldConfig.screenReaderMode !== undefined) {
      migratedConfig.outputFormats.screenReader = oldConfig.screenReaderMode;
    }

    if (oldConfig.highContrastMode !== undefined) {
      migratedConfig.outputFormats.highContrast = oldConfig.highContrastMode;
    }

    // Preserve valid fields
    const validFields = ['wcagStandards', 'semanticPrefixes', 'outputFormats'];
    validFields.forEach(field => {
      if (oldConfig[field] !== undefined) {
        migratedConfig[field] = { ...migratedConfig[field], ...oldConfig[field] };
      }
    });

    return migratedConfig;
  }
}

module.exports = AccessibilityPlugin;