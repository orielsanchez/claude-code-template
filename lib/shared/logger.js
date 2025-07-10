/**
 * Centralized logging system for Claude Code Template
 * 
 * Replaces console.* statements throughout the codebase
 * Provides structured, environment-aware logging
 */

/**
 * Logger class with environment-aware logging
 */
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isTest = process.env.NODE_ENV === 'test';
    this.isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }

  /**
   * Log an informational message
   * @param {string} message - The message to log
   * @param {Object} context - Additional context
   */
  info(message, context = {}) {
    if (this.isTest) return; // Silent in tests unless explicitly needed

    const logEntry = this._createLogEntry('info', message, context);
    
    if (this.isProduction) {
      // In production, use structured logging (could be JSON, could be sent to logging service)
      this._structuredLog(logEntry);
    } else {
      // In development, use console for immediate feedback
      console.info(`[INFO] ${message}`, context);
    }
  }

  /**
   * Log a warning message
   * @param {string} message - The warning message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    if (this.isTest) return; // Silent in tests unless explicitly needed

    const logEntry = this._createLogEntry('warn', message, context);
    
    if (this.isProduction) {
      this._structuredLog(logEntry);
    } else {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  /**
   * Log an error message
   * @param {string} message - The error message
   * @param {Object} context - Additional context
   */
  error(message, context = {}) {
    if (this.isTest) return; // Silent in tests unless explicitly needed

    const logEntry = this._createLogEntry('error', message, context);
    
    if (this.isProduction) {
      this._structuredLog(logEntry);
    } else {
      console.error(`[ERROR] ${message}`, context);
    }
  }

  /**
   * Log errors with automatic context extraction
   * @param {Error} error - The error object
   * @param {string} operation - The operation that failed
   * @param {Object} additionalContext - Additional context
   */
  logError(error, operation = 'unknown', additionalContext = {}) {
    const context = {
      operation,
      errorMessage: error.message,
      errorType: error.constructor.name,
      ...additionalContext
    };

    this.error(`Operation failed: ${operation}`, context);
  }

  /**
   * Create a structured log entry
   * @private
   */
  _createLogEntry(level, message, context) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      service: 'claude-code-template'
    };
  }

  /**
   * Output structured logs
   * @private
   */
  _structuredLog(logEntry) {
    // In production, this could send to a logging service
    // For now, output as structured JSON to stderr
    process.stderr.write(JSON.stringify(logEntry) + '\n');
  }

  /**
   * Create a contextual logger for a specific component
   * @param {string} component - Component name
   * @returns {Object} Contextual logger
   */
  createContextualLogger(component) {
    return {
      info: (message, context = {}) => this.info(message, { component, ...context }),
      warn: (message, context = {}) => this.warn(message, { component, ...context }),
      error: (message, context = {}) => this.error(message, { component, ...context }),
      logError: (error, operation, context = {}) => this.logError(error, operation, { component, ...context })
    };
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = {
  Logger,
  logger,
  // Convenience methods for direct use
  info: (message, context) => logger.info(message, context),
  warn: (message, context) => logger.warn(message, context),
  error: (message, context) => logger.error(message, context),
  logError: (error, operation, context) => logger.logError(error, operation, context),
  createContextualLogger: (component) => logger.createContextualLogger(component)
};