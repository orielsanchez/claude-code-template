/**
 * Test suite for UserPreferenceManager migration to BaseManager
 * Ensures backward compatibility and enhanced functionality
 */

const UserPreferenceManager = require('../lib/accessibility-personalization/preference-manager');
const BaseManager = require('../lib/shared/base-manager');
const ConfigurationManager = require('../lib/shared/configuration-manager');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('UserPreferenceManager Migration to BaseManager', () => {
  let tempDir;
  let configManager;
  let preferenceManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preference-test-'));
    configManager = new ConfigurationManager(tempDir);
    
    // Create preference manager with BaseManager pattern
    const options = {
      userId: 'test-user',
      configManager: configManager,
      subDir: 'preferences',
      pluginName: 'user-preferences'
    };
    preferenceManager = new UserPreferenceManager(options, configManager);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('BaseManager Integration', () => {
    test('should inherit from BaseManager', () => {
      expect(preferenceManager).toBeInstanceOf(BaseManager);
    });

    test('should support modern constructor options pattern', () => {
      expect(preferenceManager.userId).toBe('test-user');
      expect(preferenceManager.configManager).toBe(configManager);
      expect(preferenceManager.pluginName).toBe('user-preferences');
    });

    test('should have proper directory structure', () => {
      expect(preferenceManager.dataDir).toContain('preferences');
      expect(fs.existsSync(preferenceManager.dataDir)).toBe(true);
    });

    test('should use modern constructor pattern only', () => {
      // Test modern constructor with explicit options
      const modernOptions = {
        userId: 'modern-user',
        configManager: configManager,
        subDir: 'modern-prefs',
        pluginName: 'modern-preferences'
      };
      
      const modernManager = new UserPreferenceManager(modernOptions);
      expect(modernManager).toBeInstanceOf(BaseManager);
      expect(modernManager.userId).toBe('modern-user');
      expect(modernManager.configManager).toBe(configManager);
      expect(modernManager.pluginName).toBe('modern-preferences');
    });
  });

  describe('Enhanced Error Handling', () => {
    test('should use BaseManager.logError for standardized error handling', () => {
      // Clear any existing error logs
      preferenceManager.errorLogs = [];
      
      // Trigger an error scenario
      preferenceManager.logError(new Error('test error'), { 
        action: 'test-operation', 
        userId: preferenceManager.userId 
      });
      
      // Check that error was logged in the errorLogs array
      expect(preferenceManager.errorLogs).toHaveLength(1);
      expect(preferenceManager.errorLogs[0]).toMatchObject({
        error: 'test error',
        context: expect.objectContaining({ 
          action: 'test-operation',
          userId: 'test-user'
        }),
        timestamp: expect.any(String)
      });
    });
  });

  describe('Directory Management', () => {
    test('should provide getDataDir() method from BaseManager', () => {
      expect(typeof preferenceManager.getDataDir).toBe('function');
      expect(preferenceManager.getDataDir()).toBe(preferenceManager.dataDir);
    });

    test('should provide getConfigDir() method from BaseManager', () => {
      expect(typeof preferenceManager.getConfigDir).toBe('function');
      expect(preferenceManager.getConfigDir()).toBe(preferenceManager.configDir);
    });

    test('should inherit getUserId() method from BaseManager', () => {
      expect(typeof preferenceManager.getUserId).toBe('function');
      expect(preferenceManager.getUserId()).toBe('test-user');
    });

    test('should inherit getDefaultConfigDir() method from BaseManager', () => {
      expect(typeof preferenceManager.getDefaultConfigDir).toBe('function');
      const defaultDir = preferenceManager.getDefaultConfigDir();
      expect(defaultDir).toContain('claude-code');
    });
  });

  describe('Core Functionality Preservation', () => {
    test('should preserve preference loading functionality', async () => {
      // Test that the method exists and returns data
      expect(typeof preferenceManager.loadPreferences).toBe('function');
      
      const preferences = await preferenceManager.loadPreferences();
      expect(preferences).toBeDefined();
      expect(typeof preferences).toBe('object');
    });

    test('should preserve preference saving functionality', async () => {
      // Test that the method exists and can save data
      expect(typeof preferenceManager.savePreferences).toBe('function');
      
      const testPreferences = {
        theme: 'dark',
        outputFormat: 'json',
        accessibility: {
          screenReader: true,
          highContrast: false
        }
      };

      await expect(preferenceManager.savePreferences(testPreferences)).resolves.not.toThrow();
    });

    test('should preserve configuration validation', async () => {
      // Test that validation method exists
      expect(typeof preferenceManager.validateConfiguration).toBe('function');
      
      const validConfig = {
        theme: 'dark',
        outputFormat: 'json',
        version: '2.0.0'
      };

      // Validation should work without throwing
      await expect(preferenceManager.validateConfiguration(validConfig)).resolves.not.toThrow();
    });

    test('should preserve migration functionality', async () => {
      // Test that the migration method exists and can be called
      expect(typeof preferenceManager.migrateConfiguration).toBe('function');
      
      // Migration should work without throwing
      const result = await preferenceManager.migrateConfiguration();
      expect(result).toBeDefined();
    });

    test('should preserve customization functionality', async () => {
      const customizations = {
        shortcuts: {
          'copy': 'Ctrl+C',
          'paste': 'Ctrl+V'
        },
        accessibility: {
          fontSize: 'large',
          highContrast: true
        }
      };

      await expect(preferenceManager.saveCustomizations(customizations)).resolves.not.toThrow();
      
      // Verify customizations functionality exists
      expect(typeof preferenceManager.saveCustomizations).toBe('function');
    });
  });

  describe('Schema and Defaults', () => {
    test('should preserve configuration schema', () => {
      const schema = preferenceManager.getConfigurationSchema();
      
      expect(schema).toBeDefined();
      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
      expect(schema.properties.theme).toBeDefined();
      expect(schema.properties.outputFormat).toBeDefined();
    });

    test('should preserve default configuration', () => {
      const defaults = preferenceManager.getDefaultConfiguration();
      
      expect(defaults).toBeDefined();
      expect(defaults.version).toBe('2.0.0');
      expect(defaults.theme).toBeDefined();
      expect(defaults.outputFormat).toBeDefined();
    });
  });

  describe('Platform Integration', () => {
    test('should maintain platform-appropriate config paths', () => {
      const configPath = preferenceManager.getConfigPath();
      expect(configPath).toContain('config.json');
      
      const platformPath = preferenceManager.getPlatformAppropriateConfigPath();
      expect(typeof platformPath).toBe('string');
    });
  });

  describe('Integration with Configuration System', () => {
    test('should integrate with ConfigurationManager', () => {
      expect(preferenceManager.configManager).toBe(configManager);
      expect(preferenceManager.configDir).toBe(configManager.configDir);
    });

    test('should create preferences-specific subdirectory', () => {
      expect(preferenceManager.dataDir).toContain('preferences');
      expect(path.basename(preferenceManager.dataDir)).toBe('preferences');
    });

    test('should maintain unified manager delegation', () => {
      // Verify that UnifiedPreferenceManager is still used as backend
      expect(preferenceManager.unifiedManager).toBeDefined();
      expect(preferenceManager._implementation).toBe(preferenceManager.unifiedManager);
    });
  });

  describe('Error Recovery and Fallbacks', () => {
    test('should handle corrupted configuration gracefully', async () => {
      // Create corrupted config file
      const corruptedPath = path.join(preferenceManager.configDir, 'config.json');
      fs.writeFileSync(corruptedPath, 'invalid json content');

      // Should still load without throwing (may log warnings)
      const preferences = await preferenceManager.loadPreferences();
      expect(preferences).toBeDefined();
      expect(typeof preferences).toBe('object');
    });

    test('should handle missing configuration directory', async () => {
      // Test that BaseManager ensures directories exist
      expect(fs.existsSync(preferenceManager.dataDir)).toBe(true);
      expect(fs.existsSync(preferenceManager.configDir)).toBe(true);
    });
  });
});