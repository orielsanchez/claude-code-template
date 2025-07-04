---
allowed-tools: all
description: Interactive help system for commands, workflows, and development guidance
---

# Help System

Comprehensive help and guidance for the Claude Code Template command system and workflows.

**Usage:**
- `/help` - Show main help overview and command list
- `/help <command>` - Get detailed help for specific command
- `/help <topic>` - Get guidance on workflows and concepts

**Examples:**
- `/help` - Main help overview
- `/help dev` - Detailed help on TDD-first development workflow
- `/help workflow` - Complete development process guidance
- `/help quality` - Code quality standards and validation

## Commands Overview

### **Core Development Commands:**

**`/dev <feature>`** - TDD-first development workflow (PRIMARY COMMAND)
- **Purpose**: The main way to build features with test-driven development
- **Default behavior**: Always starts with writing tests first
- **Smart context**: Automatically detects current TDD phase (RED/GREEN/REFACTOR)
- **Usage**: `/dev "user authentication"`, `/dev`, `/dev test run`

**`/debug <issue>`** - Systematic debugging and root cause analysis
- **Purpose**: 5-phase systematic debugging workflow
- **Phases**: ISOLATE → REPRODUCE → INVESTIGATE → FIX → VALIDATE
- **Usage**: `/debug "login fails randomly"`, `/debug`

**`/refactor <focus>`** - Code improvement with safety nets
- **Purpose**: 4-phase systematic refactoring workflow  
- **Phases**: SAFETY NET → ANALYZE → TRANSFORM → VALIDATE
- **Usage**: `/refactor "simplify auth logic"`, `/refactor`

### **Quality & Shipping Commands:**

**`/check`** - Comprehensive quality verification
- **Purpose**: Zero-tolerance quality gate with automated checks
- **Features**: Linting, formatting, tests, security, performance validation
- **Usage**: `/check`, `/check --fix`

**`/ship <message>`** - Documentation updates and commit workflow
- **Purpose**: Professional commit creation with documentation updates
- **Features**: Automated documentation, commit message generation, quality checks
- **Usage**: `/ship "add user authentication system"`

### **System Commands:**

**`/prompt [focus]`** - Context handoff for LLM transitions
- **Purpose**: Generate comprehensive handoff prompts for fresh sessions
- **Usage**: `/prompt`, `/prompt debugging`, `/prompt architecture`

**`/claude-md [action]`** - Instruction file maintenance
- **Purpose**: Update and maintain CLAUDE.md instruction file
- **Usage**: `/claude-md refresh`, `/claude-md add pattern`, `/claude-md update`

## Workflow Guidance

### **Complete Development Process**

**1. Start with TDD:** `/dev "feature description"`
- AI writes failing tests that define the behavior
- Implements minimal code to make tests pass
- Refactors for quality with test protection

**2. Verify Quality:** `/check`
- Runs all linters, formatters, tests
- Ensures zero tolerance quality standards
- Fixes any issues before proceeding

**3. Ship the Feature:** `/ship "descriptive commit message"`
- Updates documentation automatically
- Creates professional commit with proper message
- Maintains project history

### **Bug Investigation Process**

**1. Systematic Debugging:** `/debug "issue description"`
- Isolates the problem systematically
- Reproduces the issue reliably
- Investigates root cause thoroughly
- Implements proper fix with tests
- Validates the solution

**2. Quality Check:** `/check`
- Ensures fix doesn't break anything
- Validates all quality standards

**3. Document & Commit:** `/ship "fix: description of what was fixed"`

### **Code Improvement Process**

**1. Safe Refactoring:** `/refactor "improvement focus"`
- Creates comprehensive test safety net
- Analyzes code for improvement opportunities
- Transforms code systematically
- Validates all changes continuously

**2. Quality Validation:** `/check`
- Ensures improvements maintain quality
- Validates performance isn't degraded

**3. Document Changes:** `/ship "refactor: description of improvements"`

## Detailed Command Help

### **`/help dev`** - TDD-First Development

**Core Philosophy**: Test-driven development is not optional, it's the foundation of quality software.

**Command Variants**:
- `/dev <feature>` - Full TDD workflow starting with failing tests
- `/dev` - Smart continuation based on current workspace state
- `/dev plan <feature>` - TDD-oriented planning phase
- `/dev test` - Test management hub (run, coverage, review, debug)
- `/dev implement` - Implementation phase (only after tests exist)
- `/dev refactor` - Refactoring with test safety net

**TDD Phases**:
1. **RED**: Write failing tests that define the exact behavior
2. **GREEN**: Implement minimal code to make tests pass
3. **REFACTOR**: Improve design with test protection

