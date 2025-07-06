/**
 * Test suite for OptimizationEngine migration to BaseManager
 * Ensures backward compatibility and enhanced functionality
 */

const OptimizationEngine = require('../lib/validation-optimization/optimization-engine');
const BaseManager = require('../lib/shared/base-manager');
const ConfigurationManager = require('../lib/shared/configuration-manager');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('OptimizationEngine Migration to BaseManager', () => {
  let tempDir;
  let configManager;
  let optimizationEngine;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'optimization-test-'));
    configManager = new ConfigurationManager(tempDir);
    
    // Create optimization engine with BaseManager pattern
    const options = {
      userId: 'test-user',
      configManager: configManager,
      subDir: 'optimization',
      pluginName: 'optimization-engine'
    };
    optimizationEngine = new OptimizationEngine(options);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('BaseManager Integration', () => {
    test('should inherit from BaseManager', () => {
      expect(optimizationEngine).toBeInstanceOf(BaseManager);
    });

    test('should support modern constructor options pattern', () => {
      expect(optimizationEngine.userId).toBe('test-user');
      expect(optimizationEngine.configManager).toBe(configManager);
      expect(optimizationEngine.pluginName).toBe('optimization-engine');
    });

    test('should have proper directory structure', () => {
      expect(optimizationEngine.dataDir).toContain('optimization');
      expect(fs.existsSync(optimizationEngine.dataDir)).toBe(true);
    });

    test('should support default constructor', () => {
      // Test modern constructor with defaults
      const defaultEngine = new OptimizationEngine();
      expect(defaultEngine).toBeInstanceOf(BaseManager);
      expect(defaultEngine.userId).toBe('default-user');
      expect(defaultEngine.pluginName).toBe('optimization-engine');
    });
  });

  describe('Enhanced Error Handling', () => {
    test('should use BaseManager.logError for standardized error handling', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Trigger an error scenario
      optimizationEngine.logError(new Error('test error'), { 
        action: 'test-operation', 
        userId: optimizationEngine.userId 
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Manager Error:', expect.objectContaining({
        error: 'test error',
        context: expect.objectContaining({ 
          action: 'test-operation',
          userId: 'test-user'
        })
      }));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Directory Management', () => {
    test('should provide getDataDir() method from BaseManager', () => {
      expect(typeof optimizationEngine.getDataDir).toBe('function');
      expect(optimizationEngine.getDataDir()).toBe(optimizationEngine.dataDir);
    });

    test('should provide getConfigDir() method from BaseManager', () => {
      expect(typeof optimizationEngine.getConfigDir).toBe('function');
      expect(optimizationEngine.getConfigDir()).toBe(optimizationEngine.configDir);
    });
  });

  describe('Core Functionality Preservation', () => {
    test('should preserve implementOptimizations functionality', async () => {
      const optimizations = [
        {
          area: 'setup_performance',
          type: 'parallel_downloads',
          expectedImprovement: 0.35
        },
        {
          area: 'command_discovery',
          type: 'intelligent_suggestions',
          expectedImprovement: 0.25
        }
      ];

      const result = await optimizationEngine.implementOptimizations(optimizations);
      
      expect(result.implementedOptimizations).toBe(2);
      expect(result.successfulOptimizations).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.overallPerformanceGain).toBeGreaterThan(0);
      expect(result.regressionIssues).toEqual([]);
      
      // Verify stored optimizations
      expect(optimizationEngine.implementedOptimizations).toHaveLength(2);
    });

    test('should preserve optimizeFrictionPoints functionality', async () => {
      const frictionPoints = [
        {
          location: 'setup_wizard',
          issue: 'too_many_questions',
          severity: 'high'
        },
        {
          location: 'help_system',
          issue: 'information_overload',
          severity: 'medium'
        }
      ];

      const result = await optimizationEngine.optimizeFrictionPoints(frictionPoints);
      
      expect(result.optimizedPoints).toBe(2);
      expect(result.improvements).toHaveLength(2);
      expect(result.overallFrictionReduction).toBeGreaterThan(0);
      expect(result.userExperienceScore).toBeGreaterThan(8.5);
      
      // Verify optimization history tracking
      expect(optimizationEngine.optimizationHistory).toHaveLength(2);
    });

    test('should preserve implementIntelligentCaching functionality', async () => {
      const result = await optimizationEngine.implementIntelligentCaching();
      
      expect(result.strategiesImplemented).toHaveLength(3);
      expect(result.overallCacheEfficiency).toBeGreaterThan(0.8);
      expect(result.memoryUsage).toBe(12.5);
      expect(result.networkRequestReduction).toBe(0.38);
      
      // Verify cache strategies storage
      expect(optimizationEngine.cacheStrategies.size).toBe(3);
    });

    test('should preserve generateOptimizationRecommendations functionality', async () => {
      const result = await optimizationEngine.generateOptimizationRecommendations();
      
      expect(result.immediate).toHaveLength(2);
      expect(result.shortTerm).toHaveLength(1);
      expect(result.longTerm).toHaveLength(1);
      expect(result.architecturalImprovements).toHaveLength(3);
      expect(result.prioritizationMatrix.total).toBe(4);
    });
  });

  describe('Performance and State Management', () => {
    test('should maintain optimization state across operations', async () => {
      // Implement some optimizations
      await optimizationEngine.implementOptimizations([
        { area: 'test', type: 'test_opt', expectedImprovement: 0.2 }
      ]);
      
      // Optimize friction points
      await optimizationEngine.optimizeFrictionPoints([
        { location: 'test', issue: 'slow_performance', severity: 'high' }
      ]);
      
      // Verify state is maintained
      expect(optimizationEngine.implementedOptimizations).toHaveLength(1);
      expect(optimizationEngine.optimizationHistory).toHaveLength(1);
    });

    test('should handle plugin configuration if available', () => {
      // Test plugin configuration retrieval
      if (optimizationEngine.configManager && optimizationEngine.pluginName) {
        expect(() => {
          optimizationEngine.configManager.getPluginConfig(optimizationEngine.pluginName);
        }).not.toThrow();
      }
    });
  });

  describe('Integration with Configuration System', () => {
    test('should integrate with ConfigurationManager', () => {
      expect(optimizationEngine.configManager).toBe(configManager);
      expect(optimizationEngine.configDir).toBe(configManager.configDir);
    });

    test('should create optimization-specific subdirectory', () => {
      expect(optimizationEngine.dataDir).toContain('optimization');
      expect(path.basename(optimizationEngine.dataDir)).toBe('optimization');
    });
  });
});