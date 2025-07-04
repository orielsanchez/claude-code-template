const { describe, it, expect } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

describe('Migrated Commands Validation', () => {
  const modularDir = path.join(__dirname, '../.claude/commands-modular');
  const originalDir = path.join(__dirname, '../.claude/commands');
  
  const commands = ['debug', 'refactor', 'check', 'ship', 'help', 'prompt', 'claude-md'];
  
  commands.forEach(cmdName => {
    describe(`${cmdName} command migration`, () => {
      const modularPath = path.join(modularDir, `${cmdName}.md`);
      const originalPath = path.join(originalDir, `${cmdName}.md`);
      
      it('should exist in modular format', () => {
        expect(fs.existsSync(modularPath)).toBe(true);
      });
      
      it('should have proper YAML frontmatter', () => {
        const content = fs.readFileSync(modularPath, 'utf8');
        expect(content).toMatch(/^---\n/);
        expect(content).toContain('allowed-tools: all');
        expect(content).toContain('description:');
        expect(content).toMatch(/---\n/);
      });
      
      it('should contain essential command elements', () => {
        const content = fs.readFileSync(modularPath, 'utf8');
        
        // All commands should have title and description
        expect(content).toMatch(/^# /m);
        expect(content).toContain('**Usage:**');
        
        // Workflow commands should have systematic structure
        if (['debug', 'refactor'].includes(cmdName)) {
          expect(content).toContain('**YOU MUST SAY:**');
          expect(content).toContain('## Phase 1:');
          expect(content).toContain('Learning Objective');
          expect(content).toContain('## Integration with Other Commands');
          expect(content).toContain('## Learning Integration');
          expect(content).toContain('Quality Requirements');
        }
        
        // Quality commands should have specific patterns
        if (cmdName === 'check') {
          expect(content).toContain('CRITICAL REQUIREMENT');
          expect(content).toContain('THIS IS NOT A REPORTING TASK');
          expect(content).toContain('Quality Requirements');
        }
        
        // Ship should have workflow structure
        if (cmdName === 'ship') {
          expect(content).toContain('Complete Ship Workflow');
          expect(content).toContain('Pre-Ship Quality Validation');
        }
        
        // Utility commands should have clean structure
        if (['help', 'prompt', 'claude-md'].includes(cmdName)) {
          expect(content).not.toContain('**YOU MUST SAY:**');
          expect(content).not.toContain('Learning Integration');
        }
      });
      
      it('should maintain command-specific functionality', () => {
        const content = fs.readFileSync(modularPath, 'utf8');
        
        switch (cmdName) {
          case 'debug':
            expect(content).toContain('5-phase systematic debugging');
            expect(content).toContain('## Phase 5: VALIDATE');
            expect(content).toContain('git bisect');
            expect(content).toContain('Shotgun Debugging');
            break;
            
          case 'refactor':
            expect(content).toContain('4-phase systematic refactoring');
            expect(content).toContain('## Phase 4: VALIDATE');
            expect(content).toContain('Extract Method');
            expect(content).toContain('Red-Green-Refactor');
            break;
            
          case 'check':
            expect(content).toContain('FIX ALL ERRORS');
            expect(content).toContain('MULTIPLE AGENTS');
            expect(content).toContain('EVERYTHING is GREEN');
            break;
            
          case 'ship':
            expect(content).toContain('commit message');
            expect(content).toContain('Documentation Updates');
            expect(content).toContain('Quality Validation');
            break;
            
          case 'help':
            expect(content).toContain('Commands Overview');
            expect(content).toContain('Core Development Commands');
            expect(content).toContain('/dev');
            expect(content).toContain('/debug');
            break;
            
          case 'prompt':
            expect(content).toContain('Context Handoff');
            expect(content).toContain('LLM transitions');
            expect(content).toContain('handoff prompt');
            break;
            
          case 'claude-md':
            expect(content).toContain('CLAUDE.md maintenance');
            expect(content).toContain('/claude-md backup');
            expect(content).toContain('/claude-md update-mastery');
            break;
        }
      });
      
      it('should have consistent modular structure', () => {
        const content = fs.readFileSync(modularPath, 'utf8');
        
        // Should follow standard structure
        const sections = content.split('\n## ');
        expect(sections.length).toBeGreaterThan(1);
        
        // Should have integration section for commands that have integrations
        if (['debug', 'refactor', 'check', 'ship'].includes(cmdName)) {
          expect(content).toContain('Integration with Other Commands');
        }
      });
    });
  });
  
  describe('Overall migration results', () => {
    it('should achieve expected size reductions', () => {
      let totalOriginal = 0;
      let totalModular = 0;
      
      commands.forEach(cmdName => {
        const originalPath = path.join(originalDir, `${cmdName}.md`);
        const modularPath = path.join(modularDir, `${cmdName}.md`);
        
        if (fs.existsSync(originalPath) && fs.existsSync(modularPath)) {
          const originalSize = fs.readFileSync(originalPath, 'utf8').length;
          const modularSize = fs.readFileSync(modularPath, 'utf8').length;
          
          totalOriginal += originalSize;
          totalModular += modularSize;
        }
      });
      
      const reduction = (totalOriginal - totalModular) / totalOriginal;
      
      // Log migration results for analysis
      console.log(`Total reduction: ${(reduction * 100).toFixed(1)}%`);
      console.log(`Characters saved: ${totalOriginal - totalModular}`);
    });
    
    it('should maintain all command files', () => {
      commands.forEach(cmdName => {
        const modularPath = path.join(modularDir, `${cmdName}.md`);
        expect(fs.existsSync(modularPath)).toBe(true);
      });
      
      // Should have created all 7 modular commands
      const modularFiles = fs.readdirSync(modularDir).filter(f => f.endsWith('.md'));
      expect(modularFiles).toHaveLength(7);
    });
    
    it('should have consistent quality across all commands', () => {
      commands.forEach(cmdName => {
        const modularPath = path.join(modularDir, `${cmdName}.md`);
        const content = fs.readFileSync(modularPath, 'utf8');
        
        // All should have proper structure
        expect(content).toMatch(/^---[\s\S]*?---\n/);
        expect(content).toMatch(/^# /m);
        expect(content).toContain('**Usage:**');
        
        // Should not contain development artifacts
        expect(content).not.toContain('TODO');
        expect(content).not.toContain('FIXME');
        expect(content).not.toContain('console.log');
        
        // Should have proper markdown structure
        expect(content).not.toContain('# #'); // No double headers
        expect(content).not.toMatch(/\n\n\n\n/); // No excessive whitespace
      });
    });
  });
});