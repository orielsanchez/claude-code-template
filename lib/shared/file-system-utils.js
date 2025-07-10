/**
 * Shared File System Utilities
 * 
 * Consolidated file system operations to eliminate duplication across codebase
 * Provides caching, error handling, and performance optimization
 */

const fs = require('fs');
const path = require('path');
const { createContextualLogger } = require('./logger');

const logger = createContextualLogger('file-system-utils');

/**
 * Global cache for file existence checks
 */
const fileExistenceCache = new Map();
const cacheConfig = {
  defaultTTL: 30000, // 30 seconds
  maxSize: 1000
};

/**
 * Performance stats tracking
 */
const performanceStats = {
  totalOperations: 0,
  totalResponseTime: 0,
  cacheHits: 0,
  cacheRequests: 0
};

/**
 * Ensure directory exists with proper error handling
 * @param {string} dirPath - Directory path to create
 * @returns {Promise<Object>} Result with success, created, and error properties
 */
async function ensureDirectory(dirPath) {
  const startTime = performance.now();
  
  try {
    // Validate input
    if (!dirPath || typeof dirPath !== 'string' || dirPath.includes('\0')) {
      return {
        success: false,
        created: false,
        error: 'Invalid directory path provided'
      };
    }

    // Check if directory already exists
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        return {
          success: true,
          created: false,
          error: null
        };
      } else {
        return {
          success: false,
          created: false,
          error: 'Path exists but is not a directory'
        };
      }
    }

    // Create directory recursively
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
    
    logger.info('Directory created successfully', { dirPath });
    
    return {
      success: true,
      created: true,
      error: null
    };

  } catch (error) {
    logger.warn('Failed to create directory', {
      dirPath,
      errorType: error.constructor.name,
      errorMessage: error.message
    });

    return {
      success: false,
      created: false,
      error: error.message
    };
  } finally {
    performanceStats.totalOperations++;
    performanceStats.totalResponseTime += performance.now() - startTime;
  }
}

/**
 * Safely read and parse JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<Object>} Result with success, data, and error properties
 */
async function safeReadJSON(filePath) {
  const startTime = performance.now();
  
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        data: null,
        error: 'File does not exist'
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    
    const data = JSON.parse(cleanContent);
    
    return {
      success: true,
      data,
      error: null
    };

  } catch (error) {
    logger.warn('Failed to read JSON file', {
      filePath,
      errorType: error.constructor.name,
      errorMessage: error.message
    });

    return {
      success: false,
      data: null,
      error: error.message.includes('JSON') ? 'Invalid JSON format' : error.message
    };
  } finally {
    performanceStats.totalOperations++;
    performanceStats.totalResponseTime += performance.now() - startTime;
  }
}

/**
 * Safely write JSON file with atomic operation
 * @param {string} filePath - Path to write JSON file
 * @param {*} data - Data to write as JSON
 * @returns {Promise<Object>} Result with success and error properties
 */
async function safeWriteJSON(filePath, data) {
  const startTime = performance.now();
  
  try {
    // Validate that data can be serialized
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Ensure parent directory exists
    const dirPath = path.dirname(filePath);
    const dirResult = await ensureDirectory(dirPath);
    if (!dirResult.success) {
      return {
        success: false,
        error: `Failed to create parent directory: ${dirResult.error}`
      };
    }

    // Write atomically using temporary file
    const tempPath = filePath + '.tmp';
    fs.writeFileSync(tempPath, jsonContent, 'utf8');
    fs.renameSync(tempPath, filePath);
    
    logger.info('JSON file written successfully', { filePath });
    
    return {
      success: true,
      error: null
    };

  } catch (error) {
    logger.warn('Failed to write JSON file', {
      filePath,
      errorType: error.constructor.name,
      errorMessage: error.message
    });

    return {
      success: false,
      error: error.message
    };
  } finally {
    performanceStats.totalOperations++;
    performanceStats.totalResponseTime += performance.now() - startTime;
  }
}

