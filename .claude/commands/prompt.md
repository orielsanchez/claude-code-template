---
allowed-tools: all
description: Context handoff prompts and interactive help system
---

# Context & Help System

Context handoff for LLM transitions and interactive help for commands/workflows.

**Usage:**
- `/prompt` - Generate comprehensive handoff prompt (default)
- `/prompt [focus_area]` - Generate focused handoff prompt  
- `/prompt help [command|topic]` - Get help on commands/workflows

**Examples:**
- `/prompt` - Complete context handoff for LLM continuation
- `/prompt debugging` - Generate debugging-focused context handoff
- `/prompt help tdd` - Get detailed help on TDD workflow
- `/prompt help workflow` - Show development workflow guidance

## Context Handoff (Default: `/prompt`)

**When called without arguments, generates a comprehensive handoff prompt for seamless LLM continuation.**

**Comprehensive handoff includes:**
- Current working directory and git repository status
- Recent git commits and active changes (staged/unstaged)
- Current project structure and key files
- Active todos and project state
- Recent development progress and next logical steps
- Key constraints and patterns from CLAUDE.md
- Available commands and workflow guidance

**Focused handoff (`/prompt [focus_area]`) includes:**
- All above context PLUS targeted focus on specific area
- Focus areas: debugging, architecture, testing, performance, refactoring
- Specialized context relevant to the focus area
- Specific next steps for that domain

**Optimized for context efficiency:**
- Essential state information without full file dumps
- Forward momentum focus rather than comprehensive history
- Ready to paste into fresh LLM session
- Includes enough context for informed continuation

## Help System (`/prompt help [topic]`)

### **Available Help Topics:**

**Commands:**
- `tdd` - Test-driven development workflow and actions
- `check` - Quality verification and validation
- `next` - Feature implementation process
- `claude-md` - Instruction file maintenance

**Workflows:**
- `workflow` - Complete development process
- `learning` - Knowledge preservation and skill building
- `quality` - Code quality and validation standards

**Quick Reference:**
- `commands` - List all available commands
- `examples` - Common usage patterns and examples

### **Command Quick Reference:**
- **`/check`** - Comprehensive quality verification
- **`/next <task>`** - Structured feature implementation  
- **`/tdd <feature|action>`** - TDD workflow and test management
- **`/claude-md [action]`** - Maintain instruction file
- **`/prompt [focus|help]`** - Context handoff or help

**Most common usage:**
- `/prompt` - Generate handoff when context window is getting full
- `/prompt help workflow` - Get complete development process guidance

The default `/prompt` command is designed for seamless LLM handoffs when you need to continue work in a fresh session.