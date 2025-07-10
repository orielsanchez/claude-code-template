# Claude Code Commands Reference

**10 powerful commands for systematic development**

## Core Commands

### **Primary Development**
- **`/dev <feature>`** - TDD-first development workflow (PRIMARY COMMAND)
  - Complete test-driven development cycle from feature planning to implementation
  - Enforces test-first approach with quality gates

### **Code Quality & Analysis**
- **`/check`** - Comprehensive quality verification with zero tolerance for issues
- **`/debug <issue>`** - Systematic debugging workflow with root cause analysis
- **`/refactor <target>`** - Systematic code refactoring and improvement workflows
- **`/explore <target>`** - Codebase exploration and analysis workflows

### **Strategic Planning**
- **`/plan <initiative>`** - Strategic roadmap generation and planning
  - 5-phase methodology: Discovery → Design → Planning → Implementation → Resources
  - Creates LLM-followable roadmaps with clear dependencies

### **Completion & Delivery**
- **`/ship [message]`** - Complete and commit changes (NO Claude attribution)
  - Updates roadmap, validates quality, and creates professional commits

### **System & Help**
- **`/help [topic]`** - Comprehensive help and guidance system
  - Interactive command discovery and workflow guidance
- **`/prompt [focus]`** - Context handoff for LLM transitions
  - Generate comprehensive handoff for continuation sessions
- **`/claude-md <action>`** - Essential instruction file maintenance
  - Backup, update mastery tracking, and manage CLAUDE.md

## Command Philosophy

These commands embody our development philosophy:

1. **Test-Driven Development First**: Every feature starts with tests
2. **Quality Without Compromise**: All commands enforce production standards
3. **Knowledge Preservation**: Built-in learning mechanisms prevent AI dependency
4. **Systematic Approach**: Structured workflows over ad-hoc solutions
5. **Professional Standards**: No emojis, no Claude attribution, clean commits

## Usage Patterns

**Complete Feature Development (Recommended):**
```bash
/dev "implement user authentication"   # Full TDD cycle
/check                                 # Quality verification  
/ship "add JWT authentication"         # Professional commit
```

**Strategic Planning & Implementation:**
```bash
/plan "improve authentication system"  # Generate roadmap
/dev "user login"                      # Implement following plan
/check                                 # Ensure quality
/ship "add user login system"          # Document & commit
```

**Code Exploration & Enhancement:**
```bash
/explore "authentication system"       # Understand existing code
/plan "refactor auth module"           # Create improvement roadmap
/refactor "simplify auth logic"        # Systematic refactoring
/check                                 # Validate changes
/ship "improve auth architecture"      # Commit changes
```

**Bug Investigation & Fix:**
```bash
/debug "user login fails with 500"    # Systematic debugging
/check                                 # Quality verification
/ship "fix authentication race condition"  # Document and commit
```

**Context Handoff:**
```bash
/prompt                               # Comprehensive LLM handoff
/prompt debugging                     # Debugging-focused handoff
/help dev                            # Get TDD workflow guidance
```

**Maintenance:**
```bash
/claude-md backup                     # Before major changes
/claude-md update-mastery             # Weekly skill tracking
```

## Command Design Principles

- **Enforce Standards**: No shortcuts, no compromises on quality
- **Build Knowledge**: Each command teaches while executing
- **Compound Learning**: Commands improve with usage and understanding
- **Context Aware**: Adapt to project and codebase patterns
- **Professional Output**: Clean commits, proper documentation

## Quality Standards Enforced

All commands enforce:
- **No emojis** in code, comments, or commits
- **No Claude attribution** in commit messages
- **Proper error handling** for each language
- **Comprehensive testing** for complex logic
- **Clean code practices** and consistent style

## Adding Custom Commands

When creating project-specific commands:

1. **Follow the template**: Use existing commands as reference
2. **Include learning elements**: How does this command teach?
3. **Enforce quality**: What standards does this uphold?
4. **Document clearly**: Make usage obvious with concrete examples
5. **Use YAML frontmatter**: Include `allowed-tools: all` and description

## Command Evolution

Commands evolve based on:
- Patterns that emerge during development
- Successful workflows that should be codified
- Quality issues that need systematic prevention
- Learning gaps that need structured support

Keep commands focused, powerful, and educational.