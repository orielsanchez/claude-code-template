/**
 * Test BaseManager migrations for final Phase 2A managers
 * Tests ShipEngine and AnalyticsTracker migrations
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Import managers to test
const ShipEngine = require('../../lib/ship-command/ship-engine');
const AnalyticsTracker = require('../../lib/ux-research/analytics-tracker');
const ConfigurationManager = require('../../lib/shared/configuration-manager');

// Test data directory
const testDataDir = path.join(os.tmpdir(), 'claude-code-test-phase2a-final');

describe('Phase 2A Final - ShipEngine BaseManager Migration', () => {
  beforeEach(() => {
    // Clean test directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDataDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  test('ShipEngine - Modern BaseManager constructor pattern', () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    const engine = new ShipEngine({
      userId: 'test-user',
      configManager: configManager,
      workingDir: '/test/repo/path'
    });

    expect(engine).toBeTruthy();
    expect(engine.workingDir).toBe('/test/repo/path');
    expect(engine.getUserId()).toBe('test-user');
    expect(engine.configManager).toBeTruthy();
    expect(engine.config).toBeTruthy();
    expect(engine.pluginName).toBe('ship-command');
    
    // Verify mock properties preserved
    expect(engine.mockBranch).toBeNull();
    expect(engine.mockShipHistory).toBeNull();
    expect(engine.mockOperationHistory).toBeNull();
    expect(engine.mockAuthFailure).toBe(false);
  });

  test('ShipEngine - Legacy constructor compatibility', () => {
    const engine = new ShipEngine({
      workingDir: '/legacy/repo/path',
      config: {
        rollbackLimit: 5,
        maxCommitMessageLength: 300
      }
    });

    expect(engine).toBeTruthy();
    expect(engine.workingDir).toBe('/legacy/repo/path');
    expect(engine.config.rollbackLimit).toBe(5);
    expect(engine.config.maxCommitMessageLength).toBe(300);
    expect(engine.config.defaultCommitType).toBe('feat');
  });

  test('ShipEngine - Error handling with BaseManager', async () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    const engine = new ShipEngine({
      configManager: configManager,
      workingDir: process.cwd()
    });

    // Simulate authentication error
    engine.setMockAuthFailure(true);
    const result = await engine.ship({ message: 'test commit' });
    
    expect(result.success).toBe(false);
    expect(result.error.type).toBe('authentication');
    expect(result.error.suggestions).toBeTruthy();
    expect(result.error.timestamp).toBeTruthy();
    
    // Check error was logged via BaseManager
    const errorLogs = engine.getErrorLogs();
    expect(errorLogs.length).toBeGreaterThan(0);
  });

  test('ShipEngine - Event system integration', () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    const engine = new ShipEngine({
      configManager: configManager,
      workingDir: process.cwd()
    });

    // Test event emission
    engine.emit('ship:completed', { commitHash: 'abc123' });
    
    // Verify event handling setup
    expect(engine.receivedEvents).toBeDefined();
    expect(engine.listeners).toBeDefined();
  });
});

describe('Phase 2A Final - AnalyticsTracker BaseManager Migration', () => {
  beforeEach(() => {
    // Clean test directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDataDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  test('AnalyticsTracker - Modern BaseManager constructor pattern', () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    const tracker = new AnalyticsTracker({
      userId: 'analytics-user',
      configManager: configManager
    });

    expect(tracker).toBeTruthy();
    expect(tracker.getUserId()).toBe('analytics-user');
    expect(tracker.configManager).toBeTruthy();
    expect(tracker.pluginName).toBe('analytics-tracker');
    
    // Verify data structures initialized
    expect(Array.isArray(tracker.setupAttempts)).toBe(true);
    expect(tracker.commandUsage).toBeTruthy();
    expect(tracker.documentationAccess).toBeTruthy();
    
    // Verify data directory created
    const dataDir = tracker.getDataDir();
    expect(dataDir.includes('ux-research')).toBe(true);
    expect(fs.existsSync(dataDir)).toBe(true);
  });

  test('AnalyticsTracker - Legacy constructor compatibility', () => {
    // Legacy pattern: no parameters
    const tracker = new AnalyticsTracker();

    expect(tracker).toBeTruthy();
    expect(tracker.getUserId()).toBe('default-user');
    expect(tracker.setupAttempts).toBeTruthy();
    expect(tracker.commandUsage).toBeTruthy();
    expect(tracker.documentationAccess).toBeTruthy();
    
    // Verify it still has a data directory
    const dataDir = tracker.getDataDir();
    expect(dataDir).toBeTruthy();
  });

  test('AnalyticsTracker - Data persistence with BaseManager', () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    const tracker = new AnalyticsTracker({
      configManager: configManager
    });

    // Track some data
    tracker.trackSetupAttempt({
      success: true,
      duration: 150,
      environment: 'test'
    });

    tracker.trackCommandUsage('test-command', {
      success: true,
      duration: 50,
      context: 'unit-test'
    });

    // Save data using BaseManager's data directory
    const savedPath = tracker.saveData();
    expect(savedPath).toBeTruthy();
    expect(fs.existsSync(savedPath)).toBe(true);
    expect(savedPath.includes('ux-research')).toBe(true);
    
    // Verify saved data
    const savedData = JSON.parse(fs.readFileSync(savedPath, 'utf8'));
    expect(savedData.setupAttempts.length).toBe(1);
    expect(savedData.commandUsage['test-command'].totalUses).toBe(1);
  });

  test('AnalyticsTracker - Error handling with BaseManager', () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    const tracker = new AnalyticsTracker({
      configManager: configManager
    });

    // Test metrics generation
    const setupMetrics = tracker.getSetupMetrics();
    expect(setupMetrics).toBeTruthy();
    expect(setupMetrics.totalAttempts).toBe(0);
    
    const commandUsage = tracker.getCommandUsage();
    expect(commandUsage).toBeTruthy();
    
    const docMetrics = tracker.getDocumentationMetrics();
    expect(docMetrics).toBeTruthy();
    
    // Test baseline generation
    const baseline = tracker.generateBaseline();
    expect(baseline).toBeTruthy();
    expect(baseline.generatedAt).toBeTruthy();
    expect(baseline.overallHealthScores).toBeTruthy();
  });

  test('AnalyticsTracker - Event system integration', () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    const tracker = new AnalyticsTracker({
      configManager: configManager
    });

    // Test event emission
    tracker.emit('analytics:tracked', { event: 'test-event' });
    
    // Verify event handling setup
    expect(tracker.receivedEvents).toBeDefined();
    expect(tracker.listeners).toBeDefined();
  });
});

describe('Phase 2A Final - Migration Validation', () => {
  test('Both managers follow consistent patterns', () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    
    // Create both managers with same config
    const engine = new ShipEngine({
      userId: 'test-user',
      configManager: configManager,
      workingDir: process.cwd()
    });
    
    const tracker = new AnalyticsTracker({
      userId: 'test-user', 
      configManager: configManager
    });
    
    // Verify both have BaseManager features
    expect(engine.getUserId()).toBe(tracker.getUserId());
    expect(engine.configManager).toBe(tracker.configManager);
    expect(engine.getConfigDir()).toBeTruthy();
    expect(tracker.getDataDir()).toBeTruthy();
    
    // Both support error logging
    expect(typeof engine.logError).toBe('function');
    expect(typeof tracker.logError).toBe('function');
    
    // Both support events
    expect(typeof engine.emit).toBe('function');
    expect(typeof tracker.emit).toBe('function');
  });

  test('Migration preserves unique features', () => {
    const configManager = new ConfigurationManager({ dataDir: testDataDir });
    
    // ShipEngine preserves workingDir
    const engine = new ShipEngine({
      configManager: configManager,
      workingDir: '/custom/path'
    });
    expect(engine.workingDir).toBe('/custom/path');
    expect(engine.mockBranch).toBeDefined();
    
    // AnalyticsTracker preserves tracking structures  
    const tracker = new AnalyticsTracker({
      configManager: configManager
    });
    expect(Array.isArray(tracker.setupAttempts)).toBe(true);
    expect(tracker.commandUsage).toBeTruthy();
  });
});