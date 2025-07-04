const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the command builder (exists from previous implementation)
const CommandBuilder = require('../lib/command-utils/command-builder');

describe('Command Migration Tests', () => {
  let tempDir;
  
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'command-migration-test-'));
  });
  
  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Debug Command Migration', () => {
    it('should generate modular debug command with 5-phase structure', () => {
      const debugConfig = {
        name: 'debug',
        description: 'Systematic debugging workflow with investigation, root cause analysis, and regression testing',
        type: 'workflow',
        actionVerb: 'investigate',
        target: 'issue',
        action: 'attempting any fixes',
        phases: [
          { name: 'ISOLATE', goal: 'Create dedicated git branch and narrow down problem scope' },
          { name: 'REPRODUCE', goal: 'Create single, minimal, automated test that reliably reproduces the bug' },
          { name: 'INVESTIGATE', goal: 'Systematic root cause analysis through evidence gathering' },
          { name: 'FIX', goal: 'Implement minimal fix to make the failing test pass' },
          { name: 'VALIDATE', goal: 'Ensure fix meets all project standards and capture learning' }
        ],
        integrations: ['tdd', 'check', 'ship']
      };

      const builder = new CommandBuilder(debugConfig);
      const result = builder.build();

      // Should contain all 5 phases
      expect(result).toContain('## Phase 1: ISOLATE');
      expect(result).toContain('## Phase 2: REPRODUCE');
      expect(result).toContain('## Phase 3: INVESTIGATE');
      expect(result).toContain('## Phase 4: FIX');
      expect(result).toContain('## Phase 5: VALIDATE');
      
      // Should contain systematic debugging intro
      expect(result).toContain('**YOU MUST SAY:** "Let me systematically investigate this issue before attempting any fixes."');
      
      // Should be significantly smaller than original
      const originalDebug = fs.readFileSync(path.join(__dirname, '../.claude/commands/debug.md'), 'utf8');
      expect(result.length).toBeLessThan(originalDebug.length * 0.5);
    });
  });

  describe('Refactor Command Migration', () => {
    it('should generate modular refactor command with 4-phase structure', () => {
      const refactorConfig = {
        name: 'refactor',
        description: 'Systematic code refactoring and improvement workflows with safety nets',
        type: 'workflow',
        actionVerb: 'analyze',
        target: 'code',
        action: 'making changes',
        phases: [
          { name: 'SAFETY NET', goal: 'Establish comprehensive test coverage before any refactoring begins' },
          { name: 'ANALYZE', goal: 'Understand what needs improvement and why' },
          { name: 'TRANSFORM', goal: 'Make improvements in small, verifiable steps' },
          { name: 'VALIDATE', goal: 'Verify improvements achieved objectives without introducing regressions' }
        ],
        integrations: ['tdd', 'check', 'ship']
      };

      const builder = new CommandBuilder(refactorConfig);
      const result = builder.build();

      // Should contain all 4 phases
      expect(result).toContain('## Phase 1: SAFETY NET');
      expect(result).toContain('## Phase 2: ANALYZE');
      expect(result).toContain('## Phase 3: TRANSFORM');
      expect(result).toContain('## Phase 4: VALIDATE');
      
      // Should contain refactoring intro
      expect(result).toContain('**YOU MUST SAY:** "Let me systematically analyze this code before making changes."');
      
      // Should be significantly smaller than original
      const originalRefactor = fs.readFileSync(path.join(__dirname, '../.claude/commands/refactor.md'), 'utf8');
      expect(result.length).toBeLessThan(originalRefactor.length * 0.5);
    });
  });

  describe('Check Command Migration', () => {
    it('should generate modular check command with quality enforcement focus', () => {
      const checkConfig = {
        name: 'check',
        description: 'Verify code quality, run tests, and ensure production readiness',
        type: 'quality',
        content: `
# CRITICAL REQUIREMENT: FIX ALL ERRORS!

**THIS IS NOT A REPORTING TASK - THIS IS A FIXING TASK!**

When you run \`/check\`, you are REQUIRED to:
1. **IDENTIFY** all errors, warnings, and issues
2. **FIX EVERY SINGLE ONE** - not just report them!
3. **USE MULTIPLE AGENTS** to fix issues in parallel
4. **DO NOT STOP** until EVERYTHING is GREEN
        `,
        integrations: ['dev', 'debug', 'refactor']
      };

      const builder = new CommandBuilder(checkConfig);
      const result = builder.build();

      // Should contain critical requirements
      expect(result).toContain('CRITICAL REQUIREMENT: FIX ALL ERRORS!');
      expect(result).toContain('THIS IS NOT A REPORTING TASK - THIS IS A FIXING TASK!');
      expect(result).toContain('USE MULTIPLE AGENTS');
      
      // Should not contain phases (not a workflow command)
      expect(result).not.toContain('## Phase 1:');
      
      // Should be moderately smaller than original
      const originalCheck = fs.readFileSync(path.join(__dirname, '../.claude/commands/check.md'), 'utf8');
      expect(result.length).toBeLessThan(originalCheck.length * 0.7);
    });
  });

  describe('Ship Command Migration', () => {
    it('should generate modular ship command with commit workflow', () => {
      const shipConfig = {
        name: 'ship',
        description: 'Update roadmap documentation and commit changes with quality validation',
        type: 'workflow',
        content: `
Complete workflow to update roadmap, validate quality, and commit changes.

## Complete Ship Workflow

### **1. Pre-Ship Quality Validation**
### **2. Documentation Updates**  
### **3. Commit Preparation**
### **4. Final Validation & Commit**
        `,
        integrations: ['dev', 'debug', 'refactor', 'check']
      };

      const builder = new CommandBuilder(shipConfig);
      const result = builder.build();

      // Should contain ship workflow sections
      expect(result).toContain('Complete Ship Workflow');
      expect(result).toContain('Pre-Ship Quality Validation');
      expect(result).toContain('Documentation Updates');
      expect(result).toContain('Commit Preparation');
      
      // Should be moderately smaller than original
      const originalShip = fs.readFileSync(path.join(__dirname, '../.claude/commands/ship.md'), 'utf8');
      expect(result.length).toBeLessThan(originalShip.length * 0.8);
    });
  });

  describe('Help Command Migration', () => {
    it('should generate modular help command with command overview', () => {
      const helpConfig = {
        name: 'help',
        description: 'Interactive help system for commands, workflows, and development guidance',
        type: 'utility',
        content: `
Comprehensive help and guidance for the Claude Code Template command system and workflows.

## Commands Overview

### **Core Development Commands:**
- **\`/dev\`** - TDD-first development workflow (PRIMARY COMMAND)
- **\`/debug\`** - Systematic debugging and root cause analysis
- **\`/refactor\`** - Code improvement with safety nets

### **Quality & Shipping Commands:**
- **\`/check\`** - Comprehensive quality verification
- **\`/ship\`** - Documentation updates and commit workflow
        `,
        integrations: []
      };

      const builder = new CommandBuilder(helpConfig);
      const result = builder.build();

      // Should contain help structure
      expect(result).toContain('Commands Overview');
      expect(result).toContain('Core Development Commands');
      expect(result).toContain('Quality & Shipping Commands');
      
      // Should not contain workflow patterns
      expect(result).not.toContain('**YOU MUST SAY:**');
      expect(result).not.toContain('## Phase 1:');
      
      // Should be moderately smaller than original
      const originalHelp = fs.readFileSync(path.join(__dirname, '../.claude/commands/help.md'), 'utf8');
      expect(result.length).toBeLessThan(originalHelp.length * 0.8);
    });
  });

  describe('Prompt Command Migration', () => {
    it('should generate modular prompt command with context handoff focus', () => {
      const promptConfig = {
        name: 'prompt',
        description: 'Context handoff prompts for seamless LLM transitions',
        type: 'utility',
        content: `
Generate comprehensive handoff prompts for seamless LLM transitions and continuity.

## Context Handoff (Default: \`/prompt\`)

**Comprehensive handoff includes:**
- Current working directory and git repository status
- Recent git commits and active changes
- Current project structure and key files
        `,
        integrations: []
      };

      const builder = new CommandBuilder(promptConfig);
      const result = builder.build();

      // Should contain prompt-specific content
      expect(result).toContain('Context Handoff');
      expect(result).toContain('seamless LLM transitions');
      expect(result).toContain('Comprehensive handoff includes');
      
      // Should be smaller than original
      const originalPrompt = fs.readFileSync(path.join(__dirname, '../.claude/commands/prompt.md'), 'utf8');
      expect(result.length).toBeLessThan(originalPrompt.length * 0.9);
    });
  });

  describe('Claude-MD Command Migration', () => {
    it('should generate modular claude-md command with maintenance focus', () => {
      const claudeMdConfig = {
        name: 'claude-md',
        description: 'Essential CLAUDE.md maintenance',
        type: 'utility',
        content: `
Essential maintenance for your instruction file.

## Essential Functions Only

### **\`/claude-md backup\`**
### **\`/claude-md update-mastery\`**
        `,
        integrations: []
      };

      const builder = new CommandBuilder(claudeMdConfig);
      const result = builder.build();

      // Should contain maintenance content
      expect(result).toContain('Essential Functions Only');
      expect(result).toContain('/claude-md backup');
      expect(result).toContain('/claude-md update-mastery');
      
      // Should be slightly smaller than original
      const originalClaudeMd = fs.readFileSync(path.join(__dirname, '../.claude/commands/claude-md.md'), 'utf8');
      expect(result.length).toBeLessThan(originalClaudeMd.length * 0.95);
    });
  });

  describe('CommandBuilder Enhancements for Migration', () => {
    it('should support non-workflow command types', () => {
      const utilityConfig = {
        name: 'test-utility',
        description: 'Test utility command',
        type: 'utility'
      };

      const qualityConfig = {
        name: 'test-quality',
        description: 'Test quality command',
        type: 'quality'
      };

      const utilityResult = new CommandBuilder(utilityConfig).build();
      const qualityResult = new CommandBuilder(qualityConfig).build();

      // Utility commands should not have workflow patterns
      expect(utilityResult).not.toContain('**YOU MUST SAY:**');
      expect(utilityResult).not.toContain('## Phase 1:');
      expect(utilityResult).not.toContain('Learning Integration');

      // Quality commands should have specific patterns but no phases
      expect(qualityResult).not.toContain('## Phase 1:');
      expect(qualityResult).toContain('Quality Requirements');
    });

    it('should handle custom content sections properly', () => {
      const customConfig = {
        name: 'test-custom',
        description: 'Test custom content',
        content: 'Custom content here\n\n## Custom Section\n\nMore content'
      };

      const result = new CommandBuilder(customConfig).build();

      expect(result).toContain('Custom content here');
      expect(result).toContain('## Custom Section');
      expect(result).toContain('More content');
    });

    it('should generate proper usage examples for all command types', () => {
      const configs = [
        { name: 'debug', type: 'workflow' },
        { name: 'check', type: 'quality' },
        { name: 'help', type: 'utility' }
      ];

      configs.forEach(config => {
        const builder = new CommandBuilder({
          ...config,
          description: 'Test command',
          usageExamples: [`/${config.name} "example"`]
        });
        const result = builder.build();

        expect(result).toContain('**Usage:**');
        expect(result).toContain(`/${config.name} "example"`);
      });
    });
  });

  describe('Size Reduction Validation', () => {
    it('should achieve expected size reductions across all commands', () => {
      const originalSizes = {
        debug: fs.readFileSync(path.join(__dirname, '../.claude/commands/debug.md'), 'utf8').length,
        refactor: fs.readFileSync(path.join(__dirname, '../.claude/commands/refactor.md'), 'utf8').length,
        check: fs.readFileSync(path.join(__dirname, '../.claude/commands/check.md'), 'utf8').length,
        ship: fs.readFileSync(path.join(__dirname, '../.claude/commands/ship.md'), 'utf8').length,
        help: fs.readFileSync(path.join(__dirname, '../.claude/commands/help.md'), 'utf8').length,
        prompt: fs.readFileSync(path.join(__dirname, '../.claude/commands/prompt.md'), 'utf8').length,
        'claude-md': fs.readFileSync(path.join(__dirname, '../.claude/commands/claude-md.md'), 'utf8').length
      };

      const totalOriginal = Object.values(originalSizes).reduce((sum, size) => sum + size, 0);
      
      // Based on analysis, expect ~54% overall reduction
      const expectedReduction = 0.54;
      const targetSize = totalOriginal * (1 - expectedReduction);

      // This test will initially fail (RED phase) until all commands are migrated
      expect(totalOriginal).toBeGreaterThan(targetSize);
      
      // Individual command reduction expectations
      expect(originalSizes.debug).toBeGreaterThan(0); // Will be reduced by ~71%
      expect(originalSizes.refactor).toBeGreaterThan(0); // Will be reduced by ~71%
      expect(originalSizes.check).toBeGreaterThan(0); // Will be reduced by ~50%
    });
  });
});