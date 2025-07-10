/**
 * Test suite for shared-utils.js
 * 
 * RED Phase: Protecting existing behavior before refactoring
 * These tests ensure error handling behavior is preserved during Phase 1 fixes
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { safeReadJson, safeReadText, fileExists } = require('../lib/detectors/shared-utils');

describe('Shared Utils - Error Handling Behavior Protection', () => {
  let tempDir;
  let validJsonFile;
  let invalidJsonFile;
  let validTextFile;
  let missingFile;

  beforeEach(() => {
    // Create temporary test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shared-utils-test-'));
    
    validJsonFile = path.join(tempDir, 'valid.json');
    invalidJsonFile = path.join(tempDir, 'invalid.json');
    validTextFile = path.join(tempDir, 'valid.txt');
    missingFile = path.join(tempDir, 'missing.json');

    // Create test files
    fs.writeFileSync(validJsonFile, JSON.stringify({ test: 'data', version: '1.0' }));
    fs.writeFileSync(invalidJsonFile, 'not valid json');
    fs.writeFileSync(validTextFile, 'valid text content\nwith multiple lines');
  });

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('safeReadJson - Current Behavior Protection', () => {
    test('should return parsed JSON object for valid JSON file', () => {
      const result = safeReadJson(validJsonFile);
      
      expect(result).toEqual({ test: 'data', version: '1.0' });
      expect(typeof result).toBe('object');
    });

    test('should return null for invalid JSON file (current silent behavior)', () => {
      const result = safeReadJson(invalidJsonFile);
      
      expect(result).toBeNull();
    });

    test('should return null for missing file (current silent behavior)', () => {
      const result = safeReadJson(missingFile);
      
      expect(result).toBeNull();
    });

    test('should handle file permission errors gracefully', () => {
      // Create a file we can't read (if possible on this platform)
      const restrictedFile = path.join(tempDir, 'restricted.json');
      fs.writeFileSync(restrictedFile, '{"test": "data"}');
      
      try {
        fs.chmodSync(restrictedFile, 0o000); // Remove all permissions
        const result = safeReadJson(restrictedFile);
        expect(result).toBeNull();
      } catch (chmodError) {
        // If chmod fails (e.g., Windows), skip this test
        console.log('Skipping permission test on this platform');
      } finally {
        try {
          fs.chmodSync(restrictedFile, 0o644); // Restore permissions for cleanup
        } catch (restoreError) {
          // Ignore restore errors
        }
      }
    });
  });

  describe('safeReadText - Current Behavior Protection', () => {
    test('should return text content for valid text file', () => {
      const result = safeReadText(validTextFile);
      
      expect(result).toBe('valid text content\nwith multiple lines');
      expect(typeof result).toBe('string');
    });

    test('should return null for missing file (current silent behavior)', () => {
      const result = safeReadText(missingFile);
      
      expect(result).toBeNull();
    });

    test('should handle empty files correctly', () => {
      const emptyFile = path.join(tempDir, 'empty.txt');
      fs.writeFileSync(emptyFile, '');
      
      const result = safeReadText(emptyFile);
      expect(result).toBe('');
    });

    test('should handle binary files gracefully', () => {
      const binaryFile = path.join(tempDir, 'binary.bin');
      fs.writeFileSync(binaryFile, Buffer.from([0x00, 0x01, 0x02, 0x03]));
      
      const result = safeReadText(binaryFile);
      // Should return some content (binary as text) or null, not throw
      expect(typeof result === 'string' || result === null).toBe(true);
    });
  });

  describe('fileExists - Current Behavior Protection', () => {
    test('should return true for existing files', () => {
      expect(fileExists(validJsonFile)).toBe(true);
      expect(fileExists(validTextFile)).toBe(true);
    });

    test('should return false for missing files', () => {
      expect(fileExists(missingFile)).toBe(false);
      expect(fileExists('/path/that/does/not/exist')).toBe(false);
    });

    test('should return true for existing directories', () => {
      expect(fileExists(tempDir)).toBe(true);
    });

    test('should handle invalid paths gracefully', () => {
      // Test with various invalid path scenarios
      expect(fileExists('')).toBe(false);
      expect(fileExists(null)).toBe(false);
      expect(fileExists(undefined)).toBe(false);
    });
  });

  describe('Error Handling Consistency - Future Requirements', () => {
    test('functions should maintain graceful degradation behavior', () => {
      // These tests define the contract that must be preserved
      // after we add proper error logging
      
      // All error scenarios should return predictable values
      expect(safeReadJson('nonexistent')).toBeNull();
      expect(safeReadText('nonexistent')).toBeNull();
      expect(fileExists('nonexistent')).toBe(false);
      
      // Functions should not throw exceptions
      expect(() => safeReadJson('invalid/path')).not.toThrow();
      expect(() => safeReadText('invalid/path')).not.toThrow();
      expect(() => fileExists('invalid/path')).not.toThrow();
    });

    test('functions should work with various file encodings', () => {
      // Test UTF-8 content
      const utf8File = path.join(tempDir, 'utf8.txt');
      fs.writeFileSync(utf8File, 'Hello 世界 🌍', 'utf8');
      
      const result = safeReadText(utf8File);
      expect(result).toBe('Hello 世界 🌍');
    });
  });
});