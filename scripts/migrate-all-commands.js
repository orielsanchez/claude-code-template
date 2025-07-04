const CommandBuilder = require('../lib/command-utils/command-builder');
const fs = require('fs');
const path = require('path');

// Command configurations for migration
const commandConfigs = {
  debug: {
    name: 'debug',
    description: 'Systematic debugging workflow with investigation, root cause analysis, and regression testing',
    allowedTools: 'all',
    type: 'workflow',
    actionVerb: 'investigate',
    target: 'issue',
    action: 'attempting any fixes',
    subtitle: '5-phase systematic debugging',
    
    usageExamples: [
      { command: '/debug <issue>', description: 'Full systematic debugging workflow' },
      { command: '/debug with-test <test_name>', description: 'Start with existing failing test' },
      { command: '/debug --goto-fix "<hypothesis>"', description: 'Fast-track when root cause is known' },
      { command: '/debug investigate <symptoms>', description: 'Investigation only (stops after Phase 2)' },
      { command: '/debug regression <description>', description: 'Create regression tests for resolved bugs' }
    ],
    
    phases: [
      {
        name: 'ISOLATE',
        goal: 'Create dedicated git branch to isolate the debugging effort',
        steps: [
          'Create Debug Branch: Prevents polluting main branch with experimental code',
          'Document Context: Note current commit, affected systems, and reproduction environment'
        ],
        learningObjective: 'Maintain clean git hygiene and enable safe experimentation'
      },
      {
        name: 'REPRODUCE',
        goal: 'Create a single, minimal, automated test that reliably reproduces the bug',
        steps: [
          'Write Failing Regression Test: Use TDD workflow if no test exists',
          'Verify Reproducibility: Ensure the test fails consistently',
          'Document Symptoms: Environment, timing, user actions, error messages'
        ],
        learningObjective: 'Force precise thinking about the bug\'s behavior and create regression protection'
      },
      {
        name: 'INVESTIGATE',
        goal: 'Systematic root cause analysis through iterative hypothesis testing',
        steps: [
          'Formulate Initial Hypothesis: State a clear, testable hypothesis about the root cause',
          'Systematic Evidence Gathering: Execute non-invasive checks to validate or refute hypothesis',
          'USE TASK DELEGATION for complex investigation',
          'Confirm Root Cause: Do not proceed until you have strong evidence pointing to a single root cause'
        ],
        learningObjective: 'Develop systematic investigation skills and understand the WHY behind bugs'
      },
      {
        name: 'FIX',
        goal: 'Implement the minimal fix to make the failing test pass',
        steps: [
          'Implement Minimal Fix: Write only the code needed to make the Phase 1 test pass',
          'Verify Fix: Run the specific failing test to confirm it now passes',
          'Regression Check: Run full test suite to ensure no new failures introduced',
          'Refactor if Needed: Improve design while keeping tests passing'
        ],
        learningObjective: 'Experience how tests guide implementation and provide safety for improvements'
      },
      {
        name: 'VALIDATE',
        goal: 'Ensure the fix meets all project standards and capture learning',
        steps: [
          'Quality Gates: Run `/check` to ensure the fix meets all project quality standards',
          'Reflect & Document: Root cause summary, fix summary, key learning, prevention strategy',
          'Cleanup: Remove any temporary debugging code',
          'Final Commit: Create clean, well-documented commit ready for pull request'
        ],
        learningObjective: 'Build systematic thinking about software quality and failure prevention'
      }
    ],
    
    integrations: ['tdd', 'check', 'ship'],
    
    content: `
Stop, Observe, Understand, Fix, Validate. We do not guess. We do not fix symptoms. We find the root cause, write a test that proves it, fix it, and validate the fix against all quality gates.

## The Systematic Debug Process

**CRITICAL:** Before any investigation, create a dedicated git branch to isolate the debugging effort.

### **Usage Patterns Detailed**

**Standard Debugging: \`/debug <issue>\`**
Full 5-phase workflow for unknown bugs requiring investigation.

**Known Test: \`/debug with-test <test_name>\`**
When you have a specific failing test - assumes Phase 1 is complete, starts with Phase 2.

**Fast Track: \`/debug --goto-fix "<hypothesis>"\`**
For experienced developers with strong hypothesis about root cause:
- Still requires writing/updating the regression test (Phase 1)
- Skips deep investigation (Phase 2) 
- Proceeds directly to fix (Phase 3) and validation (Phase 4)

**Investigation Only: \`/debug investigate <symptoms>\`**
When you need to understand a problem but aren't ready to fix:
- Executes Phases 0-2 only
- Documents findings for later action
- Useful for complex systems requiring analysis before fixes

**Regression Testing: \`/debug regression <description>\`**
Create tests for bugs that were fixed without proper test coverage:
- Focuses on Phase 1 (writing comprehensive regression tests)
- Useful for hardening existing fixes

## Senior-Level Debugging Patterns

### **Hypothesis-Driven Investigation**
1. State hypothesis clearly
2. Design tests to validate/invalidate hypothesis  
3. Gather evidence systematically
4. Refine hypothesis based on evidence
5. Repeat until confident in root cause

### **Git Forensics**
\`\`\`bash
# Find when bug was introduced
git bisect start
git bisect bad HEAD
git bisect good <last_known_good_commit>

# Analyze specific file history
git log -p --follow <file>
git blame <file>
\`\`\`

### **Systematic Evidence Collection**
- **Code Analysis**: Static review of execution paths
- **Historical Analysis**: When and how was this code introduced?
- **Dynamic Analysis**: What happens during execution?
- **Environmental Analysis**: What's different about failing cases?

## Antipatterns to Avoid

**Shotgun Debugging**: Making random changes hoping one will work
- **Solution**: Follow systematic investigation before making changes

**Fixing Symptoms**: Patching visible problems without understanding underlying cause  
- **Solution**: Always trace to root cause before implementing fix

**Skipping the Test**: Writing a fix without proving the bug exists and the fix works
- **Solution**: Regression test is mandatory - no exceptions

**Ignoring Quality Gates**: Committing fixes that fail \`/check\`
- **Solution**: All fixes must meet same quality bar as features

**Debugging Spirals**: Getting lost in complex investigation without structure
- **Solution**: Use systematic phases and task delegation for complex issues

**Working on Main Branch**: Making experimental changes on main development branch
- **Solution**: Always create dedicated debug branch (Phase 0)

The \`/debug\` command transforms reactive firefighting into systematic engineering that strengthens both your codebase and your debugging skills.
`
  },

  refactor: {
    name: 'refactor',
    description: 'Systematic code refactoring and improvement workflows with safety nets',
    allowedTools: 'all',
    type: 'workflow',
    actionVerb: 'analyze',
    target: 'code',
    action: 'making changes',
    subtitle: '4-phase systematic refactoring',
    
    usageExamples: [
      { command: '/refactor <target>', description: 'Full systematic refactoring workflow' },
      { command: '/refactor extract <function_name>', description: 'Extract methods/functions systematically' },
      { command: '/refactor simplify <component>', description: 'Reduce complexity while preserving behavior' },
      { command: '/refactor optimize <performance_target>', description: 'Performance-driven refactoring' },
      { command: '/refactor modernize <legacy_code>', description: 'Update to current patterns and practices' }
    ],
    
    phases: [
      {
        name: 'SAFETY NET',
        goal: 'Establish comprehensive test coverage before any refactoring begins',
        steps: [
          'Create Refactoring Branch: Isolate improvement work',
          'Baseline Testing: Ensure existing tests provide adequate coverage',
          'Behavior Documentation: Record current behavior explicitly'
        ],
        learningObjective: 'Never refactor without a safety net - tests are your insurance policy'
      },
      {
        name: 'ANALYZE',
        goal: 'Understand what needs improvement and why',
        steps: [
          'Identify Refactoring Objectives: State clear goals',
          'Code Smell Analysis: Systematically identify issues',
          'USE SYSTEMATIC ANALYSIS for complex refactoring',
          'Impact Assessment: Understand refactoring scope'
        ],
        learningObjective: 'Develop systematic thinking about code quality and improvement opportunities'
      },
      {
        name: 'TRANSFORM',
        goal: 'Make improvements in small, verifiable steps',
        steps: [
          'One Refactoring at a Time: Never combine multiple refactoring types',
          'Common Refactoring Patterns: Extract Method, Extract Class, Simplify Conditionals',
          'Preserve Behavior: Refactoring never changes external behavior',
          'Language-Specific Best Practices: Use appropriate patterns for your language'
        ],
        learningObjective: 'Experience how small, incremental changes accumulate into significant improvements'
      },
      {
        name: 'VALIDATE',
        goal: 'Verify improvements achieved objectives without introducing regressions',
        steps: [
          'Comprehensive Testing: Ensure all behavior preserved',
          'Quality Metrics: Measure improvement',
          'Code Review: Validate improvement quality',
          'Performance Validation: For optimization refactoring'
        ],
        learningObjective: 'Develop objective assessment skills for code quality improvements'
      }
    ],
    
    integrations: ['tdd', 'check', 'ship'],
    
    content: `
Improve, Simplify, Optimize, Validate. We refactor with purpose, maintain behavior, and enhance quality. Every refactoring must be driven by clear objectives and protected by comprehensive tests.

## Refactoring Types & Patterns

### **Extract Method/Function**
**When:** Methods doing multiple things or containing repeated code
**Goal:** Single responsibility, reusability, readability

### **Extract Class/Module**
**When:** Classes with multiple responsibilities or related functionality scattered
**Goal:** Better organization, single responsibility principle

### **Simplify Complex Logic**
**When:** Nested conditionals, complex boolean logic, or hard-to-follow control flow
**Goal:** Readability, maintainability, testability

### **Performance Optimization**
**When:** Profiling identifies bottlenecks or inefficient algorithms
**Goal:** Improved performance while maintaining behavior

### **Modernization**
**When:** Code uses outdated patterns or doesn't follow current best practices
**Goal:** Use modern language features, improve type safety, follow conventions

## Senior-Level Refactoring Principles

### **Red-Green-Refactor Cycle**
1. Red: Write failing test for new functionality
2. Green: Implement minimal code to pass
3. Refactor: Improve design while keeping tests green

### **Refactoring Catalog**
**Structural Refactoring:**
- Extract Method, Extract Class, Move Method
- Inline Method, Inline Class, Move Field

**Simplification Refactoring:**
- Replace Conditional with Polymorphism
- Replace Magic Numbers with Named Constants
- Simplify Conditional Expressions

**Optimization Refactoring:**
- Replace Algorithm, Optimize Data Structures
- Cache Expensive Operations, Eliminate Redundancy

### **Architecture Improvement Patterns**
- **Dependency Injection**: Reduce coupling, improve testability
- **Strategy Pattern**: Replace complex conditionals with polymorphism
- **Factory Pattern**: Centralize object creation logic
- **Observer Pattern**: Decouple event handling

## Antipatterns to Avoid

**Big Bang Refactoring**: Changing everything at once
- **Solution**: Incremental refactoring with test validation at each step

**Refactoring Without Tests**: Changing code without safety net
- **Solution**: Always establish comprehensive test coverage first

**Changing Behavior During Refactoring**: Adding features while refactoring
- **Solution**: Strict separation - refactor OR add features, never both

**Premature Optimization**: Optimizing without evidence of need
- **Solution**: Profile first, optimize only proven bottlenecks

**Refactoring for Refactoring's Sake**: Changing code without clear benefit
- **Solution**: Always have specific improvement objectives

The \`/refactor\` command transforms reactive maintenance into proactive code improvement that builds both codebase quality and refactoring skills.
`
  },

  check: {
    name: 'check',
    description: 'Verify code quality, run tests, and ensure production readiness',
    allowedTools: 'all',
    type: 'quality',
    
    usageExamples: [
      { command: '/check', description: 'Comprehensive quality verification and fixing' },
      { command: '/check --fix', description: 'Automatically fix issues where possible' }
    ],
    
    integrations: ['dev', 'debug', 'refactor'],
    
    content: `
# CRITICAL REQUIREMENT: FIX ALL ERRORS!

**THIS IS NOT A REPORTING TASK - THIS IS A FIXING TASK!**

When you run \`/check\`, you are REQUIRED to:

1. **IDENTIFY** all errors, warnings, and issues
2. **FIX EVERY SINGLE ONE** - not just report them!
3. **USE MULTIPLE AGENTS** to fix issues in parallel:
   - Spawn one agent to fix linting issues
   - Spawn another to fix test failures
   - Spawn more agents for different files/modules
   - Say: "I'll spawn multiple agents to fix all these issues in parallel"
4. **DO NOT STOP** until:
   - ALL linters pass with ZERO warnings
   - ALL tests pass
   - Build succeeds
   - EVERYTHING is GREEN

**FORBIDDEN BEHAVIORS:**
- "Here are the issues I found" → NO! FIX THEM!
- "The linter reports these problems" → NO! RESOLVE THEM!
- "Tests are failing because..." → NO! MAKE THEM PASS!
- Stopping after listing issues → NO! KEEP WORKING!

**MANDATORY WORKFLOW:**
1. Run checks → Find issues
2. IMMEDIATELY spawn agents to fix ALL issues
3. Re-run checks → Find remaining issues
4. Fix those too
5. REPEAT until EVERYTHING passes

**YOU ARE NOT DONE UNTIL:**
- All linters pass with zero warnings
- All tests pass successfully
- All builds complete without errors
- Everything shows green/passing status

## Universal Quality Verification Protocol

**Step 1: Language-Agnostic Linting**
Run appropriate linters for ALL languages in the project:
- \`make lint\` if Makefile exists
- \`~/.claude/hooks/smart-lint.sh\` for automatic detection
- Manual linter runs if needed

**Universal Requirements:**
- ZERO warnings across ALL linters
- ZERO disabled linter rules without documented justification
- ZERO "nolint" or suppression comments without explanation
- ZERO formatting issues (all code must be auto-formatted)

**Step 2: Test Verification**
Run \`make test\` and ensure:
- ALL tests pass without flakiness
- Test coverage is meaningful (not just high numbers)
- Table-driven tests for complex logic
- No skipped tests without justification
- Tests actually test behavior, not implementation details

**Step 3: Quality Checklist**
- [ ] No commented-out code blocks
- [ ] No debugging print statements
- [ ] No placeholder implementations
- [ ] Consistent formatting
- [ ] Dependencies are actually used
- [ ] No circular dependencies

**Failure Response Protocol:**
When issues are found:
1. **IMMEDIATELY SPAWN AGENTS** to fix issues in parallel
2. **FIX EVERYTHING** - Address EVERY issue, no matter how "minor"
3. **VERIFY** - Re-run all checks after fixes
4. **REPEAT** - If new issues found, spawn more agents and fix those too
5. **NO STOPPING** - Keep working until ALL checks show GREEN
6. **NO EXCUSES** - Fix it NOW!

**Final Verification:**
The code is ready when:
- make lint: PASSES with zero warnings
- make test: PASSES all tests
- All checklist items verified
- Feature works end-to-end in realistic scenarios

**REMEMBER: This is a FIXING task, not a reporting task!**

The code is ready ONLY when every single check shows GREEN.
`
  },

  ship: {
    name: 'ship',
    description: 'Update roadmap documentation and commit changes with quality validation',
    allowedTools: 'all',
    type: 'workflow',
    
    usageExamples: [
      { command: '/ship [message]', description: 'Ship with specific commit message' },
      { command: '/ship', description: 'Ship with auto-generated message based on changes' }
    ],
    
    integrations: ['dev', 'debug', 'refactor', 'check'],
    
    content: `
Complete workflow to update roadmap, validate quality, and commit changes.

## Complete Ship Workflow

### **1. Pre-Ship Quality Validation**
- Run comprehensive \`/check\` to ensure all quality gates pass
- Verify all tests are passing
- Confirm no linting or formatting issues
- Validate that implementation is complete

### **2. Documentation Updates**
- Update project roadmap with completed features
- Document any architectural decisions made
- Update CHANGELOG.md or project documentation
- Record lessons learned and patterns discovered

### **3. Commit Preparation**
- Analyze git diff to understand scope of changes
- Generate meaningful commit message if not provided
- Stage all relevant files for commit
- Follow project commit message conventions

### **4. Final Validation & Commit**
- Final quality check with hooks
- Create commit with proper attribution
- Verify commit succeeded
- Optionally update mastery progression

## Smart Commit Messages

**Auto-generated messages include:**
- Feature scope and primary changes
- Files modified and their purpose
- Any architectural or design decisions
- Testing coverage and validation performed

**Message format follows project conventions:**
\`\`\`
feat: implement user authentication system

- Add JWT token-based authentication
- Implement login/logout endpoints  
- Add middleware for route protection
- Include comprehensive test coverage

Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
\`\`\`

## Integration with Development Workflow

**Typical Usage Pattern:**
\`\`\`bash
/dev "user authentication"     # Implement with TDD
/check                         # Validate quality
/ship "implement auth system"  # Update docs and commit
\`\`\`

**Pre-Ship Checklist (Auto-Executed):**
- All tests passing
- Linters pass with zero warnings
- Code formatted correctly
- Documentation updated
- Roadmap reflects current state
- Commit message is meaningful

The \`/ship\` command ensures that every change is properly documented, validated, and committed with full context preservation.
`
  },

  help: {
    name: 'help',
    description: 'Interactive help system for commands, workflows, and development guidance',
    allowedTools: 'all',
    type: 'utility',
    
    usageExamples: [
      { command: '/help', description: 'Show main help overview and command list' },
      { command: '/help <command>', description: 'Get detailed help for specific command' },
      { command: '/help <topic>', description: 'Get guidance on workflows and concepts' }
    ],
    
    integrations: [],
    
    content: `Comprehensive help and guidance for the Claude Code Template command system and workflows.

## Commands Overview

### **Core Development Commands:**

**\`/dev <feature>\`** - TDD-first development workflow (PRIMARY COMMAND)
- **Purpose**: The main way to build features with test-driven development
- **Default behavior**: Always starts with writing tests first
- **Smart context**: Automatically detects current TDD phase (RED/GREEN/REFACTOR)
- **Usage**: \`/dev "user authentication"\`, \`/dev\`, \`/dev test run\`

**\`/debug <issue>\`** - Systematic debugging and root cause analysis
- **Purpose**: 5-phase systematic debugging workflow
- **Phases**: ISOLATE → REPRODUCE → INVESTIGATE → FIX → VALIDATE
- **Usage**: \`/debug "login fails randomly"\`, \`/debug\`

**\`/refactor <focus>\`** - Code improvement with safety nets
- **Purpose**: 4-phase systematic refactoring workflow  
- **Phases**: SAFETY NET → ANALYZE → TRANSFORM → VALIDATE
- **Usage**: \`/refactor "simplify auth logic"\`, \`/refactor\`

### **Quality & Shipping Commands:**

**\`/check\`** - Comprehensive quality verification
- **Purpose**: Zero-tolerance quality gate with automated checks
- **Features**: Linting, formatting, tests, security, performance validation
- **Usage**: \`/check\`, \`/check --fix\`

**\`/ship <message>\`** - Documentation updates and commit workflow
- **Purpose**: Professional commit creation with documentation updates
- **Features**: Automated documentation, commit message generation, quality checks
- **Usage**: \`/ship "add user authentication system"\`

### **System Commands:**

**\`/prompt [focus]\`** - Context handoff for LLM transitions
- **Purpose**: Generate comprehensive handoff prompts for fresh sessions
- **Usage**: \`/prompt\`, \`/prompt debugging\`, \`/prompt architecture\`

**\`/claude-md [action]\`** - Instruction file maintenance
- **Purpose**: Update and maintain CLAUDE.md instruction file
- **Usage**: \`/claude-md refresh\`, \`/claude-md add pattern\`, \`/claude-md update\`

## Workflow Guidance

### **Complete Development Process**

**1. Start with TDD:** \`/dev "feature description"\`
- AI writes failing tests that define the behavior
- Implements minimal code to make tests pass
- Refactors for quality with test protection

**2. Verify Quality:** \`/check\`
- Runs all linters, formatters, tests
- Ensures zero tolerance quality standards
- Fixes any issues before proceeding

**3. Ship the Feature:** \`/ship "descriptive commit message"\`
- Updates documentation automatically
- Creates professional commit with proper message
- Maintains project history

### **Bug Investigation Process**

**1. Systematic Debugging:** \`/debug "issue description"\`
- Isolates the problem systematically
- Reproduces the issue reliably
- Investigates root cause thoroughly
- Implements proper fix with tests
- Validates the solution

**2. Quality Check:** \`/check\`
- Ensures fix doesn't break anything
- Validates all quality standards

**3. Document & Commit:** \`/ship "fix: description of what was fixed"\`

### **Code Improvement Process**

**1. Safe Refactoring:** \`/refactor "improvement focus"\`
- Creates comprehensive test safety net
- Analyzes code for improvement opportunities
- Transforms code systematically
- Validates all changes continuously

**2. Quality Validation:** \`/check\`
- Ensures improvements maintain quality
- Validates performance isn't degraded

**3. Document Changes:** \`/ship "refactor: description of improvements"\`

## Best Practices

**Daily Workflow:**
1. Start each feature with \`/dev <description>\`
2. Let TDD guide your implementation
3. Run \`/check\` frequently (after every few changes)
4. Use \`/ship\` to commit completed work
5. Use \`/prompt\` when switching contexts

**Quality Maintenance:**
- Never ignore linter warnings or test failures
- Fix quality issues immediately, don't defer
- Use hooks to prevent bad patterns from being committed
- Maintain zero-tolerance quality standards

**Learning Focus:**
- Understand WHY tests come first, not just HOW
- Build systematic thinking skills through TDD
- Document insights and patterns you discover
- Progress from novice to expert in TDD practices

## Getting Started

**New to this template?**
1. Start with \`/help workflow\` to understand the complete process
2. Try \`/dev "simple calculator"\` for your first TDD experience
3. Use \`/check\` frequently to learn quality standards
4. Read through CLAUDE.md for complete philosophy and guidelines

**Experienced developer?**
- \`/dev\` is your primary command for all feature development
- \`/debug\` and \`/refactor\` for systematic improvement workflows
- \`/check\` and \`/ship\` for quality gates and professional commits

**Remember**: This system is designed to build senior-level development skills through systematic, test-driven workflows. Every command reinforces best practices and quality standards.
`
  },

  prompt: {
    name: 'prompt',
    description: 'Context handoff prompts for seamless LLM transitions',
    allowedTools: 'all',
    type: 'utility',
    
    usageExamples: [
      { command: '/prompt', description: 'Generate comprehensive handoff prompt (default)' },
      { command: '/prompt [focus_area]', description: 'Generate focused handoff prompt for specific domain' }
    ],
    
    integrations: [],
    
    content: `
Generate comprehensive handoff prompts for seamless LLM transitions and continuity.

## Context Handoff (Default: \`/prompt\`)

**When called without arguments, generates a comprehensive handoff prompt for seamless LLM continuation.**

**Comprehensive handoff includes:**
- Current working directory and git repository status
- Recent git commits and active changes (staged/unstaged)
- Current project structure and key files
- Active todos and project state
- Recent development progress and next logical steps
- Key constraints and patterns from CLAUDE.md
- Available commands and workflow guidance

**Focused handoff (\`/prompt [focus_area]\`) includes:**
- All above context PLUS targeted focus on specific area
- Focus areas: debugging, architecture, testing, performance, refactoring
- Specialized context relevant to the focus area
- Specific next steps for that domain

**Optimized for context efficiency:**
- Essential state information without full file dumps
- Forward momentum focus rather than comprehensive history
- Ready to paste into fresh LLM session
- Includes enough context for informed continuation

## When to Use Context Handoff

**Primary use case**: When your current LLM session is approaching context limits or you need to transition to a fresh session while preserving project understanding.

**Ideal scenarios:**
- Long development sessions with accumulated context
- Switching between different LLM providers or models
- Taking breaks and resuming work later
- Onboarding new team members to current project state
- Creating checkpoints during complex development tasks

**The generated handoff includes everything needed for seamless continuation without losing development momentum or project understanding.**
`
  },

  'claude-md': {
    name: 'claude-md',
    description: 'Essential CLAUDE.md maintenance',
    allowedTools: 'all',
    type: 'utility',
    
    usageExamples: [
      { command: '/claude-md backup', description: 'Create timestamped backup before changes' },
      { command: '/claude-md update-mastery', description: 'Update skill progression markers' }
    ],
    
    integrations: [],
    
    content: `
Essential maintenance for your instruction file.

## Essential Functions Only

### **\`/claude-md backup\`**
- Create timestamped backup before major changes
- Preserve working instruction sets
- Enable safe experimentation with new patterns

### **\`/claude-md update-mastery\`** 
- Update the Mastery Progression section
- Track learning progress: novice → intermediate → advanced → expert
- Adjust current focus areas and learning objectives

**Other maintenance (patterns, reviews, validation) can be handled through direct conversation with the LLM rather than specialized commands.**

**Maintenance Schedule:**
- **Backup**: Before major instruction changes
- **Update Mastery**: Weekly progression review
`
  }
};

