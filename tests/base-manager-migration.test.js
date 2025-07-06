/**
 * BaseManager Migration Tests
 * 
 * Tests for verifying that manager classes properly migrate to BaseManager
 * while maintaining existing functionality and APIs.
 */

const fs = require('fs');
const path = require('path');
const AccessibilityManager = require('../lib/accessibility-personalization/accessibility-manager');
const InteractiveSetupWizard = require('../lib/interactive-features/setup-wizard');
const UXResearchCollector = require('../lib/ux-research/research-collector');
const BaseManager = require('../lib/shared/base-manager');

describe('BaseManager Migration Tests', () => {
  let tempDir;

  beforeEach(() => {
    // Create temporary directory for testing
    tempDir = path.join(__dirname, 'temp-migration-test');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  describe('AccessibilityManager BaseManager Migration', () => {
    test('should maintain existing constructor API (legacy pattern)', () => {
      const manager = new AccessibilityManager({
        userId: 'test-user',
        preferences: { theme: 'dark' }
      });

      expect(manager.getUserId()).toBe('test-user');
      expect(manager.preferences).toEqual({ theme: 'dark' });
    });

    test('should support ConfigurationManager integration', () => {
      const mockConfigManager = {
        configDir: tempDir,
        on: jest.fn(),
        emit: jest.fn(),
        updatePluginConfig: jest.fn(),
        updateSharedData: jest.fn(),
        logError: jest.fn()
      };

      const manager = new AccessibilityManager({
        userId: 'test-user',
        configManager: mockConfigManager
      });

      expect(manager.configManager).toBe(mockConfigManager);
      expect(manager.getDataDir()).toBe(path.join(tempDir, 'accessibility'));
    });

    test('should maintain data directory management', () => {
      const manager = new AccessibilityManager({ userId: 'test-user' });
      
      // Should have created data directory
      expect(fs.existsSync(manager.getDataDir())).toBe(true);
    });

    test('should maintain event handling capabilities', () => {
      const mockConfigManager = {
        configDir: tempDir,
        on: jest.fn(),
        emit: jest.fn()
      };

      const manager = new AccessibilityManager({
        configManager: mockConfigManager
      });

      // Should have set up event listeners
      expect(mockConfigManager.on).toHaveBeenCalledWith('theme:changed', expect.any(Function));
    });

    test('should inherit BaseManager functionality after migration', () => {
      // This test will validate that AccessibilityManager extends BaseManager
      // after migration while maintaining all existing functionality
      
      const manager = new AccessibilityManager({ userId: 'test-user' });
      
      // Should have BaseManager methods available
      expect(typeof manager.logError).toBe('function');
      expect(typeof manager.getReceivedEvents).toBe('function');
      expect(typeof manager.emit).toBe('function');
      
      // Should maintain accessibility-specific functionality
      expect(typeof manager.formatForScreenReader).toBe('function');
      expect(typeof manager.validateContrast).toBe('function');
      expect(typeof manager.announceProgress).toBe('function');
    });

    test('should handle error logging consistently', () => {
      const manager = new AccessibilityManager({ userId: 'test-user' });
      
      // Test error handling
      expect(() => {
        manager.handleError('test-operation', new Error('test error'));
      }).toThrow();
    });

    test('should maintain backward compatibility for all public methods', () => {
      const manager = new AccessibilityManager({
        userId: 'test-user',
        preferences: { screenReader: true }
      });

      // Test all public methods still work
      expect(typeof manager.formatForScreenReader).toBe('function');
      expect(typeof manager.validateContrast).toBe('function');
      expect(typeof manager.formatOutput).toBe('function');
      expect(typeof manager.announceProgress).toBe('function');
      expect(typeof manager.generateAlternativeText).toBe('function');
      expect(typeof manager.updateSettings).toBe('function');
      expect(typeof manager.loadLegacyData).toBe('function');
    });
  });

  describe('InteractiveSetupWizard BaseManager Migration', () => {
    test('should maintain existing constructor API (legacy pattern)', () => {
      const wizard = new InteractiveSetupWizard({
        userId: 'test-user',
        projectId: 'test-project',
        preferences: { theme: 'dark' }
      });

      expect(wizard.getUserId()).toBe('test-user');
      expect(wizard.projectId).toBe('test-project');
      expect(wizard.preferences).toEqual({ theme: 'dark' });
    });

    test('should support ConfigurationManager integration', () => {
      const mockConfigManager = {
        configDir: tempDir,
        on: jest.fn(),
        emit: jest.fn()
      };

      const wizard = new InteractiveSetupWizard({
        userId: 'test-user',
        configManager: mockConfigManager
      });

      expect(wizard.configManager).toBe(mockConfigManager);
      expect(wizard.getDataDir()).toBe(path.join(tempDir, 'interactive-features'));
    });

    test('should inherit BaseManager functionality after migration', () => {
      const wizard = new InteractiveSetupWizard({ userId: 'test-user' });
      
      // Should have BaseManager methods available
      expect(typeof wizard.logError).toBe('function');
      expect(typeof wizard.getReceivedEvents).toBe('function');
      expect(typeof wizard.emit).toBe('function');
      
      // Should maintain interactive setup specific functionality
      expect(typeof wizard.analyzeEnvironment).toBe('function');
      expect(typeof wizard.executeStep).toBe('function');
      expect(typeof wizard.saveProgress).toBe('function');
      expect(typeof wizard.resumeProgress).toBe('function');
    });

    test('should handle progress persistence with error logging', () => {
      const wizard = new InteractiveSetupWizard({ userId: 'test-user' });
      
      // Initialize some progress
      wizard.initializeProgress([
        { id: 'step1', title: 'Test Step', commands: [] }
      ]);

      // Should have saved progress without errors
      const errorLogs = wizard.getErrorLogs();
      expect(errorLogs.length).toBe(0);

      // Should be able to resume progress
      expect(typeof wizard.resumeProgress).toBe('function');
    });

    test('should maintain backward compatibility for all public methods', () => {
      const wizard = new InteractiveSetupWizard({
        userId: 'test-user',
        projectId: 'test-project'
      });

      // Test all public methods still work
      expect(typeof wizard.analyzeEnvironment).toBe('function');
      expect(typeof wizard.executeStep).toBe('function');
      expect(typeof wizard.initializeProgress).toBe('function');
      expect(typeof wizard.completeStep).toBe('function');
      expect(typeof wizard.getProgress).toBe('function');
      expect(typeof wizard.saveProgress).toBe('function');
      expect(typeof wizard.resumeProgress).toBe('function');
    });
  });

  describe('UXResearchCollector BaseManager Migration', () => {
    test('should maintain existing constructor API (modern pattern)', () => {
      const collector = new UXResearchCollector({
        userId: 'test-user'
      });

      expect(collector.getUserId()).toBe('test-user');
      expect(Array.isArray(collector.painPoints)).toBe(true);
      expect(Array.isArray(collector.workflows)).toBe(true);
    });

    test('should support ConfigurationManager integration', () => {
      const mockConfigManager = {
        configDir: tempDir,
        on: jest.fn(),
        emit: jest.fn()
      };

      const collector = new UXResearchCollector({
        userId: 'test-user',
        configManager: mockConfigManager
      });

      expect(collector.configManager).toBe(mockConfigManager);
      expect(collector.getDataDir()).toBe(path.join(tempDir, 'ux-research'));
    });

    test('should inherit BaseManager functionality after migration', () => {
      const collector = new UXResearchCollector({ userId: 'test-user' });
      
      // Should have BaseManager methods available
      expect(typeof collector.logError).toBe('function');
      expect(typeof collector.getReceivedEvents).toBe('function');
      expect(typeof collector.emit).toBe('function');
      
      // Should maintain UX research specific functionality
      expect(typeof collector.addPainPoint).toBe('function');
      expect(typeof collector.recordWorkflow).toBe('function');
      expect(typeof collector.saveData).toBe('function');
      expect(typeof collector.loadData).toBe('function');
    });

    test('should handle data persistence with error logging', () => {
      const collector = new UXResearchCollector({ userId: 'test-user' });
      
      // Add some test data
      collector.addPainPoint({
        description: 'Test pain point',
        severity: 'medium',
        frequency: 'common',
        userType: 'developer'
      });

      // Should save without errors
      const savedPath = collector.saveData();
      expect(savedPath).toBeDefined();
      expect(fs.existsSync(savedPath)).toBe(true);

      // Should load without errors
      const loadResult = collector.loadData();
      expect(loadResult).toBe(true);
      
      // Should have no error logs
      const errorLogs = collector.getErrorLogs();
      expect(errorLogs.length).toBe(0);
    });

    test('should maintain backward compatibility for all public methods', () => {
      const collector = new UXResearchCollector({ userId: 'test-user' });

      // Test all public methods still work
      expect(typeof collector.addPainPoint).toBe('function');
      expect(typeof collector.getPainPoints).toBe('function');
      expect(typeof collector.recordWorkflow).toBe('function');
      expect(typeof collector.getWorkflows).toBe('function');
      expect(typeof collector.generateJourneyMap).toBe('function');
      expect(typeof collector.getTopOpportunities).toBe('function');
      expect(typeof collector.saveData).toBe('function');
      expect(typeof collector.loadData).toBe('function');
    });

    test('should handle data operations and journey map generation', () => {
      const collector = new UXResearchCollector({ userId: 'test-user' });

      // Add test data
      const painPoint = collector.addPainPoint({
        description: 'Complex setup process',
        severity: 'high',
        frequency: 'common',
        userType: 'beginner'
      });

      const workflow = collector.recordWorkflow({
        userType: 'beginner',
        steps: ['init', 'config', 'build'],
        successfulCompletion: false,
        dropOffPoint: 'config'
      });

      expect(painPoint.id).toBeDefined();
      expect(workflow.sessionId).toBeDefined();
      expect(collector.getPainPoints()).toHaveLength(1);
      expect(collector.getWorkflows()).toHaveLength(1);

      // Test journey map generation
      const journeyMap = collector.generateJourneyMap('beginner');
      expect(journeyMap).toHaveProperty('painPoints');
      expect(journeyMap).toHaveProperty('stages');
      expect(journeyMap).toHaveProperty('opportunities');
    });
  });

  describe('BaseManager Core Functionality', () => {
    test('should provide consistent constructor patterns', () => {
      const manager = new BaseManager({
        userId: 'test-user',
        configDir: tempDir,
        subDir: 'test-sub'
      });

      expect(manager.userId).toBe('test-user');
      expect(manager.dataDir).toBe(path.join(tempDir, 'test-sub'));
    });

    test('should handle ConfigurationManager integration', () => {
      const mockConfigManager = {
        configDir: tempDir,
        on: jest.fn(),
        emit: jest.fn(),
        getPluginConfig: jest.fn().mockReturnValue({ test: 'config' })
      };

      const manager = new BaseManager({
        configManager: mockConfigManager,
        pluginName: 'test-plugin'
      });

      expect(manager.configManager).toBe(mockConfigManager);
      expect(manager.getPluginConfig()).toEqual({ test: 'config' });
    });

    test('should provide error logging capabilities', () => {
      const manager = new BaseManager({ userId: 'test-user' });
      
      manager.logError(new Error('test error'), { context: 'test' });
      
      const errorLogs = manager.getErrorLogs();
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].error).toBe('test error');
      expect(errorLogs[0].context).toEqual({ context: 'test' });
    });

    test('should provide event tracking', () => {
      const mockConfigManager = {
        configDir: tempDir,
        on: jest.fn((eventType, callback) => {
          // Simulate receiving an event
          setTimeout(() => callback({ data: 'test-data' }), 0);
        }),
        emit: jest.fn()
      };

      const manager = new BaseManager({ configManager: mockConfigManager });
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const events = manager.getReceivedEvents();
          expect(events.length).toBeGreaterThan(0);
          resolve();
        }, 10);
      });
    });
  });
});