/**
 * Batch file operations for improved performance
 */
const batchFileOperations = {
  /**
   * Check existence of multiple files efficiently
   * @param {string[]} filePaths - Array of file paths to check
   * @returns {Promise<Object>} Map of filePath -> boolean
   */
  async checkExistence(filePaths) {
    const results = {};
    
    for (const filePath of filePaths) {
      try {
        results[filePath] = fs.existsSync(filePath);
      } catch (error) {
        results[filePath] = false;
      }
    }
    
    return results;
  },

  /**
   * Read multiple JSON files in parallel
   * @param {string[]} filePaths - Array of JSON file paths
   * @param {Object} options - Options with concurrency limit
   * @returns {Promise<Array>} Array of read results
   */
  async readJSON(filePaths, options = {}) {
    const { concurrency = 10 } = options;
    
    // Process files in batches to limit concurrency
    const results = [];
    for (let i = 0; i < filePaths.length; i += concurrency) {
      const batch = filePaths.slice(i, i + concurrency);
      const batchPromises = batch.map(filePath => safeReadJSON(filePath));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
};

/**
 * Cached file existence check with TTL
 * @param {string} filePath - File path to check
 * @param {Object} options - Options with ttl and maxCacheSize
 * @returns {Promise<boolean>} True if file exists
 */
async function cachedFileExists(filePath, options = {}) {
  const { ttl = cacheConfig.defaultTTL, maxCacheSize = cacheConfig.maxSize } = options;
  
  performanceStats.cacheRequests++;
  
  const now = Date.now();
  const cacheKey = filePath;
  
  // Check cache
  const cached = fileExistenceCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < ttl) {
    performanceStats.cacheHits++;
    return cached.exists;
  }
  
  // Check filesystem
  const exists = fs.existsSync(filePath);
  
  // Update cache, managing size
  if (fileExistenceCache.size >= maxCacheSize) {
    // Remove oldest entry
    const firstKey = fileExistenceCache.keys().next().value;
    fileExistenceCache.delete(firstKey);
  }
  
  fileExistenceCache.set(cacheKey, {
    exists,
    timestamp: now
  });
  
  return exists;
}

/**
 * Clear the file existence cache
 */
cachedFileExists.clearCache = function() {
  fileExistenceCache.clear();
  performanceStats.cacheHits = 0;
  performanceStats.cacheRequests = 0;
};

/**
 * Get current cache size
 */
cachedFileExists.getCacheSize = function() {
  return fileExistenceCache.size;
};

/**
 * Singleton FileSystemUtils class for global access
 */
class FileSystemUtils {
  static instance = null;
  
  constructor() {
    this.config = { ...cacheConfig };
  }
  
  static getInstance() {
    if (!FileSystemUtils.instance) {
      FileSystemUtils.instance = new FileSystemUtils();
    }
    return FileSystemUtils.instance;
  }
  
  get ensureDirectory() {
    return ensureDirectory;
  }
  
  get safeReadJSON() {
    return safeReadJSON;
  }
  
  get safeWriteJSON() {
    return safeWriteJSON;
  }
  
  get batchOperations() {
    return batchFileOperations;
  }
  
  get cachedExists() {
    return cachedFileExists;
  }
  
  configure(newConfig) {
    Object.assign(this.config, newConfig);
    Object.assign(cacheConfig, newConfig);
  }
  
  getConfiguration() {
    return { ...this.config };
  }
  
  getPerformanceStats() {
    return {
      ...performanceStats,
      averageResponseTime: performanceStats.totalOperations > 0 
        ? performanceStats.totalResponseTime / performanceStats.totalOperations 
        : 0,
      cacheHitRatio: performanceStats.cacheRequests > 0 
        ? performanceStats.cacheHits / performanceStats.cacheRequests 
        : 0
    };
  }
}

module.exports = {
  FileSystemUtils,
  ensureDirectory,
  safeReadJSON,
  safeWriteJSON,
  batchFileOperations,
  cachedFileExists
};