// Function to migrate all commands
function migrateAllCommands() {
  const results = {};
  const outputDir = path.join(__dirname, '../.claude/commands-modular');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  Object.entries(commandConfigs).forEach(([cmdName, config]) => {
    console.log(`\n=== Migrating ${cmdName}.md ===`);
    
    const builder = new CommandBuilder(config);
    const modularContent = builder.build();
    
    // Write modular version
    const outputPath = path.join(outputDir, `${cmdName}.md`);
    fs.writeFileSync(outputPath, modularContent);
    
    // Calculate size reduction
    const originalPath = path.join(__dirname, `../.claude/commands/${cmdName}.md`);
    if (fs.existsSync(originalPath)) {
      const originalContent = fs.readFileSync(originalPath, 'utf8');
      const originalSize = originalContent.length;
      const modularSize = modularContent.length;
      const reduction = ((originalSize - modularSize) / originalSize * 100).toFixed(1);
      
      results[cmdName] = {
        originalSize,
        modularSize,
        reduction: `${reduction}%`,
        saved: originalSize - modularSize
      };
      
      console.log(`Original: ${originalSize} chars`);
      console.log(`Modular:  ${modularSize} chars`);
      console.log(`Reduction: ${reduction}% (${originalSize - modularSize} chars saved)`);
    } else {
      console.log('Original file not found for comparison');
    }
  });
  
  return results;
}

// Run migration
console.log('Starting full command migration to modular system...\n');
const results = migrateAllCommands();

// Summary
console.log('\n=== MIGRATION SUMMARY ===');
let totalOriginal = 0;
let totalModular = 0;
let totalSaved = 0;

Object.entries(results).forEach(([cmd, data]) => {
  totalOriginal += data.originalSize;
  totalModular += data.modularSize;
  totalSaved += data.saved;
  console.log(`${cmd.padEnd(12)}: ${data.reduction.padStart(6)} reduction (${data.saved} chars saved)`);
});

const overallReduction = ((totalSaved / totalOriginal) * 100).toFixed(1);
console.log(`\nOVERALL RESULTS:`);
console.log(`Total Original: ${totalOriginal} characters`);
console.log(`Total Modular:  ${totalModular} characters`);
console.log(`Total Saved:    ${totalSaved} characters`);
console.log(`Overall Reduction: ${overallReduction}%`);

console.log(`\nModular commands generated in: .claude/commands-modular/`);
console.log(`Ready for validation and replacement of original files.`);

module.exports = { commandConfigs, migrateAllCommands };