# Claude Code Commands Reference

**6 powerful commands for systematic development**

## Core Commands

### **Development & Quality**
- **`/check`** - Comprehensive quality verification with zero tolerance for issues
- **`/next <task>`** - Structured feature implementation with TDD integration

### **Test-Driven Development**
- **`/tdd <feature|action>`** - Complete TDD workflow and test management
  - `/tdd <feature>` - Full TDD cycle for new features
  - `/tdd run|coverage|review|design` - Test management actions

### **Completion & Delivery**
- **`/ship [message]`** - Update roadmap, validate quality, and commit changes

### **System & Help**
- **`/prompt [focus|help]`** - Context handoff and interactive help system
  - `/prompt` - Generate comprehensive handoff for LLM continuation (default)
  - `/prompt [focus]` - Generate focused handoff for specific areas
  - `/prompt help [topic]` - Interactive help for commands/workflows
- **`/claude-md <action>`** - Essential instruction file maintenance
  - `/claude-md backup|update-mastery` - Backup and skill tracking only

## Command Philosophy

These commands embody our development philosophy:

1. **Quality First**: All commands enforce production-quality standards
2. **Knowledge Preservation**: Built-in learning mechanisms prevent AI dependency
3. **Systematic Approach**: Structured workflows over ad-hoc solutions
4. **Reality Checkpoints**: Continuous validation prevents cascading failures

## Usage Patterns

**Complete Feature Development:**
```bash
/tdd "implement user authentication"   # Full TDD cycle
/check                                 # Quality verification  
/ship "add JWT authentication"         # Update roadmap and commit
```

**Legacy Code Enhancement:**
```bash
/tdd design existing_module           # Retrofit tests
/next "refactor with test safety"     # Structured refactoring
/ship "improve module architecture"   # Document and commit
```

**Context Handoff:**
```bash
/prompt                              # Comprehensive LLM handoff
/prompt debugging                    # Debugging-focused handoff
```

**Maintenance:**
```bash
/claude-md backup                    # Before major changes
```

**Learning:**
```bash
/claude-md update-mastery            # Weekly skill tracking
/prompt help workflow                # Process guidance
```

## Command Design Principles

- **Enforce Standards**: No shortcuts, no compromises
- **Build Knowledge**: Each command teaches while executing
- **Compound Learning**: Commands improve with usage
- **Context Aware**: Adapt to project and codebase patterns

## Adding New Commands

When creating new commands:

1. **Follow the template**: Use existing commands as reference
2. **Include learning elements**: How does this command teach?
3. **Enforce quality**: What standards does this uphold?
4. **Document clearly**: Make usage obvious and examples concrete

## Command Evolution

Commands should evolve based on:
- Patterns that emerge during development
- Successful workflows that should be codified
- Quality issues that need systematic prevention
- Learning gaps that need structured support

Keep commands focused, powerful, and educational.