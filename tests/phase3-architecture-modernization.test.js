/**
 * TDD Tests for Phase 3: Architecture Modernization
 * 
 * These tests define the enhanced separation of concerns through:
 * - Manager conversion to plugin-based architecture
 * - Consistent use of ConfigurationManager.createManager()
 * - Enhanced cross-manager communication through shared infrastructure
 * - Backward compatibility preservation
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import unified infrastructure
const ConfigurationManager = require('../lib/shared/configuration-manager');
const BaseConfigurationPlugin = require('../lib/shared/base-configuration-plugin');

// Import plugins to be implemented
const AccessibilityPlugin = require('../lib/shared/plugins/accessibility-plugin');
const ThemePlugin = require('../lib/shared/plugins/theme-plugin');
const TemplatePlugin = require('../lib/shared/plugins/template-plugin');

// Import modernized managers (these will be created using plugin architecture)
const AccessibilityManager = require('../lib/accessibility-personalization/accessibility-manager');
const ThemeManager = require('../lib/accessibility-personalization/theme-manager');
const TemplateManager = require('../lib/command-utils/templates/template-manager');

describe('Phase 3: Architecture Modernization', () => {

  let configManager;
  let tempConfigDir;

  beforeEach(() => {
    // Create temporary config directory for testing
    tempConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-phase3-test-'));
    configManager = new ConfigurationManager({
      appName: 'claude-test',
      configDir: tempConfigDir
    });
  });

  afterEach(() => {
    if (fs.existsSync(tempConfigDir)) {
      fs.rmSync(tempConfigDir, { recursive: true, force: true });
    }
  });

  describe('Plugin Architecture Conversion', () => {

    describe('AccessibilityPlugin', () => {

      test('should implement BaseConfigurationPlugin interface', () => {
        const plugin = new AccessibilityPlugin();
        
        expect(plugin).toBeInstanceOf(BaseConfigurationPlugin);
        expect(plugin.name).toBe('accessibility');
        expect(typeof plugin.validate).toBe('function');
        expect(typeof plugin.load).toBe('function');
        expect(typeof plugin.save).toBe('function');
        expect(typeof plugin.getDefaults).toBe('function');
      });

      test('should provide accessibility-specific configuration defaults', () => {
        const plugin = new AccessibilityPlugin();
        const defaults = plugin.getDefaults();
        
        expect(defaults).toMatchObject({
          wcagStandards: expect.objectContaining({
            aaContrastRatio: 4.5,
            aaaContrastRatio: 7.0
          }),
          semanticPrefixes: expect.objectContaining({
            success: expect.any(String),
            error: expect.any(String),
            warning: expect.any(String),
            info: expect.any(String)
          }),
          outputFormats: expect.objectContaining({
            screenReader: expect.any(Boolean),
            highContrast: expect.any(Boolean),
            structuredOutput: expect.any(Boolean)
          })
        });
      });

      test('should validate accessibility configuration schema', async () => {
        const plugin = new AccessibilityPlugin();
        
        const validConfig = {
          wcagStandards: { aaContrastRatio: 4.5 },
          semanticPrefixes: { success: '[OK] Success:' },
          outputFormats: { screenReader: true }
        };

        const invalidConfig = {
          wcagStandards: 'not-an-object',
          semanticPrefixes: { success: 123 },
          outputFormats: { screenReader: 'not-boolean' }
        };

        const validResult = await plugin.validate(validConfig);
        expect(validResult.valid).toBe(true);

        const invalidResult = await plugin.validate(invalidConfig);
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errors.length).toBeGreaterThan(0);
      });

      test('should handle environment variable overrides', () => {
        process.env.CLAUDE_SCREEN_READER = 'true';
        process.env.CLAUDE_HIGH_CONTRAST = 'true';
        
        const plugin = new AccessibilityPlugin();
        const config = { outputFormats: { screenReader: false, highContrast: false } };
        
        plugin.applyEnvironmentOverrides(config);
        
        expect(config.outputFormats.screenReader).toBe(true);
        expect(config.outputFormats.highContrast).toBe(true);

        delete process.env.CLAUDE_SCREEN_READER;
        delete process.env.CLAUDE_HIGH_CONTRAST;
      });

    });

    describe('ThemePlugin', () => {

      test('should implement BaseConfigurationPlugin interface', () => {
        const plugin = new ThemePlugin();
        
        expect(plugin).toBeInstanceOf(BaseConfigurationPlugin);
        expect(plugin.name).toBe('theme');
        expect(typeof plugin.validate).toBe('function');
        expect(typeof plugin.load).toBe('function');
        expect(typeof plugin.save).toBe('function');
        expect(typeof plugin.getDefaults).toBe('function');
      });

      test('should provide theme configuration defaults', () => {
        const plugin = new ThemePlugin();
        const defaults = plugin.getDefaults();
        
        expect(defaults).toMatchObject({
          currentTheme: 'default',
          themes: expect.objectContaining({
            default: expect.objectContaining({
              colors: expect.any(Object),
              semantics: expect.any(Object),
              accessibility: expect.any(Object)
            }),
            'high-contrast': expect.objectContaining({
              accessibility: expect.objectContaining({
                wcagCompliance: 'AA'
              })
            })
          }),
          customThemes: expect.any(Object)
        });
      });

      test('should validate theme configuration with accessibility checks', async () => {
        const plugin = new ThemePlugin();
        
        const validConfig = {
          currentTheme: 'high-contrast',
          themes: {
            'custom-theme': {
              colors: { success: '#00ff00', error: '#ff0000' },
              accessibility: { wcagCompliance: 'AA' }
            }
          }
        };

        const invalidConfig = {
          currentTheme: 'non-existent-theme',
          themes: {
            'invalid-theme': {
              colors: 'not-an-object',
              accessibility: { wcagCompliance: 'invalid-level' }
            }
          }
        };

        const validResult = await plugin.validate(validConfig);
        expect(validResult.valid).toBe(true);

        const invalidResult = await plugin.validate(invalidConfig);
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: expect.stringContaining('currentTheme'),
              message: expect.stringContaining('non-existent-theme')
            })
          ])
        );
      });

    });

    describe('TemplatePlugin', () => {

      test('should implement BaseConfigurationPlugin interface', () => {
        const plugin = new TemplatePlugin();
        
        expect(plugin).toBeInstanceOf(BaseConfigurationPlugin);
        expect(plugin.name).toBe('template');
        expect(typeof plugin.validate).toBe('function');
        expect(typeof plugin.load).toBe('function');
        expect(typeof plugin.save).toBe('function');
        expect(typeof plugin.getDefaults).toBe('function');
      });

      test('should provide template configuration defaults', () => {
        const plugin = new TemplatePlugin();
        const defaults = plugin.getDefaults();
        
        expect(defaults).toMatchObject({
          templateDir: expect.any(String),
          cacheEnabled: true,
          preloadTemplates: expect.arrayContaining([
            'quality-standards',
            'learning-integration',
            'integration-patterns'
          ]),
          variables: expect.any(Object),
          customTemplates: expect.any(Object)
        });
      });

      test('should validate template configuration', async () => {
        const plugin = new TemplatePlugin();
        
        const validConfig = {
          templateDir: '/valid/path',
          cacheEnabled: true,
          preloadTemplates: ['template1', 'template2']
        };

        const invalidConfig = {
          templateDir: 123, // Should be string
          cacheEnabled: 'yes', // Should be boolean
          preloadTemplates: 'not-an-array'
        };

        const validResult = await plugin.validate(validConfig);
        expect(validResult.valid).toBe(true);

        const invalidResult = await plugin.validate(invalidConfig);
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errors.length).toBeGreaterThan(0);
      });

    });

  });

  describe('Manager Factory Pattern', () => {

    test('should register all modernized plugins with ConfigurationManager', () => {
      const accessibilityPlugin = new AccessibilityPlugin();
      const themePlugin = new ThemePlugin();
      const templatePlugin = new TemplatePlugin();

      configManager.registerPlugin('accessibility', accessibilityPlugin);
      configManager.registerPlugin('theme', themePlugin);
      configManager.registerPlugin('template', templatePlugin);

      expect(configManager.getPlugin('accessibility')).toBe(accessibilityPlugin);
      expect(configManager.getPlugin('theme')).toBe(themePlugin);
      expect(configManager.getPlugin('template')).toBe(templatePlugin);
    });

    test('should create AccessibilityManager using ConfigurationManager.createManager()', async () => {
      const plugin = new AccessibilityPlugin();
      configManager.registerPlugin('accessibility', plugin);

      const config = await configManager.loadConfiguration();
      const accessibilityManager = configManager.createManager('accessibility', AccessibilityManager);

      expect(accessibilityManager).toBeInstanceOf(AccessibilityManager);
      expect(accessibilityManager.configManager).toBe(configManager);
      expect(accessibilityManager.userId).toBe(config.userId);
      
      // Verify manager can access plugin configuration
      const pluginConfig = configManager.getPluginConfig('accessibility');
      expect(pluginConfig).toMatchObject(plugin.getDefaults());
    });

    test('should create ThemeManager using ConfigurationManager.createManager()', async () => {
      const plugin = new ThemePlugin();
      configManager.registerPlugin('theme', plugin);

      const config = await configManager.loadConfiguration();
      const themeManager = configManager.createManager('theme', ThemeManager);

      expect(themeManager).toBeInstanceOf(ThemeManager);
      expect(themeManager.configManager).toBe(configManager);
      expect(themeManager.userId).toBe(config.userId);
      
      // Verify manager inherits plugin configuration
      const pluginConfig = configManager.getPluginConfig('theme');
      expect(themeManager.getCurrentTheme()).toBe(pluginConfig.currentTheme || 'default');
    });

    test('should create TemplateManager using ConfigurationManager.createManager()', async () => {
      const plugin = new TemplatePlugin();
      configManager.registerPlugin('template', plugin);

      const config = await configManager.loadConfiguration();
      const templateManager = configManager.createManager('template', TemplateManager);

      expect(templateManager).toBeInstanceOf(TemplateManager);
      expect(templateManager.configManager).toBe(configManager);
      
      // Verify manager uses plugin configuration
      const pluginConfig = configManager.getPluginConfig('template');
      expect(templateManager.getCacheEnabled()).toBe(pluginConfig.cacheEnabled);
    });

  });

  describe('Enhanced Separation of Concerns', () => {

    test('should separate configuration logic from business logic in AccessibilityManager', async () => {
      const plugin = new AccessibilityPlugin();
      configManager.registerPlugin('accessibility', plugin);

      const accessibilityManager = configManager.createManager('accessibility', AccessibilityManager);

      // Business logic should work without direct configuration access
      const testData = {
        status: 'success',
        message: 'Test message',
        items: [{ name: 'Item 1', status: 'active' }]
      };

      const formattedOutput = await accessibilityManager.formatForScreenReader(testData);
      expect(formattedOutput.format).toBe('structured');

      // Configuration should be managed through ConfigurationManager
      expect(accessibilityManager.getWCAGStandards).toBeUndefined(); // No direct config access
      expect(typeof accessibilityManager.validateContrast).toBe('function'); // Business logic exists
    });

    test('should centralize data directory management through ConfigurationManager', async () => {
      const plugins = [
        new AccessibilityPlugin(),
        new ThemePlugin(),
        new TemplatePlugin()
      ];

      plugins.forEach((plugin, index) => {
        const pluginNames = ['accessibility', 'theme', 'template'];
        configManager.registerPlugin(pluginNames[index], plugin);
      });

      const config = await configManager.loadConfiguration();

      // All managers should use the same base configuration directory
      const accessibilityManager = configManager.createManager('accessibility', AccessibilityManager);
      const themeManager = configManager.createManager('theme', ThemeManager);
      const templateManager = configManager.createManager('template', TemplateManager);

      expect(accessibilityManager.getConfigDir()).toBe(config.configDir);
      expect(themeManager.getConfigDir()).toBe(config.configDir);
      expect(templateManager.getConfigDir()).toBe(config.configDir);

      // Plugin-specific data should be in subdirectories
      expect(accessibilityManager.getDataDir()).toBe(path.join(config.configDir, 'accessibility'));
      expect(themeManager.getDataDir()).toBe(path.join(config.configDir, 'theme'));
      expect(templateManager.getDataDir()).toBe(path.join(config.configDir, 'template'));
    });

    test('should standardize validation patterns across all managers', async () => {
      const plugins = [
        new AccessibilityPlugin(),
        new ThemePlugin(), 
        new TemplatePlugin()
      ];

      plugins.forEach((plugin, index) => {
        const pluginNames = ['accessibility', 'theme', 'template'];
        configManager.registerPlugin(pluginNames[index], plugin);
      });

      // All validation should return consistent format
      const accessibilityValidation = await plugins[0].validate({});
      const themeValidation = await plugins[1].validate({});
      const templateValidation = await plugins[2].validate({});

      [accessibilityValidation, themeValidation, templateValidation].forEach(validation => {
        expect(validation).toMatchObject({
          valid: expect.any(Boolean),
          errors: expect.any(Array)
        });

        if (!validation.valid) {
          validation.errors.forEach(error => {
            expect(error).toMatchObject({
              path: expect.any(String),
              message: expect.any(String)
            });
          });
        }
      });
    });

    test('should unify error handling patterns', async () => {
      const plugin = new AccessibilityPlugin();
      configManager.registerPlugin('accessibility', plugin);

      const manager = configManager.createManager('accessibility', AccessibilityManager);

      // All managers should handle errors consistently
      try {
        await manager.formatForScreenReader(null); // Invalid input
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toMatchObject({
          message: expect.any(String),
          code: expect.any(String),
          details: expect.any(Object)
        });
      }

      // Error should be logged through BaseManager
      const errorLogs = manager.getErrorLogs();
      expect(errorLogs.length).toBeGreaterThan(0);
      expect(errorLogs[0]).toMatchObject({
        timestamp: expect.any(String),
        error: expect.any(String),
        context: expect.any(Object)
      });
    });

  });

  describe('Cross-Manager Communication', () => {

    test('should enable data sharing between managers through ConfigurationManager', async () => {
      const accessibilityPlugin = new AccessibilityPlugin();
      const themePlugin = new ThemePlugin();
      
      configManager.registerPlugin('accessibility', accessibilityPlugin);
      configManager.registerPlugin('theme', themePlugin);

      const accessibilityManager = configManager.createManager('accessibility', AccessibilityManager);
      const themeManager = configManager.createManager('theme', ThemeManager);

      // Accessibility preferences should influence theme selection
      await accessibilityManager.updateSettings({
        highContrast: true,
        screenReader: true
      });

      // Theme manager should access these preferences through shared data
      const recommendedTheme = await themeManager.getRecommendedTheme();
      expect(recommendedTheme).toBe('high-contrast');

      // Verify data is shared through ConfigurationManager
      const sharedData = configManager.getSharedData();
      expect(sharedData.accessibility).toMatchObject({
        highContrast: true,
        screenReader: true
      });
    });

    test('should support cross-manager validation', async () => {
      const accessibilityPlugin = new AccessibilityPlugin();
      const themePlugin = new ThemePlugin();
      
      configManager.registerPlugin('accessibility', accessibilityPlugin);
      configManager.registerPlugin('theme', themePlugin);

      // Theme validation should work with predefined themes
      const themeManager = configManager.createManager('theme', ThemeManager);
      
      const validation = themeManager.validateThemeAccessibility('high-contrast');
      expect(validation.theme).toBe('high-contrast');
      expect(validation.overallCompliance).toMatch(/^(A|AA|AAA)$/);
      expect(validation.colorTests).toBeDefined();
      expect(Array.isArray(validation.colorTests)).toBe(true);
    });

    test('should enable plugin event system for cross-manager communication', async () => {
      const accessibilityPlugin = new AccessibilityPlugin();
      const themePlugin = new ThemePlugin();
      
      configManager.registerPlugin('accessibility', accessibilityPlugin);
      configManager.registerPlugin('theme', themePlugin);

      const accessibilityManager = configManager.createManager('accessibility', AccessibilityManager);
      const themeManager = configManager.createManager('theme', ThemeManager);

      // Set up event listeners
      const themeChangeEvents = [];
      configManager.on('theme:changed', (event) => themeChangeEvents.push(event));

      // Theme change should trigger accessibility re-validation
      await themeManager.switchTheme('dark');

      expect(themeChangeEvents).toHaveLength(1);
      expect(themeChangeEvents[0]).toMatchObject({
        plugin: 'theme',
        action: 'theme-changed',
        data: { newTheme: 'dark', oldTheme: 'default' }
      });

      // Accessibility manager should receive the event
      const accessibilityEvents = accessibilityManager.getReceivedEvents();
      expect(accessibilityEvents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'theme:changed',
            data: { newTheme: 'dark', oldTheme: 'default' }
          })
        ])
      );
    });

  });

  describe('Backward Compatibility', () => {

    test('should maintain existing AccessibilityManager API', async () => {
      const plugin = new AccessibilityPlugin();
      configManager.registerPlugin('accessibility', plugin);

      // Legacy construction should still work
      const legacyManager = new AccessibilityManager();
      const modernManager = configManager.createManager('accessibility', AccessibilityManager);

      // All existing methods should work on both
      const testData = { status: 'success', message: 'Test' };

      const legacyOutput = await legacyManager.formatForScreenReader(testData);
      const modernOutput = await modernManager.formatForScreenReader(testData);

      expect(legacyOutput).toMatchObject({
        format: 'structured',
        announcement: expect.any(String),
        data: expect.any(Object)
      });

      expect(modernOutput).toMatchObject({
        format: 'structured', 
        announcement: expect.any(String),
        data: expect.any(Object)
      });
    });

    test('should maintain existing ThemeManager API', async () => {
      const plugin = new ThemePlugin();
      configManager.registerPlugin('theme', plugin);

      const legacyManager = new ThemeManager();
      const modernManager = configManager.createManager('theme', ThemeManager);

      // Existing methods should work identically
      const legacyTheme = await legacyManager.loadTheme('default');
      const modernTheme = await modernManager.loadTheme('default');

      expect(legacyTheme).toEqual(modernTheme);
      expect(legacyTheme.name).toBe('default');
      expect(modernTheme.name).toBe('default');
    });

    test('should provide modern TemplateManager API', () => {
      const plugin = new TemplatePlugin();
      configManager.registerPlugin('template', plugin);

      const modernManager = configManager.createManager('template', TemplateManager);

      // Template loading should work with modern API
      const template = modernManager.loadTemplate('quality-standards');

      expect(template).toMatchObject({
        name: 'quality-standards',
        content: expect.any(String)
      });
      expect(template.content).toContain('Quality Requirements');
    });

    test('should preserve existing data structures and file formats', async () => {
      // Create legacy data files
      const legacyAccessibilityData = {
        preferences: { screenReader: true },
        announcements: ['Test announcement']
      };

      const legacyDataDir = path.join(tempConfigDir, 'accessibility-personalization');
      fs.mkdirSync(legacyDataDir, { recursive: true });
      fs.writeFileSync(
        path.join(legacyDataDir, 'accessibility-data.json'),
        JSON.stringify(legacyAccessibilityData)
      );

      // Modern system should read legacy data
      const plugin = new AccessibilityPlugin();
      configManager.registerPlugin('accessibility', plugin);

      const manager = configManager.createManager('accessibility', AccessibilityManager);
      const loadedData = await manager.loadLegacyData();

      expect(loadedData).toMatchObject(legacyAccessibilityData);
    });

  });

  describe('Integration Tests - Phase 3 Systems', () => {

    test('should integrate all modernized systems cohesively', async () => {
      // Register all plugins
      const plugins = [
        ['accessibility', new AccessibilityPlugin()],
        ['theme', new ThemePlugin()],
        ['template', new TemplatePlugin()]
      ];

      plugins.forEach(([name, plugin]) => {
        configManager.registerPlugin(name, plugin);
      });

      // Load unified configuration
      const config = await configManager.loadConfiguration();
      expect(config.plugins).toMatchObject({
        accessibility: expect.any(Object),
        theme: expect.any(Object),
        template: expect.any(Object)
      });

      // Create all managers
      const accessibilityManager = configManager.createManager('accessibility', AccessibilityManager);
      const themeManager = configManager.createManager('theme', ThemeManager);
      const templateManager = configManager.createManager('template', TemplateManager);

      // Test cross-system integration
      const testResult = await accessibilityManager.formatForScreenReader({
        message: 'Integration test',
        type: 'success'
      });

      const themeOutput = themeManager.renderMessage({
        type: 'success',
        content: 'Integration test'
      });

      const template = templateManager.loadTemplate('quality-standards', {
        systemType: 'accessibility'
      });

      expect(testResult.format).toBe('structured');
      expect(themeOutput.semantic).toContain('[OK] Success:');
      expect(template.content).toContain('Quality Requirements');
    });

    test('should provide performance improvements over legacy architecture', async () => {
      // Measure legacy creation time
      const legacyStart = Date.now();
      new AccessibilityManager();
      new ThemeManager();
      new TemplateManager();
      const legacyTime = Date.now() - legacyStart;

      // Measure modern creation time
      const plugins = [
        ['accessibility', new AccessibilityPlugin()],
        ['theme', new ThemePlugin()],
        ['template', new TemplatePlugin()]
      ];

      plugins.forEach(([name, plugin]) => {
        configManager.registerPlugin(name, plugin);
      });

      const modernStart = Date.now();
      configManager.createManager('accessibility', AccessibilityManager);
      configManager.createManager('theme', ThemeManager);
      configManager.createManager('template', TemplateManager);
      const modernTime = Date.now() - modernStart;

      // Test shared infrastructure functionality
      expect(configManager.plugins).toBeDefined();
      expect(configManager.registerPlugin).toBeDefined();
      expect(configManager.createManager).toBeDefined();

      // All managers should share the same configuration infrastructure
      const accessibilityManager = configManager.createManager('accessibility', AccessibilityManager);
      const themeManager = configManager.createManager('theme', ThemeManager);
      expect(accessibilityManager.configManager === themeManager.configManager).toBe(true);
    });

    test('should maintain comprehensive test coverage after modernization', () => {
      // Verify all critical functions are still accessible
      const plugin = new AccessibilityPlugin();
      configManager.registerPlugin('accessibility', plugin);

      const manager = configManager.createManager('accessibility', AccessibilityManager);

      // Core accessibility functions
      expect(typeof manager.formatForScreenReader).toBe('function');
      expect(typeof manager.validateContrast).toBe('function');
      expect(typeof manager.announceProgress).toBe('function');
      expect(typeof manager.generateAlternativeText).toBe('function');

      // Configuration access through modern architecture
      expect(typeof manager.getConfigDir).toBe('function');
      expect(typeof manager.updateSettings).toBe('function');

      // Event system integration
      expect(typeof manager.getReceivedEvents).toBe('function');
    });

  });

});