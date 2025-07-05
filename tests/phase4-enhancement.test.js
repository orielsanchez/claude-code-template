const path = require('path');
const fs = require('fs');
const os = require('os');

// Import the systems we're testing
const ConfigurationManager = require('../lib/shared/configuration-manager');
const UserPreferenceManager = require('../lib/accessibility-personalization/preference-manager');
const UnifiedPreferenceManager = require('../lib/shared/unified-preference-manager');

// Systems to be converted to plugins
const ErrorRecoverySystem = require('../lib/interactive-features/error-recovery');
const LayeredHelpSystem = require('../lib/interactive-features/help-system');

describe('Phase 4 Enhancement: Complete Plugin Architecture', () => {
  let testDir;
  let configManager;
  let originalConsoleWarn;
  let mockWarn;

  beforeEach(() => {
    // Create test directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase4-test-'));
    
    // Mock console.warn to capture deprecation warnings
    originalConsoleWarn = console.warn;
    mockWarn = jest.fn();
    console.warn = mockWarn;
    
    // Create fresh ConfigurationManager
    configManager = new ConfigurationManager(testDir);
  });

  afterEach(() => {
    // Restore console.warn
    console.warn = originalConsoleWarn;
    
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Phase 4A: UserPreferenceManager Deprecation', () => {
    it('should redirect to UnifiedPreferenceManager with deprecation warning', () => {
      const userPrefManager = new UserPreferenceManager(testDir);
      
      // Should log deprecation warning
      expect(mockWarn).toHaveBeenCalledWith(
        'UserPreferenceManager is deprecated. Use UnifiedPreferenceManager instead.'
      );
      
      // Should delegate to UnifiedPreferenceManager
      expect(userPrefManager._implementation).toBeInstanceOf(UnifiedPreferenceManager);
    });

    it('should maintain backward compatibility for existing API', () => {
      const userPrefManager = new UserPreferenceManager(testDir);
      
      // Test basic preference operations
      userPrefManager.setPreference('theme', 'dark');
      expect(userPrefManager.getPreference('theme')).toBe('dark');
      
      // Test preference categories
      userPrefManager.setPreference('accessibility.fontSize', '16px');
      expect(userPrefManager.getPreference('accessibility.fontSize')).toBe('16px');
      
      // Test preference removal
      userPrefManager.removePreference('theme');
      expect(userPrefManager.getPreference('theme')).toBeUndefined();
    });

    it('should support ConfigurationManager integration when provided', () => {
      const userPrefManager = new UserPreferenceManager(testDir, configManager);
      
      // Should not show deprecation warning when using ConfigurationManager
      expect(mockWarn).not.toHaveBeenCalled();
      
      // Should work with plugin architecture
      expect(userPrefManager._implementation).toBeInstanceOf(UnifiedPreferenceManager);
      expect(userPrefManager._implementation.configManager).toBe(configManager);
    });

    it('should handle preferences persistence correctly', () => {
      const userPrefManager = new UserPreferenceManager(testDir);
      
      // Set preferences
      userPrefManager.setPreference('user.name', 'Test User');
      userPrefManager.setPreference('user.email', 'test@example.com');
      
      // Create new instance (should load from persistence)
      const newUserPrefManager = new UserPreferenceManager(testDir);
      expect(newUserPrefManager.getPreference('user.name')).toBe('Test User');
      expect(newUserPrefManager.getPreference('user.email')).toBe('test@example.com');
    });
  });

  describe('Phase 4B: Interactive Systems Plugin Conversion', () => {
    describe('ErrorRecoverySystem Plugin Conversion', () => {
      it('should work with ConfigurationManager.createManager()', () => {
        const errorRecovery = configManager.createManager('errorRecovery', ErrorRecoverySystem);
        
        expect(errorRecovery).toBeInstanceOf(ErrorRecoverySystem);
        expect(errorRecovery.configManager).toBe(configManager);
      });

      it('should store error patterns via plugin configuration', () => {
        const errorRecovery = configManager.createManager('errorRecovery', ErrorRecoverySystem);
        
        // Should store patterns through ConfigurationManager
        const testPattern = {
          type: 'command_not_found',
          pattern: /command not found: (.+)/,
          suggestion: 'Try: npm install $1'
        };
        
        errorRecovery.addErrorPattern(testPattern);
        
        // Should be retrievable through plugin system
        const pluginConfig = configManager.getPluginConfig('errorRecovery');
        expect(pluginConfig.patterns).toContain(testPattern);
      });

      it('should emit events for cross-manager communication', () => {
        const errorRecovery = configManager.createManager('errorRecovery', ErrorRecoverySystem);
        
        const mockEventHandler = jest.fn();
        configManager.on('errorRecovery:patternAdded', mockEventHandler);
        
        errorRecovery.addErrorPattern({
          type: 'test_error',
          pattern: /test error/,
          suggestion: 'Test suggestion'
        });
        
        expect(mockEventHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'test_error',
            pattern: /test error/,
            suggestion: 'Test suggestion'
          })
        );
      });

      it('should maintain backward compatibility with legacy constructor', () => {
        const errorRecovery = new ErrorRecoverySystem(testDir);
        
        // Should work without ConfigurationManager
        expect(errorRecovery).toBeInstanceOf(ErrorRecoverySystem);
        expect(errorRecovery.configManager).toBeUndefined();
        
        // Should still support basic functionality
        errorRecovery.addErrorPattern({
          type: 'legacy_error',
          pattern: /legacy error/,
          suggestion: 'Legacy suggestion'
        });
        
        expect(errorRecovery.getErrorPatterns()).toHaveLength(1);
      });
    });

    describe('LayeredHelpSystem Plugin Conversion', () => {
      it('should integrate with user preferences through ConfigurationManager', () => {
        const helpSystem = configManager.createManager('helpSystem', LayeredHelpSystem);
        
        // Should access user preferences through ConfigurationManager
        configManager.updateSharedData({
          userPreferences: {
            helpLevel: 'advanced',
            showTooltips: true
          }
        });
        
        const helpLevel = helpSystem.getUserHelpLevel();
        expect(helpLevel).toBe('advanced');
      });

      it('should store analytics data through shared data system', () => {
        const helpSystem = configManager.createManager('helpSystem', LayeredHelpSystem);
        
        // Should store analytics through ConfigurationManager
        helpSystem.recordHelpUsage('command_help', 'git');
        
        const analytics = helpSystem.getHelpAnalytics();
        expect(analytics).toEqual(
          expect.objectContaining({
            'command_help': expect.objectContaining({
              'git': expect.any(Number)
            })
          })
        );
      });

      it('should respond to error recovery events', () => {
        const helpSystem = configManager.createManager('helpSystem', LayeredHelpSystem);
        const errorRecovery = configManager.createManager('errorRecovery', ErrorRecoverySystem);
        
        // Mock help suggestion method
        const mockSuggestHelp = jest.fn();
        helpSystem.suggestHelpForError = mockSuggestHelp;
        
        // Error recovery should trigger help suggestions
        errorRecovery.addErrorPattern({
          type: 'command_not_found',
          pattern: /command not found: (.+)/,
          suggestion: 'Try: npm install $1'
        });
        
        // Should have registered for error events
        expect(mockSuggestHelp).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'command_not_found'
          })
        );
      });

      it('should maintain backward compatibility with legacy constructor', () => {
        const helpSystem = new LayeredHelpSystem(testDir);
        
        // Should work without ConfigurationManager
        expect(helpSystem).toBeInstanceOf(LayeredHelpSystem);
        expect(helpSystem.configManager).toBeUndefined();
        
        // Should still support basic functionality
        helpSystem.recordHelpUsage('basic_help', 'test');
        expect(helpSystem.getHelpAnalytics()).toEqual(
          expect.objectContaining({
            'basic_help': expect.objectContaining({
              'test': expect.any(Number)
            })
          })
        );
      });
    });
  });

  describe('Phase 4C: Plugin Implementation Completion', () => {
    describe('Missing Plugin Implementations', () => {
      it('should implement ErrorRecoveryPlugin with proper validation', () => {
        const ErrorRecoveryPlugin = require('../lib/shared/plugins/error-recovery-plugin');
        
        const plugin = new ErrorRecoveryPlugin();
        
        // Should extend BaseConfigurationPlugin
        expect(plugin.constructor.name).toBe('ErrorRecoveryPlugin');
        expect(plugin.validate).toBeDefined();
        expect(plugin.getDefaults).toBeDefined();
        expect(plugin.getSchema).toBeDefined();
      });

      it('should implement HelpSystemPlugin with proper validation', () => {
        const HelpSystemPlugin = require('../lib/shared/plugins/help-system-plugin');
        
        const plugin = new HelpSystemPlugin();
        
        // Should extend BaseConfigurationPlugin
        expect(plugin.constructor.name).toBe('HelpSystemPlugin');
        expect(plugin.validate).toBeDefined();
        expect(plugin.getDefaults).toBeDefined();
        expect(plugin.getSchema).toBeDefined();
      });

      it('should register all plugins with ConfigurationManager', () => {
        // Register all Phase 4 plugins
        const ErrorRecoveryPlugin = require('../lib/shared/plugins/error-recovery-plugin');
        const HelpSystemPlugin = require('../lib/shared/plugins/help-system-plugin');
        
        configManager.registerPlugin('errorRecovery', new ErrorRecoveryPlugin());
        configManager.registerPlugin('helpSystem', new HelpSystemPlugin());
        
        // Should be registered
        expect(configManager.getRegisteredPlugins()).toEqual(
          expect.arrayContaining(['errorRecovery', 'helpSystem'])
        );
      });

      it('should validate plugin configuration schemas', () => {
        const ErrorRecoveryPlugin = require('../lib/shared/plugins/error-recovery-plugin');
        
        const plugin = new ErrorRecoveryPlugin();
        
        // Valid configuration should pass
        const validConfig = {
          patterns: [
            {
              type: 'command_not_found',
              pattern: 'command not found: (.+)',
              suggestion: 'Try: npm install $1'
            }
          ],
          maxPatterns: 100
        };
        
        expect(() => plugin.validate(validConfig)).not.toThrow();
        
        // Invalid configuration should fail
        const invalidConfig = {
          patterns: 'invalid_patterns_type',
          maxPatterns: 'invalid_number'
        };
        
        expect(() => plugin.validate(invalidConfig)).toThrow();
      });
    });

    describe('Plugin Event System Integration', () => {
      it('should emit and respond to plugin events', () => {
        const ErrorRecoveryPlugin = require('../lib/shared/plugins/error-recovery-plugin');
        const HelpSystemPlugin = require('../lib/shared/plugins/help-system-plugin');
        
        configManager.registerPlugin('errorRecovery', new ErrorRecoveryPlugin());
        configManager.registerPlugin('helpSystem', new HelpSystemPlugin());
        
        const errorRecovery = configManager.createManager('errorRecovery', ErrorRecoverySystem);
        const helpSystem = configManager.createManager('helpSystem', LayeredHelpSystem);
        
        // Mock event handlers
        const mockErrorHandler = jest.fn();
        const mockHelpHandler = jest.fn();
        
        configManager.on('errorRecovery:patternAdded', mockErrorHandler);
        configManager.on('helpSystem:usageRecorded', mockHelpHandler);
        
        // Trigger events
        errorRecovery.addErrorPattern({
          type: 'test_error',
          pattern: /test/,
          suggestion: 'Test suggestion'
        });
        
        helpSystem.recordHelpUsage('test_help', 'test_command');
        
        // Should have triggered event handlers
        expect(mockErrorHandler).toHaveBeenCalled();
        expect(mockHelpHandler).toHaveBeenCalled();
      });
    });
  });

  describe('Phase 4 Integration Tests', () => {
    it('should support complete plugin architecture workflow', () => {
      // Register all plugins
      const ErrorRecoveryPlugin = require('../lib/shared/plugins/error-recovery-plugin');
      const HelpSystemPlugin = require('../lib/shared/plugins/help-system-plugin');
      
      configManager.registerPlugin('errorRecovery', new ErrorRecoveryPlugin());
      configManager.registerPlugin('helpSystem', new HelpSystemPlugin());
      
      // Create managers through factory pattern
      const errorRecovery = configManager.createManager('errorRecovery', ErrorRecoverySystem);
      const helpSystem = configManager.createManager('helpSystem', LayeredHelpSystem);
      const userPrefs = new UserPreferenceManager(testDir, configManager);
      
      // Should work together seamlessly
      expect(errorRecovery.configManager).toBe(configManager);
      expect(helpSystem.configManager).toBe(configManager);
      expect(userPrefs._implementation.configManager).toBe(configManager);
    });

    it('should maintain backward compatibility for all systems', () => {
      // Legacy constructors should still work
      const errorRecovery = new ErrorRecoverySystem(testDir);
      const helpSystem = new LayeredHelpSystem(testDir);
      const userPrefs = new UserPreferenceManager(testDir);
      
      // Should function independently
      expect(errorRecovery).toBeInstanceOf(ErrorRecoverySystem);
      expect(helpSystem).toBeInstanceOf(LayeredHelpSystem);
      expect(userPrefs).toBeInstanceOf(UserPreferenceManager);
    });

    it('should handle cross-system communication and events', () => {
      const ErrorRecoveryPlugin = require('../lib/shared/plugins/error-recovery-plugin');
      const HelpSystemPlugin = require('../lib/shared/plugins/help-system-plugin');
      
      configManager.registerPlugin('errorRecovery', new ErrorRecoveryPlugin());
      configManager.registerPlugin('helpSystem', new HelpSystemPlugin());
      
      const errorRecovery = configManager.createManager('errorRecovery', ErrorRecoverySystem);
      const helpSystem = configManager.createManager('helpSystem', LayeredHelpSystem);
      
      // Mock cross-system communication
      const mockCrossSystemHandler = jest.fn();
      configManager.on('system:communication', mockCrossSystemHandler);
      
      // Should enable cross-system data sharing
      configManager.updateSharedData({
        errorPatterns: [
          { type: 'npm_error', pattern: /npm ERR!/, suggestion: 'Check npm logs' }
        ]
      });
      
      const sharedData = configManager.getSharedData().errorPatterns;
      expect(sharedData).toHaveLength(1);
      expect(sharedData[0].type).toBe('npm_error');
    });
  });
});