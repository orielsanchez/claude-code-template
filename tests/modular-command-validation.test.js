const { describe, it, expect } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

describe('Modular Command Validation', () => {
  const modularDevPath = path.join(__dirname, '../.claude/commands/dev-modular.md');
  const originalDevPath = path.join(__dirname, '../.claude/commands/dev.md');
  
  it('should contain all essential TDD elements', () => {
    const content = fs.readFileSync(modularDevPath, 'utf8');
    
    // Core TDD elements should be present
    expect(content).toContain('TDD-first development workflow');
    expect(content).toContain('## Phase 1: RED');
    expect(content).toContain('## Phase 2: GREEN');
    expect(content).toContain('## Phase 3: REFACTOR');
    expect(content).toContain('Write failing tests');
    expect(content).toContain('Minimal implementation');
    expect(content).toContain('Learning Objective');
  });
  
  it('should have proper YAML frontmatter', () => {
    const content = fs.readFileSync(modularDevPath, 'utf8');
    
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('allowed-tools: all');
    expect(content).toContain('description: TDD-first development workflow');
    expect(content).toMatch(/---\n/);
  });
  
  it('should include quality standards', () => {
    const content = fs.readFileSync(modularDevPath, 'utf8');
    
    expect(content).toContain('Quality Requirements');
    expect(content).toContain('Follow all forbidden patterns from CLAUDE.md');
    expect(content).toContain('No unwrap(), expect(), panic!()');
  });
  
  it('should include integration patterns', () => {
    const content = fs.readFileSync(modularDevPath, 'utf8');
    
    expect(content).toContain('## Integration with Other Commands');
    expect(content).toContain('/dev` → `/check`');
    expect(content).toContain('/dev` → `/debug`');
    expect(content).toContain('/dev` → `/ship`');
  });
  
  it('should include learning integration', () => {
    const content = fs.readFileSync(modularDevPath, 'utf8');
    
    expect(content).toContain('## Learning Integration');
    expect(content).toContain('### **Before Starting**:');
    expect(content).toContain('### **During Implementation**:');
    expect(content).toContain('### **After Completion**:');
  });
  
  it('should be significantly smaller than original while maintaining functionality', () => {
    const modularContent = fs.readFileSync(modularDevPath, 'utf8');
    const originalContent = fs.readFileSync(originalDevPath, 'utf8');
    
    // Should be significantly smaller
    expect(modularContent.length).toBeLessThan(originalContent.length * 0.5);
    
    // But should still contain all core functionality
    const essentialElements = [
      'TDD-first',
      'Phase 1: RED',
      'Phase 2: GREEN', 
      'Phase 3: REFACTOR',
      'Learning Objective',
      'Quality Requirements',
      'Integration with Other Commands'
    ];
    
    essentialElements.forEach(element => {
      expect(modularContent).toContain(element);
    });
  });
  
  it('should have consistent structure with other modular commands', () => {
    const content = fs.readFileSync(modularDevPath, 'utf8');
    
    // Should follow the standard modular structure
    const sections = [
      '# TDD-First Development Workflow',
      '**Usage:**',
      '**Examples:**', 
      '**YOU MUST SAY:**',
      '## The Systematic Process',
      '## Phase 1: RED',
      '## Integration with Other Commands',
      '**Quality Requirements**:',
      '## Learning Integration'
    ];
    
    sections.forEach(section => {
      expect(content).toContain(section);
    });
  });
});