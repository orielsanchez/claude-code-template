---
allowed-tools: all
description: Interactive help system for commands, workflows, and development guidance
---
# Interactive Help & Guidance System

**Usage:**
- `/help` - Show main help overview and command list
- `/help <command>` - Get detailed help for specific command
- `/help <topic>` - Get guidance on workflows and concepts

**Examples:**
- `/help` - Show main help overview and command list
- `/help <command>` - Get detailed help for specific command
- `/help <topic>` - Get guidance on workflows and concepts


Comprehensive help and guidance for the Claude Code Template command system and workflows.

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

## Best Practices

**Daily Workflow:**
1. Start each feature with `/dev <description>`
2. Let TDD guide your implementation
3. Run `/check` frequently (after every few changes)
4. Use `/ship` to commit completed work
5. Use `/prompt` when switching contexts

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
1. Start with `/help workflow` to understand the complete process
2. Try `/dev "simple calculator"` for your first TDD experience
3. Use `/check` frequently to learn quality standards
4. Read through CLAUDE.md for complete philosophy and guidelines

**Experienced developer?**
- `/dev` is your primary command for all feature development
- `/debug` and `/refactor` for systematic improvement workflows
- `/check` and `/ship` for quality gates and professional commits

**Remember**: This system is designed to build senior-level development skills through systematic, test-driven workflows. Every command reinforces best practices and quality standards.
## Integration with Other Commands



**TDD-First Quality Pipeline:**
- **`/help` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/help` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging  
- **`/help` → `/ship`**: Create final commit with proper documentation