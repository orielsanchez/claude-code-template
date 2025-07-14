# Claude Code Template

**Professional development setup with Claude Code for systematic, high-quality software development.**

## Summary

A production-ready Claude Code template that transforms your development workflow with TDD-first methodology, automated quality checks, and professional standards. Get from zero to shipping features in under 5 minutes with power commands, git hooks, and multi-language support.

**Value Proposition:** Replace ad-hoc development with systematic workflows that prevent bugs, ensure quality, and accelerate delivery.

**Next Step:** Run the one-line setup below, then start with `/dev "your first feature"` for immediate TDD development.

**Recommended path:** Follow the Quick Start → `/dev` workflow → `/check` → `/ship` cycle for optimal results.

## Quick Start

**Prerequisites:** Install [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

### One-Line Setup

```bash
curl -H 'Cache-Control: no-cache' -sL https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup.sh | bash
```

**Then start coding:**
```bash
claude                                # Start Claude Code
/dev "implement user authentication"  # Your first TDD feature
```

**Success indicators:** When working, you'll see `[OK]` messages and automatic test execution.

## What You Get

### 🎯 **9 Power Commands**
- **`/dev`** - TDD-first development (primary command)
- **`/debug`** - Systematic debugging workflow
- **`/refactor`** - Code improvement with safety nets
- **`/check`** - Quality verification (zero tolerance)
- **`/ship`** - Professional commits
- **`/plan`** - Strategic planning
- **`/help`** - Interactive guidance
- **`/prompt`** - Context handoff
- **`/claude-md`** - Instruction maintenance

### 🛡️ **Quality Automation**
- **Git hooks** prevent Claude attribution and emojis in commits
- **Pre-commit hooks** run quality checks automatically
- **Smart linting** for multiple languages (JS, Python, Rust, Go)
- **Web search validation** ensures current information

### 📋 **Professional Standards**
- **Test-driven development** as the default workflow
- **Zero emoji policy** in code and commits
- **No Claude attribution** in commit messages
- **Systematic debugging** and refactoring processes

## Core Workflow

```bash
/dev "feature name"    # Write tests first, implement with TDD
/check                 # Verify quality (all tests pass, no lint issues)
/ship "description"    # Professional commit with clean history
```

<details>
<summary>### Advanced Workflows</summary>

#### Systematic Debugging
```bash
/debug "issue description"  # Structured debugging process
```

#### Code Quality Improvement
```bash
/refactor "component name"  # Safe refactoring with tests
```

#### Strategic Planning
```bash
/plan "project goals"      # Generate development roadmap
```

</details>

## Configuration

The setup script creates:
- `.claude/hooks/smart-lint.sh` - Quality enforcement hooks
- `.claude/settings.json` - Claude Code settings
- Language-specific tooling configurations

## What is Claude Code?

**Claude Code** is an AI-powered CLI that embeds Claude directly into your terminal for agentic development:

- **Full codebase awareness** - Understands your project without manual context
- **Multi-file coordination** - Makes complex changes across files
- **End-to-end workflows** - From tests to commits, all in natural language
- **Works with any editor** - VS Code, JetBrains, Vim, etc.

### Example

Traditional workflow:
```
1. Read docs → 2. Write code → 3. Debug → 4. Repeat...
```

Agentic workflow:
```bash
/dev "user auth with JWT"  # Claude writes tests, implements, validates
/check                     # Quality gates pass automatically  
/ship "add JWT auth"       # Professional commit ready
```

## Alternative Setup

### GitHub Template
1. Click "Use this template" → Create repository
2. Clone: `git clone https://github.com/yourusername/your-repo.git`
3. Start: `claude` then `/dev "your feature"`

### Existing Project
```bash
# Preserves your existing CLAUDE.md
curl -H 'Cache-Control: no-cache' -sL https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup.sh | bash
```

## Key Features

- **TDD-First**: Tests drive development, not an afterthought
- **Systematic**: Structured workflows for debugging, refactoring, shipping
- **Quality-First**: Automated hooks prevent common issues
- **Learning-Focused**: Build skills while building products
- **Professional**: Clean commits, proper documentation, consistent standards

## Requirements

- **Claude Code CLI** - See [installation guide](https://docs.anthropic.com/en/docs/claude-code)
- **Git repository** (for hooks and professional commits)
- **Python 3** (for web search validation hooks)

Ready to revolutionize your development process? **[Get started now](#quick-start)** ⚡

**New:** Check out the [Commands Reference](COMMANDS_REFERENCE.md) for quick command lookup and workflows!