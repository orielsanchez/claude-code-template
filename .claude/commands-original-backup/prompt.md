---
allowed-tools: all
description: Context handoff prompts for seamless LLM transitions
---

# Context Handoff System

Generate comprehensive handoff prompts for seamless LLM transitions and continuity.

**Usage:**
- `/prompt` - Generate comprehensive handoff prompt (default)
- `/prompt [focus_area]` - Generate focused handoff prompt for specific domain

**Examples:**
- `/prompt` - Complete context handoff for LLM continuation
- `/prompt debugging` - Generate debugging-focused context handoff
- `/prompt architecture` - Generate architecture-focused context handoff
- `/prompt testing` - Generate testing-focused context handoff

**For help and guidance, use `/help` instead.**

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

## When to Use Context Handoff

**Primary use case**: When your current LLM session is approaching context limits or you need to transition to a fresh session while preserving project understanding.

**Ideal scenarios:**
- Long development sessions with accumulated context
- Switching between different LLM providers or models
- Taking breaks and resuming work later
- Onboarding new team members to current project state
- Creating checkpoints during complex development tasks

**The generated handoff includes everything needed for seamless continuation without losing development momentum or project understanding.**