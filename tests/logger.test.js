/**
 * Test suite for logger.js
 * 
 * GREEN Phase: Verify the new logging system works correctly
 */

const { Logger, logger, createContextualLogger } = require('../lib/shared/logger');

describe('Logger System', () => {
  let originalEnv;
  let mockStderr;
  let originalConsole;
  let originalStderrWrite;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    
    // Mock stderr and console
    mockStderr = {
      writes: []
    };
    
    originalConsole = {
      info: console.info,
      warn: console.warn,
      error: console.error
    };

    // Mock stderr.write
    originalStderrWrite = process.stderr.write;
    process.stderr.write = (data) => {
      mockStderr.writes.push(data);
      return true;
    };

    // Mock console methods
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    
    // Restore stderr.write
    process.stderr.write = originalStderrWrite;
  });

  describe('Environment Detection', () => {
    test('should detect test environment correctly', () => {
      process.env.NODE_ENV = 'test';
      const testLogger = new Logger();
      expect(testLogger.isTest).toBe(true);
      expect(testLogger.isProduction).toBe(false);
      expect(testLogger.isDevelopment).toBe(false);
    });

    test('should detect production environment correctly', () => {
      process.env.NODE_ENV = 'production';
      const prodLogger = new Logger();
      expect(prodLogger.isProduction).toBe(true);
      expect(prodLogger.isTest).toBe(false);
      expect(prodLogger.isDevelopment).toBe(false);
    });

    test('should detect development environment correctly', () => {
      process.env.NODE_ENV = 'development';
      const devLogger = new Logger();
      expect(devLogger.isDevelopment).toBe(true);
      expect(devLogger.isProduction).toBe(false);
      expect(devLogger.isTest).toBe(false);
    });

    test('should default to development when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      const defaultLogger = new Logger();
      expect(defaultLogger.isDevelopment).toBe(true);
      expect(defaultLogger.isProduction).toBe(false);
      expect(defaultLogger.isTest).toBe(false);
    });
  });

  describe('Logging in Test Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    test('should be silent in test environment by default', () => {
      logger.info('test message');
      logger.warn('test warning');
      logger.error('test error');

      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      expect(mockStderr.writes).toHaveLength(0);
    });
  });

  describe('Logging in Development Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    test('should use console logging in development', () => {
      const devLogger = new Logger();
      
      devLogger.info('info message', { key: 'value' });
      devLogger.warn('warn message', { key: 'value' });
      devLogger.error('error message', { key: 'value' });

      expect(console.info).toHaveBeenCalledWith('[INFO] info message', { key: 'value' });
      expect(console.warn).toHaveBeenCalledWith('[WARN] warn message', { key: 'value' });
      expect(console.error).toHaveBeenCalledWith('[ERROR] error message', { key: 'value' });
    });
  });

  describe('Logging in Production Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    test('should use structured logging in production', () => {
      const prodLogger = new Logger();
      
      prodLogger.info('info message', { key: 'value' });

      expect(console.info).not.toHaveBeenCalled();
      expect(mockStderr.writes).toHaveLength(1);
      
      const logEntry = JSON.parse(mockStderr.writes[0]);
      expect(logEntry.level).toBe('info');
      expect(logEntry.message).toBe('info message');
      expect(logEntry.context.key).toBe('value');
      expect(logEntry.service).toBe('claude-code-template');
      expect(logEntry.timestamp).toBeDefined();
    });
  });

  describe('Error Logging', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    test('should log errors with automatic context extraction', () => {
      const testLogger = new Logger();
      const testError = new Error('Test error message');
      
      testLogger.logError(testError, 'testOperation', { additional: 'context' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Operation failed: testOperation',
        {
          operation: 'testOperation',
          errorMessage: 'Test error message',
          errorType: 'Error',
          additional: 'context'
        }
      );
    });
  });

  describe('Contextual Logger', () => {
    test('should create contextual loggers with component context', () => {
      process.env.NODE_ENV = 'development';
      const devLogger = new Logger();
      const componentLogger = devLogger.createContextualLogger('TestComponent');
      
      componentLogger.info('test message', { extra: 'data' });

      expect(console.info).toHaveBeenCalledWith(
        '[INFO] test message',
        { component: 'TestComponent', extra: 'data' }
      );
    });

    test('should create contextual loggers for error handling', () => {
      process.env.NODE_ENV = 'development';
      const devLogger = new Logger();
      const componentLogger = devLogger.createContextualLogger('TestComponent');
      const testError = new Error('Component error');
      
      componentLogger.logError(testError, 'componentOperation');

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Operation failed: componentOperation',
        {
          component: 'TestComponent',
          operation: 'componentOperation',
          errorMessage: 'Component error',
          errorType: 'Error'
        }
      );
    });
  });

  describe('Singleton Behavior', () => {
    test('should export singleton logger instance', () => {
      const { logger: logger1 } = require('../lib/shared/logger');
      const { logger: logger2 } = require('../lib/shared/logger');
      
      expect(logger1).toBe(logger2);
    });
  });
});