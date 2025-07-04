const CommandBuilder = require('../lib/command-utils/command-builder');
const fs = require('fs');
const path = require('path');

// Configuration for the dev command using modular system
const devConfig = {
  name: 'dev',
  description: 'TDD-first development workflow - the primary way to build features with AI assistance',
  allowedTools: 'all',
  type: 'workflow',
  actionVerb: 'approach',
  target: 'task',
  action: 'proceeding',
  
  // Usage examples
  usageExamples: [
    { command: '/dev <feature_description>', description: 'Full TDD workflow for new features (RECOMMENDED)' },
    { command: '/dev', description: 'Smart continuation based on current context' },
    { command: '/dev plan <feature>', description: 'Explicit planning phase with TDD approach' },
    { command: '/dev test', description: 'Test management and TDD cycle control' },
    { command: '/dev implement', description: 'Implementation phase (only after tests exist)' },
    { command: '/dev refactor', description: 'Refactoring phase with test safety net' }
  ],
  
  // Phase configuration for workflow
  phases: [
    {
      name: 'RED',
      goal: 'Write failing tests that define the exact behavior',
      steps: [
        'Define the Interface: What API/behavior do we want?',
        'Write Specific Tests: Cover happy path, edge cases, error conditions',
        'Document Assumptions: Clear inputs, outputs, constraints',
        'Verify Tests Fail: Confirm we\'re testing the right behavior'
      ],
      learningObjective: 'Force precise thinking about requirements before any implementation'
    },
    {
      name: 'GREEN',
      goal: 'Minimal implementation to make tests pass',
      steps: [
        'Provide Test Context: AI uses failing tests as specification',
        'Minimal Implementation: Only code needed to pass tests',
        'Avoid Over-Engineering: No features not covered by tests',
        'Validate Success: All tests must pass'
      ],
      learningObjective: 'See how tests guide implementation decisions'
    },
    {
      name: 'REFACTOR',
      goal: 'Improve code quality while maintaining test coverage',
      steps: [
        'Identify Improvements: Code smells, architecture issues',
        'Refactor with Confidence: Tests ensure behavior preservation',
        'Extract Patterns: Move toward better design',
        'Continuous Validation: Tests run after each change'
      ],
      learningObjective: 'Experience fearless refactoring with test protection'
    }
  ],
  
  // Integration with other commands
  integrations: ['check', 'debug', 'ship'],
  
  // Additional content sections
  content: `
**THE PRIMARY COMMAND FOR ALL FEATURE DEVELOPMENT**

Complete TDD-first development workflow with AI assistance. This command embodies the template's core philosophy: test-driven development is not optional, it's the foundation of quality software.

## Core TDD-First Philosophy

**EVERY development task starts with tests.** This command is designed to make TDD the natural, default path. The AI will:

1. **Always default to test-first thinking**
2. **Guide you through proper TDD phases** 
3. **Explain WHY tests come first**
4. **Use tests to drive design decisions**
5. **Build your systematic thinking skills**

**This is not just a tool - it's a TDD coach that builds senior-level development skills.**
`
};

// Build the new dev command
const builder = new CommandBuilder(devConfig);
const newDevCommand = builder.build();

// Write to a temporary file for comparison
const outputPath = path.join(__dirname, '../.claude/commands/dev-modular.md');
fs.writeFileSync(outputPath, newDevCommand);

console.log('Generated modular dev command at:', outputPath);
console.log('Command length:', newDevCommand.length);
console.log('Original command structure successfully converted to modular format.');

// Show size comparison
const originalPath = path.join(__dirname, '../.claude/commands/dev.md');
if (fs.existsSync(originalPath)) {
  const originalContent = fs.readFileSync(originalPath, 'utf8');
  console.log('\nSize comparison:');
  console.log('Original dev.md:', originalContent.length, 'characters');
  console.log('Modular dev.md:', newDevCommand.length, 'characters');
  console.log('Difference:', newDevCommand.length - originalContent.length, 'characters');
}