**Context Detection**:
- No tests exist → Starts with RED phase (write tests)
- Tests failing → GREEN phase (implement to pass tests)
- Tests passing → REFACTOR phase (improve with safety)

### **`/help debug`** - Systematic Debugging

**5-Phase Debugging Process**:
1. **ISOLATE**: Narrow down the problem scope
2. **REPRODUCE**: Create reliable reproduction steps
3. **INVESTIGATE**: Systematic root cause analysis  
4. **FIX**: Implement proper solution with tests
5. **VALIDATE**: Ensure fix works and doesn't break anything

**Best for**: Complex bugs, mysterious errors, performance issues, race conditions

### **`/help refactor`** - Code Improvement

**4-Phase Refactoring Process**:
1. **SAFETY NET**: Ensure comprehensive test coverage
2. **ANALYZE**: Identify improvement opportunities
3. **TRANSFORM**: Make changes systematically
4. **VALIDATE**: Continuous testing during changes

**Best for**: Code smells, performance optimization, architecture improvements

### **`/help check`** - Quality Verification

**Zero-Tolerance Quality Standards**:
- All linters must pass with zero warnings
- All tests must pass with meaningful coverage
- Code formatting must be consistent
- No forbidden patterns (defined in CLAUDE.md)
- Security checks and performance validation

**Quality Enforcement**:
- Hooks prevent commits with quality issues
- Automatic fixing where possible
- Clear reporting of all issues

### **`/help ship`** - Professional Commits

**Automated Commit Workflow**:
- Reviews all changes systematically
- Updates relevant documentation
- Generates professional commit messages
- Follows conventional commit standards
- Runs final quality checks

**Documentation Updates**:
- README updates for new features
- API documentation for interface changes
- Architecture docs for structural changes

## Learning & Development

### **TDD Mastery Progression**
- **Novice**: Can write basic tests with guidance
- **Intermediate**: Can design test suites independently  
- **Advanced**: Can use TDD to drive architecture
- **Expert**: Can teach TDD patterns to others

### **Quality Standards**
- **Universal Forbidden Patterns**: No emojis, no TODOs in production, proper error handling
- **Language-Specific Rules**: Rust (no unwrap/panic), TypeScript (no any), Python (type hints)
- **Architecture Principles**: Single responsibility, early returns, meaningful names

### **Workflow Mastery**
- **Research → Plan → Test → Implement → Ship**
- **Always start with failing tests**
- **Use tests to drive design decisions**
- **Refactor fearlessly with test protection**

## Troubleshooting

### **Common Issues**

**Command not found**: 
- Check that Claude Code is installed: `npm install -g @anthropic-ai/claude-code`
- Verify you're in a directory with `.claude/commands/` folder

**Quality checks failing**:
- Run `/check` to see specific issues
- Fix linting/formatting issues automatically where possible
- Never ignore quality warnings - fix them immediately

**TDD workflow confusion**:
- Always start with `/dev <feature>` for new development
- Let AI guide you through proper TDD phases
- Use `/dev test` for test management operations

**Getting stuck in debugging**:
- Use `/debug` for systematic investigation
- Don't spiral into complex solutions
- Step back and simplify when confused

### **Best Practices**

**Daily Workflow**:
1. Start each feature with `/dev <description>`
2. Let TDD guide your implementation
3. Run `/check` frequently (after every few changes)
4. Use `/ship` to commit completed work
5. Use `/prompt` when switching contexts

**Quality Maintenance**:
- Never ignore linter warnings or test failures
- Fix quality issues immediately, don't defer
- Use hooks to prevent bad patterns from being committed
- Maintain zero-tolerance quality standards

**Learning Focus**:
- Understand WHY tests come first, not just HOW
- Build systematic thinking skills through TDD
- Document insights and patterns you discover
- Progress from novice to expert in TDD practices

## Getting Started

**New to this template?**
1. Start with `/help workflow` to understand the complete process
2. Try `/dev "simple calculator"` for your first TDD experience
3. Use `/check` frequently to learn quality standards
4. Read through CLAUDE.md for complete philosophy and guidelines

**Experienced developer?**
- `/dev` is your primary command for all feature development
- `/debug` and `/refactor` for systematic improvement workflows
- `/check` and `/ship` for quality gates and professional commits

**Need specific guidance?**
- `/help <command>` for detailed command documentation
- `/help <topic>` for workflow and concept guidance
- `/claude-md refresh` to update development guidelines

---

**Remember**: This system is designed to build senior-level development skills through systematic, test-driven workflows. Every command reinforces best practices and quality standards.