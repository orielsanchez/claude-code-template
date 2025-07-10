/**
 * Shared File System Utilities Tests
 * 
 * RED phase tests for consolidating file system operations
 * Target: Eliminate 16+ duplicated file system patterns across codebase
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import utilities we're going to create (will fail initially)
const {
  FileSystemUtils,
  ensureDirectory,
  safeReadJSON,
  safeWriteJSON,
  batchFileOperations,
  cachedFileExists
} = require('../lib/shared/file-system-utils');

describe('Shared File System Utilities', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-utils-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('ensureDirectory', () => {
    it('should create directory recursively with proper permissions', async () => {
      const deepPath = path.join(tempDir, 'level1', 'level2', 'level3');

      const result = await ensureDirectory(deepPath);

      expect(result.success).toBe(true);
      expect(result.created).toBe(true);
      expect(fs.existsSync(deepPath)).toBe(true);

      // Verify permissions (readable/writable by owner)
      const stats = fs.statSync(deepPath);
      expect(stats.isDirectory()).toBe(true);
      expect(stats.mode & parseInt('755', 8)).toBeTruthy();
    });

    it('should not overwrite existing directory', async () => {
      const existingPath = path.join(tempDir, 'existing');
      fs.mkdirSync(existingPath);
      fs.writeFileSync(path.join(existingPath, 'test.txt'), 'existing content');

      const result = await ensureDirectory(existingPath);

      expect(result.success).toBe(true);
      expect(result.created).toBe(false);
      expect(fs.existsSync(path.join(existingPath, 'test.txt'))).toBe(true);
    });

    it('should handle permission errors gracefully', async () => {
      const restrictedPath = '/root/test-directory';

      const result = await ensureDirectory(restrictedPath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should handle concurrent directory creation', async () => {
      const sharedPath = path.join(tempDir, 'concurrent');

      // Simulate concurrent creation attempts
      const promises = Array(5).fill().map(() => ensureDirectory(sharedPath));
      const results = await Promise.all(promises);

      // All should succeed, but only first should report created=true
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(fs.existsSync(sharedPath)).toBe(true);
    });

    it('should handle invalid paths gracefully', async () => {
      const invalidPaths = [null, undefined, '', '\0invalid'];

      for (const invalidPath of invalidPaths) {
        const result = await ensureDirectory(invalidPath);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('safeReadJSON', () => {
    it('should read and parse valid JSON file', async () => {
      const data = { name: 'test', version: '1.0.0', nested: { prop: 'value' } };
      const jsonPath = path.join(tempDir, 'test.json');
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

      const result = await safeReadJSON(jsonPath);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
    });

    it('should handle malformed JSON gracefully', async () => {
      const invalidJson = '{ "name": "test", "version": }'; // Invalid JSON
      const jsonPath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(jsonPath, invalidJson);

      const result = await safeReadJSON(jsonPath);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toContain('JSON');
    });

    it('should handle missing files gracefully', async () => {
      const missingPath = path.join(tempDir, 'does-not-exist.json');

      const result = await safeReadJSON(missingPath);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should handle large JSON files efficiently', async () => {
      // Create large JSON object
      const largeData = { items: Array(10000).fill().map((_, i) => ({ id: i, value: `item-${i}` })) };
      const jsonPath = path.join(tempDir, 'large.json');
      fs.writeFileSync(jsonPath, JSON.stringify(largeData));

      const startTime = performance.now();
      const result = await safeReadJSON(jsonPath);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should handle files with BOM gracefully', async () => {
      const data = { name: 'test' };
      const jsonPath = path.join(tempDir, 'bom.json');
      // Write JSON with BOM (Byte Order Mark)
      fs.writeFileSync(jsonPath, '\uFEFF' + JSON.stringify(data));

      const result = await safeReadJSON(jsonPath);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });
  });

  describe('safeWriteJSON', () => {
    it('should write JSON file with proper formatting', async () => {
      const data = { name: 'test', version: '1.0.0', nested: { prop: 'value' } };
      const jsonPath = path.join(tempDir, 'output.json');

      const result = await safeWriteJSON(jsonPath, data);

      expect(result.success).toBe(true);
      expect(fs.existsSync(jsonPath)).toBe(true);

      // Verify content is properly formatted
      const content = fs.readFileSync(jsonPath, 'utf8');
      expect(content).toContain('  "name": "test"'); // Proper indentation
      expect(JSON.parse(content)).toEqual(data);
    });

    it('should create parent directories if needed', async () => {
      const data = { test: 'value' };
      const deepPath = path.join(tempDir, 'deep', 'nested', 'output.json');

      const result = await safeWriteJSON(deepPath, data);

      expect(result.success).toBe(true);
      expect(fs.existsSync(deepPath)).toBe(true);
      expect(fs.existsSync(path.dirname(deepPath))).toBe(true);
    });

    it('should perform atomic writes', async () => {
      const data = { name: 'test' };
      const jsonPath = path.join(tempDir, 'atomic.json');

      // Simulate concurrent writes
      const promises = Array(5).fill().map((_, i) => 
        safeWriteJSON(jsonPath, { ...data, id: i })
      );
      const results = await Promise.all(promises);

      // All writes should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // File should exist and be valid JSON
      expect(fs.existsSync(jsonPath)).toBe(true);
      const finalContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      expect(finalContent).toHaveProperty('name', 'test');
      expect(finalContent).toHaveProperty('id');
    });

    it('should handle write permission errors gracefully', async () => {
      const data = { test: 'value' };
      const restrictedPath = '/root/output.json';

      const result = await safeWriteJSON(restrictedPath, data);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle invalid data gracefully', async () => {
      const circularData = {};
      circularData.self = circularData; // Circular reference
      const jsonPath = path.join(tempDir, 'circular.json');

      const result = await safeWriteJSON(jsonPath, circularData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('batchFileOperations', () => {
    it('should check multiple file existence efficiently', async () => {
      // Create some files
      const files = ['file1.txt', 'file2.txt', 'file3.txt'];
      files.slice(0, 2).forEach(file => {
        fs.writeFileSync(path.join(tempDir, file), 'content');
      });

      const filePaths = files.map(file => path.join(tempDir, file));
      
      const startTime = performance.now();
      const results = await batchFileOperations.checkExistence(filePaths);
      const endTime = performance.now();

      expect(results[filePaths[0]]).toBe(true);
      expect(results[filePaths[1]]).toBe(true);
      expect(results[filePaths[2]]).toBe(false);
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });

    it('should read multiple JSON files in parallel', async () => {
      // Create test JSON files
      const files = [
        { name: 'file1.json', data: { id: 1, name: 'first' } },
        { name: 'file2.json', data: { id: 2, name: 'second' } },
        { name: 'file3.json', data: { id: 3, name: 'third' } }
      ];

      files.forEach(({ name, data }) => {
        fs.writeFileSync(path.join(tempDir, name), JSON.stringify(data));
      });

      const filePaths = files.map(({ name }) => path.join(tempDir, name));

      const startTime = performance.now();
      const results = await batchFileOperations.readJSON(filePaths);
      const endTime = performance.now();

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data).toEqual(files[index].data);
      });
      expect(endTime - startTime).toBeLessThan(100); // Parallel should be faster
    });

    it('should handle mixed success/failure in batch operations', async () => {
      // Create some files, leave others missing
      fs.writeFileSync(path.join(tempDir, 'exists.json'), '{"valid": true}');
      fs.writeFileSync(path.join(tempDir, 'invalid.json'), '{"invalid": }'); // Invalid JSON

      const filePaths = [
        path.join(tempDir, 'exists.json'),
        path.join(tempDir, 'invalid.json'),
        path.join(tempDir, 'missing.json')
      ];

      const results = await batchFileOperations.readJSON(filePaths);

      expect(results[0].success).toBe(true);
      expect(results[0].data).toEqual({ valid: true });
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(false);
    });

    it('should limit concurrent operations to prevent resource exhaustion', async () => {
      // Create many files
      const fileCount = 100;
      const files = Array(fileCount).fill().map((_, i) => `file${i}.json`);
      files.forEach((file, i) => {
        fs.writeFileSync(path.join(tempDir, file), JSON.stringify({ id: i }));
      });

      const filePaths = files.map(file => path.join(tempDir, file));

      const startTime = performance.now();
      const results = await batchFileOperations.readJSON(filePaths, { concurrency: 10 });
      const endTime = performance.now();

      expect(results).toHaveLength(fileCount);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time
    });
  });

  describe('cachedFileExists', () => {
    beforeEach(() => {
      // Clear cache before each test
      cachedFileExists.clearCache();
    });

    it('should cache file existence results', async () => {
      const filePath = path.join(tempDir, 'cached-test.txt');
      fs.writeFileSync(filePath, 'content');

      // First check should hit filesystem
      const startTime1 = performance.now();
      const result1 = await cachedFileExists(filePath);
      const endTime1 = performance.now();

      // Second check should use cache
      const startTime2 = performance.now();
      const result2 = await cachedFileExists(filePath);
      const endTime2 = performance.now();

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(endTime2 - startTime2).toBeLessThan(endTime1 - startTime1); // Cache should be faster
    });

    it('should use cached results for repeated checks', async () => {
      const filePath = path.join(tempDir, 'changing-file.txt');
      fs.writeFileSync(filePath, 'content');

      // First check should hit filesystem
      const result1 = await cachedFileExists(filePath);
      expect(result1).toBe(true);

      // Second check should use cache (same result)
      const result2 = await cachedFileExists(filePath);
      expect(result2).toBe(true);
      
      // Cache should have been used (performance benefit)
      expect(cachedFileExists.getCacheSize()).toBeGreaterThan(0);
    });

    it('should respect cache TTL', async () => {
      const filePath = path.join(tempDir, 'ttl-test.txt');
      fs.writeFileSync(filePath, 'content');

      // Check with short TTL
      const result1 = await cachedFileExists(filePath, { ttl: 10 }); // 10ms TTL
      expect(result1).toBe(true);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 20));

      // Should re-check filesystem
      const result2 = await cachedFileExists(filePath, { ttl: 10 });
      expect(result2).toBe(true);
    });

    it('should handle cache memory limits', async () => {
      // Fill cache with many entries
      const promises = Array(1000).fill().map(async (_, i) => {
        const filePath = path.join(tempDir, `cache-test-${i}.txt`);
        if (i < 500) fs.writeFileSync(filePath, 'content'); // Create half the files
        return cachedFileExists(filePath, { maxCacheSize: 100 });
      });

      const results = await Promise.all(promises);

      // All should complete without error
      expect(results).toHaveLength(1000);
      expect(cachedFileExists.getCacheSize()).toBeLessThanOrEqual(100);
    });
  });

  describe('FileSystemUtils class', () => {
    it('should provide singleton access to all utilities', () => {
      const utils1 = FileSystemUtils.getInstance();
      const utils2 = FileSystemUtils.getInstance();

      expect(utils1).toBe(utils2); // Same instance
      expect(utils1).toHaveProperty('ensureDirectory');
      expect(utils1).toHaveProperty('safeReadJSON');
      expect(utils1).toHaveProperty('safeWriteJSON');
      expect(utils1).toHaveProperty('batchOperations');
      expect(utils1).toHaveProperty('cachedExists');
    });

    it('should provide performance monitoring', async () => {
      const utils = FileSystemUtils.getInstance();
      const stats = utils.getPerformanceStats();

      expect(stats).toHaveProperty('totalOperations');
      expect(stats).toHaveProperty('averageResponseTime');
      expect(stats).toHaveProperty('cacheHitRatio');
      expect(typeof stats.totalOperations).toBe('number');
    });

    it('should allow configuration of global settings', () => {
      const utils = FileSystemUtils.getInstance();

      utils.configure({
        defaultCacheTTL: 5000,
        maxCacheSize: 200,
        concurrencyLimit: 5
      });

      const config = utils.getConfiguration();
      expect(config.defaultCacheTTL).toBe(5000);
      expect(config.maxCacheSize).toBe(200);
      expect(config.concurrencyLimit).toBe(5);
    });
  });

  describe('Integration with existing codebase patterns', () => {
    it('should replace fs.mkdirSync({ recursive: true }) pattern', async () => {
      // Test that our utility can replace the common pattern:
      // fs.mkdirSync(dir, { recursive: true })
      
      const deepPath = path.join(tempDir, 'replace', 'mkdir', 'pattern');

      const result = await ensureDirectory(deepPath);

      expect(result.success).toBe(true);
      expect(fs.existsSync(deepPath)).toBe(true);
    });

    it('should replace JSON.parse(fs.readFileSync()) pattern', async () => {
      // Test that our utility can replace the common pattern:
      // JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      const data = { config: 'value', debug: true };
      const jsonPath = path.join(tempDir, 'config.json');
      fs.writeFileSync(jsonPath, JSON.stringify(data));

      const result = await safeReadJSON(jsonPath);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should improve on fs.existsSync() with caching', async () => {
      // Test that our utility provides better performance than:
      // fs.existsSync(filePath)
      
      const filePath = path.join(tempDir, 'exists-test.txt');
      fs.writeFileSync(filePath, 'content');

      // Multiple checks should benefit from caching
      const checks = Array(10).fill().map(() => cachedFileExists(filePath));
      const results = await Promise.all(checks);

      expect(results.every(result => result === true)).toBe(true);
    });
  });
});