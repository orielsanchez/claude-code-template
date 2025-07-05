const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TemplateUtils = require('../lib/shared/template-utils');
const { templateUtils, loadTemplate, safeReadJson, safeReadText, fileExists } = require('../lib/shared/template-utils');

describe('TemplateUtils', () => {
  let tempDir;
  let utils;
  
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-utils-test-'));
    utils = new TemplateUtils({ 
      templateDir: tempDir,
      configDir: tempDir,
      autoPreload: false  // Disable auto-preload for testing
    });
  });
  
  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Template Loading', () => {
    it('should load and process templates with variables', () => {
      const templateContent = 'Hello {{name}}, welcome to {{project}}!';
      const templatePath = path.join(tempDir, 'greeting.md');
      fs.writeFileSync(templatePath, templateContent);
      
      const result = utils.loadTemplate('greeting', {
        name: 'Alice',
        project: 'Claude Code'
      });
      
      expect(result).toBe('Hello Alice, welcome to Claude Code!');
    });

    it('should handle array variables with special formatting', () => {
      const templateContent = 'Steps:\n{{phaseSteps}}\n\nList:\n{{integrationList}}';
      const templatePath = path.join(tempDir, 'arrays.md');
      fs.writeFileSync(templatePath, templateContent);
      
      const result = utils.loadTemplate('arrays', {
        phaseSteps: ['First step', 'Second step'],
        integrationList: ['Item A', 'Item B']
      });
      
      expect(result).toContain('1. First step\n2. Second step');
      expect(result).toContain('- Item A\n- Item B');
    });

    it('should remove empty variables', () => {
      const templateContent = 'Title: {{title}}\n{{emptyVar}}\nContent: {{content}}';
      const templatePath = path.join(tempDir, 'empty.md');
      fs.writeFileSync(templatePath, templateContent);
      
      const result = utils.loadTemplate('empty', {
        title: 'Test',
        content: 'Some content',
        emptyVar: ''
      });
      
      expect(result).toBe('Title: Test\nContent: Some content');
    });
  });

  describe('In-Memory Templates', () => {
    it('should register and use in-memory templates', () => {
      const templateContent = 'Dynamic template with {{variable}}';
      utils.registerTemplate('dynamic', templateContent);
      
      const result = utils.loadTemplate('dynamic', { variable: 'test data' });
      expect(result).toBe('Dynamic template with test data');
    });

    it('should prefer in-memory templates over file templates', () => {
      // Create file template
      const fileContent = 'File template with {{var}}';
      const templatePath = path.join(tempDir, 'priority.md');
      fs.writeFileSync(templatePath, fileContent);
      
      // Register in-memory template with same name
      const memoryContent = 'Memory template with {{var}}';
      utils.registerTemplate('priority', memoryContent);
      
      const result = utils.loadTemplate('priority', { var: 'data' });
      expect(result).toBe('Memory template with data');
    });
  });

  describe('Template Validation', () => {
    it('should validate existing templates', () => {
      const templateContent = 'Template with {{var1}} and {{var2}}';
      const templatePath = path.join(tempDir, 'validate.md');
      fs.writeFileSync(templatePath, templateContent);
      
      const validation = utils.validateTemplate('validate');
      expect(validation.valid).toBe(true);
      expect(validation.variables).toEqual(['var1', 'var2']);
    });

    it('should handle missing templates', () => {
      const validation = utils.validateTemplate('nonexistent');
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Template not found');
    });

    it('should extract template variables', () => {
      const templateContent = 'Hello {{name}}, {{greeting}} from {{location}}!';
      const templatePath = path.join(tempDir, 'vars.md');
      fs.writeFileSync(templatePath, templateContent);
      
      const variables = utils.getTemplateVariables('vars');
      expect(variables).toEqual(['name', 'greeting', 'location']);
    });
  });

  describe('Template Discovery', () => {
    it('should list available templates', () => {
      // Create some test templates
      fs.writeFileSync(path.join(tempDir, 'template1.md'), 'Content 1');
      fs.writeFileSync(path.join(tempDir, 'template2.md'), 'Content 2');
      
      // Register in-memory template
      utils.registerTemplate('memory-template', 'Memory content');
      
      const available = utils.getAvailableTemplates();
      expect(available).toContain('template1');
      expect(available).toContain('template2');
      expect(available).toContain('memory-template');
    });

    it('should validate all templates', () => {
      fs.writeFileSync(path.join(tempDir, 'good.md'), 'Good template with {{var}}');
      utils.registerTemplate('memory', 'Memory template with {{memVar}}');
      
      const results = utils.validateAllTemplates();
      expect(results.good.valid).toBe(true);
      expect(results.good.variables).toEqual(['var']);
      expect(results.memory.valid).toBe(true);
      expect(results.memory.variables).toEqual(['memVar']);
    });
  });

  describe('Caching', () => {
    it('should cache template content when enabled', () => {
      const templateContent = 'Cached template';
      const templatePath = path.join(tempDir, 'cached.md');
      fs.writeFileSync(templatePath, templateContent);
      
      utils.setCacheEnabled(true);
      
      // Load template (should cache it)
      utils.getTemplateContent('cached');
      
      // Delete the file
      fs.unlinkSync(templatePath);
      
      // Should still work from cache
      const result = utils.getTemplateContent('cached');
      expect(result).toBe(templateContent);
    });

    it('should not cache when disabled', () => {
      const templateContent = 'Non-cached template';
      const templatePath = path.join(tempDir, 'nocache.md');
      fs.writeFileSync(templatePath, templateContent);
      
      utils.setCacheEnabled(false);
      
      // Load template
      utils.getTemplateContent('nocache');
      
      // Delete the file
      fs.unlinkSync(templatePath);
      
      // Should fail since not cached
      expect(() => utils.getTemplateContent('nocache')).toThrow('Template not found');
    });

    it('should provide cache statistics', () => {
      utils.setCacheEnabled(true);
      
      const templatePath = path.join(tempDir, 'stats.md');
      fs.writeFileSync(templatePath, 'Stats template');
      
      utils.getTemplateContent('stats');
      utils.registerTemplate('memory-stats', 'Memory stats');
      
      const stats = utils.getCacheStats();
      expect(stats.cached).toBe(1);
      expect(stats.registered).toBe(1);
      expect(stats.templates).toContain('stats');
      expect(stats.registeredTemplates).toContain('memory-stats');
    });
  });

  describe('Safe File Operations', () => {
    it('should safely read JSON files', () => {
      const jsonData = { test: 'data', number: 42 };
      const jsonPath = path.join(tempDir, 'test.json');
      fs.writeFileSync(jsonPath, JSON.stringify(jsonData));
      
      const result = utils.safeReadJson(jsonPath);
      expect(result).toEqual(jsonData);
    });

    it('should return null for invalid JSON', () => {
      const invalidPath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(invalidPath, 'not valid json');
      
      const result = utils.safeReadJson(invalidPath);
      expect(result).toBeNull();
    });

    it('should safely read text files', () => {
      const textContent = 'Hello world\nSecond line';
      const textPath = path.join(tempDir, 'test.txt');
      fs.writeFileSync(textPath, textContent);
      
      const result = utils.safeReadText(textPath);
      expect(result).toBe(textContent);
    });

    it('should return null for missing text files', () => {
      const result = utils.safeReadText(path.join(tempDir, 'missing.txt'));
      expect(result).toBeNull();
    });

    it('should check file existence', () => {
      const existingPath = path.join(tempDir, 'exists.txt');
      fs.writeFileSync(existingPath, 'content');
      
      expect(utils.fileExists(existingPath)).toBe(true);
      expect(utils.fileExists(path.join(tempDir, 'missing.txt'))).toBe(false);
    });
  });

  describe('Backward Compatibility', () => {
    it('should provide global convenience functions', () => {
      const templateContent = 'Global function test with {{var}}';
      const templatePath = path.join(tempDir, 'global.md');
      fs.writeFileSync(templatePath, templateContent);
      
      // Use convenience functions that should work with singleton
      expect(typeof loadTemplate).toBe('function');
      expect(typeof safeReadJson).toBe('function');
      expect(typeof safeReadText).toBe('function');
      expect(typeof fileExists).toBe('function');
      
      // Test the convenience function (note: uses default template dir)
      expect(fileExists(templatePath)).toBe(true);
    });

    it('should work with existing template-loader pattern', () => {
      // This test ensures our TemplateUtils works like the old template-loader
      const templateContent = 'Compatibility test: {{message}}';
      const templatePath = path.join(tempDir, 'compat.md');
      fs.writeFileSync(templatePath, templateContent);
      
      const result = utils.loadTemplate('compat', { message: 'success' });
      expect(result).toBe('Compatibility test: success');
    });
  });

  describe('BaseManager Integration', () => {
    it('should extend BaseManager functionality', () => {
      expect(utils.getUserId).toBeDefined();
      expect(utils.logError).toBeDefined();
      expect(utils.getErrorLogs).toBeDefined();
      expect(utils.emit).toBeDefined();
    });

    it('should log errors properly', () => {
      const error = new Error('Test error');
      utils.logError(error, { context: 'test' });
      
      const logs = utils.getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toBe('Test error');
      expect(logs[0].context.context).toBe('test');
    });
  });
});