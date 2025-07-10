const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the utilities we'll create (these don't exist yet - RED phase)
const CommandBuilder = require('../lib/command-utils/command-builder');
const { generateHeader, generateUsageExamples } = require('../lib/command-utils/generators/command-header');
const { generatePhaseContent } = require('../lib/command-utils/generators/phase-content');
const { templateManager } = require('../lib/command-utils/templates/template-manager');

describe('Command Documentation Utilities', () => {
  let tempDir;
  
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'command-utils-test-'));
  });
  
  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('CommandBuilder', () => {
    it('should generate complete command documentation from config', () => {
      const config = {
        name: 'dev',
        description: 'TDD-first development workflow',
        allowedTools: 'all',
        phases: ['red', 'green', 'refactor'],
        integrations: ['check', 'ship'],
        usageExamples: [
          '/dev "user authentication"',
          '/dev test run'
        ]
      };

      const builder = new CommandBuilder(config);
      const result = builder.build();

      // Should generate complete markdown with all sections
      expect(result).toContain('---\nallowed-tools: all\ndescription: TDD-first development workflow\n---');
      expect(result).toContain('# TDD-First Development Workflow');
      expect(result).toContain('**Usage:**');
      expect(result).toContain('/dev "user authentication"');
      expect(result).toContain('## Phase 1: RED');
      expect(result).toContain('## Integration with Other Commands');
      expect(result).toContain('## Learning Integration');
    });

    it('should use templates for common sections', () => {
      const config = {
        name: 'debug',
        description: 'Systematic debugging workflow',
        phases: ['isolate', 'reproduce', 'investigate', 'fix', 'validate']
      };

      const builder = new CommandBuilder(config);
      const result = builder.build();

      // Should include common TDD patterns from templates
      expect(result).toContain('**YOU MUST SAY:** "Let me');
      expect(result).toContain('Learning Objective');
      expect(result).toContain('Quality Requirements');
    });

    it('should customize content based on command type', () => {
      const workflowConfig = { 
        name: 'dev', 
        type: 'workflow', 
        description: 'Workflow command',
        phases: ['red', 'green'] 
      };
      const utilityConfig = { 
        name: 'help', 
        type: 'utility',
        description: 'Utility command'
      };

      const workflowResult = new CommandBuilder(workflowConfig).build();
      const utilityResult = new CommandBuilder(utilityConfig).build();

      // Workflow commands should have phases, utility commands should not
      expect(workflowResult).toContain('## Phase 1:');
      expect(utilityResult).not.toContain('## Phase 1:');
    });
  });

  describe('Template System', () => {
    it('should load workflow phase templates', () => {
      const result = templateManager.loadTemplate('workflow-phases', { 
        phaseNumber: '1',
        phaseName: 'RED',
        phaseGoal: 'Write failing tests',
        phaseSteps: ['Define behavior', 'Write tests', 'Verify failure'],
        learningObjective: 'Force precise thinking'
      });
      const template = result.content || result;

      expect(template).toContain('## Phase 1: RED');
      expect(template).toContain('**Goal:** Write failing tests');
      expect(template).toContain('1. Define behavior');
      expect(template).toContain('**Learning Objective**:');
    });

    it('should load quality standards template', () => {
      const result = templateManager.loadTemplate('quality-standards');
      const template = result.content || result;

      expect(template).toContain('**Quality Requirements**:');
      expect(template).toContain('Follow all forbidden patterns from CLAUDE.md');
      expect(template).toContain('No unwrap(), expect(), panic!()');
      expect(template).toContain('Delete old code when replacing');
    });

    it('should load integration patterns template', () => {
      const result = templateManager.loadTemplate('integration-patterns', {
        commandName: 'dev',
        integrations: ['check', 'ship']
      });
      const template = result.content || result;

      expect(template).toContain('## Integration with Other Commands');
      expect(template).toContain('**`/dev` → `/check`**');
      expect(template).toContain('**`/dev` → `/ship`**');
    });

    it('should load learning integration template', () => {
      const result = templateManager.loadTemplate('learning-integration');
      const template = result.content || result;

      expect(template).toContain('## Learning Integration');
      expect(template).toContain('### **Before Starting**:');
      expect(template).toContain('### **During Implementation**:');
      expect(template).toContain('### **After Completion**:');
    });
  });

  describe('Header Generation', () => {
    it('should generate YAML frontmatter correctly', () => {
      const config = {
        allowedTools: 'all',
        description: 'TDD-first development workflow'
      };

      const header = generateHeader(config);

      expect(header).toBe('---\nallowed-tools: all\ndescription: TDD-first development workflow\n---\n');
    });

    it('should handle different tool restrictions', () => {
      const restrictedConfig = {
        allowedTools: ['read', 'write'],
        description: 'Limited tool access command'
      };

      const header = generateHeader(restrictedConfig);

      expect(header).toContain('allowed-tools: read,write');
    });
  });

  describe('Usage Examples Generation', () => {
    it('should format usage examples consistently', () => {
      const examples = [
        { command: '/dev "user auth"', description: 'Full TDD workflow' },
        { command: '/dev test run', description: 'Execute tests' }
      ];

      const result = generateUsageExamples(examples);

      expect(result).toContain('**Usage:**');
      expect(result).toContain('- `/dev "user auth"` - Full TDD workflow');
      expect(result).toContain('- `/dev test run` - Execute tests');
      expect(result).toContain('**Examples:**');
    });

    it('should handle simple string examples', () => {
      const examples = ['/dev "feature"', '/dev test'];

      const result = generateUsageExamples(examples);

      expect(result).toContain('- `/dev "feature"`');
      expect(result).toContain('- `/dev test`');
    });
  });

  describe('Phase Content Generation', () => {
    it('should generate phase sections with consistent structure', () => {
      const phaseConfig = {
        number: 1,
        name: 'RED',
        goal: 'Write failing tests',
        steps: [
          'Define the interface',
          'Write specific tests',
          'Verify tests fail'
        ],
        learningObjective: 'Force precise thinking about requirements'
      };

      const result = generatePhaseContent(phaseConfig);

      expect(result).toContain('## Phase 1: RED');
      expect(result).toContain('**Goal:** Write failing tests');
      expect(result).toContain('1. **Define the interface**');
      expect(result).toContain('2. **Write specific tests**');
      expect(result).toContain('3. **Verify tests fail**');
      expect(result).toContain('**Learning Objective**: Force precise thinking about requirements');
    });

    it('should handle optional phase elements', () => {
      const minimalPhase = {
        number: 2,
        name: 'GREEN',
        goal: 'Make tests pass'
      };

      const result = generatePhaseContent(minimalPhase);

      expect(result).toContain('## Phase 2: GREEN');
      expect(result).toContain('**Goal:** Make tests pass');
      expect(result).not.toContain('**Learning Objective**:');
    });
  });

  describe('File System Integration', () => {
    it('should preserve existing command metadata', () => {
      // Create a mock existing command file
      const existingCommand = `---
allowed-tools: all
description: Original description
custom-field: preserved-value
---

# Original Content

Some existing content that should be preserved.`;

      const commandPath = path.join(tempDir, 'dev.md');
      fs.writeFileSync(commandPath, existingCommand);

      const config = {
        name: 'dev',
        description: 'Updated description',
        preserveCustomFields: true
      };

      const builder = new CommandBuilder(config);
      const result = builder.buildFromExisting(commandPath);

      expect(result).toContain('custom-field: preserved-value');
      expect(result).toContain('description: Updated description');
    });

    it('should backup existing files before modification', () => {
      const originalContent = 'Original command content';
      const commandPath = path.join(tempDir, 'test-command.md');
      fs.writeFileSync(commandPath, originalContent);

      const builder = new CommandBuilder({ name: 'test-command' });
      builder.backupExisting(commandPath);

      const backupFiles = fs.readdirSync(tempDir).filter(f => f.includes('backup'));
      expect(backupFiles).toHaveLength(1);
      
      const backupContent = fs.readFileSync(path.join(tempDir, backupFiles[0]), 'utf8');
      expect(backupContent).toBe(originalContent);
    });
  });

  describe('Error Handling', () => {
    it('should throw meaningful errors for invalid configurations', () => {
      expect(() => {
        new CommandBuilder({});
      }).toThrow('Command name is required');

      expect(() => {
        new CommandBuilder({ name: 'test', phases: 'invalid' });
      }).toThrow('Phases must be an array');
    });

    it('should handle missing template files gracefully', () => {
      expect(() => {
        templateManager.loadTemplate('nonexistent-template');
      }).toThrow('Template not found: nonexistent-template');
    });
  });
});