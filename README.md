# Claude Code Template

**Professional development setup with Claude Code integration for systematic, high-quality software development.**

## Quick Start

**Prerequisites:** Install Claude Code: `npm install -g @anthropic-ai/claude-code`

### 🚀 One-Line Setup (Recommended)

```bash
curl -sL https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup-claude-project.sh | bash
```

### Option 1: Use as GitHub Template

1. **Click "Use this template"** → Create your repository
2. **Clone and start coding:**

```bash
git clone https://github.com/yourusername/your-new-repo.git
cd your-new-repo
claude                                # Start Claude Code
/tdd "implement user authentication"  # Your first TDD feature!
```

### Option 2: Add to Existing Project

```bash
# Quick copy to existing project
curl -sL https://github.com/orielsanchez/claude-code-template/archive/main.tar.gz | tar xz --strip=1 claude-code-template-main/{CLAUDE.md,.claude}
claude                 # Start Claude Code in your project
/tdd "your first feature"
```

### Option 3: Manual Setup

```bash
# Download and run interactive setup
curl -O https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup-claude-project.sh
chmod +x setup-claude-project.sh
./setup-claude-project.sh
```

---

## What's This?

A complete development environment template that enforces **Test-Driven Development**, **quality-first coding**, and **systematic workflows** when working with Claude Code. Includes 6 powerful commands, automated quality checks, and learning protocols to build senior-level development skills.

**Perfect for:** Teams wanting consistent, high-quality AI-assisted development.

## New to Claude Code? Start Here!

### What is Claude Code?

**Claude Code** is an AI-powered command-line tool that revolutionizes software development by embedding Claude Opus 4 directly into your terminal. Unlike traditional AI coding assistants that just suggest code, Claude Code is **agentic** - meaning it can:

- **Understand your entire codebase** without manual context selection
- **Make coordinated changes** across multiple files
- **Execute real actions** like running tests, creating commits, and fixing bugs
- **Work directly in your terminal** with VS Code, JetBrains, and other IDEs

### Why Agentic AI Development?

Traditional AI tools require you to copy/paste code and explain context repeatedly. **Agentic AI development** means:

✅ **Full codebase awareness** - Claude understands your project structure, patterns, and dependencies  
✅ **Multi-file coordination** - Make complex changes across multiple files seamlessly  
✅ **End-to-end workflows** - From writing tests to committing code, all in natural language  
✅ **Learning preservation** - Build your skills while building your product

### Quick Example

Instead of this traditional workflow:
```
1. Read documentation 
2. Write code manually
3. Copy/paste to AI for review
4. Manually fix issues
5. Repeat...
```

You get this agentic workflow:
```bash
/tdd "user authentication with JWT tokens"
# Claude writes tests, implements code, runs tests, fixes issues
/check  # Validates quality automatically
/ship "add JWT authentication system"  # Creates commit with docs
```

### Getting Started with Claude Code

**First time?** Install Claude Code:
```bash
npm install -g @anthropic-ai/claude-code
claude  # Start the interactive session
```

**Then use this template** (instructions below) to get systematic workflows and quality enforcement.

**Learn more:** [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) | [Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Why Use This Template?

**Raw Claude Code** is powerful but unstructured. **This template** provides:

🎯 **Systematic Workflows** - Research → Plan → Test → Implement → Ship  
🛡️ **Quality Enforcement** - Zero tolerance for bad patterns, automatic checks  
📚 **Learning-First Approach** - Build senior-level skills, not just working code  
⚡ **6 Power Commands** - `/tdd`, `/check`, `/ship`, `/next`, `/prompt`, `/claude-md`  
🔧 **Multi-Language Support** - Works with any tech stack  
📖 **Battle-Tested Practices** - Based on real-world AI-assisted development

**Think of it as:** Claude Code + Engineering Discipline = Production-Ready Development

## Features

- **Test-Driven Development (TDD)** workflow with AI assistance
- **Quality-first approach** with automated checks and zero-tolerance policies
- **Learning-preservation protocols** to build senior-level skills
- **Systematic development workflow**: Research → Plan → Test → Implement → Ship
- **Complete command library** for streamlined development
- **No-emoji policy** for clean, professional code

## Commands Overview

| Command | Purpose | Example |
|---------|---------|---------|
| **`/tdd`** | Start with tests | `/tdd "user login"` |
| **`/debug`** | Systematic debugging | `/debug "login fails"` |
| **`/refactor`** | Code improvement | `/refactor "simplify auth"` |
| **`/check`** | Quality gate | `/check` |
| **`/ship`** | Commit & document | `/ship "add auth"` |
| **`/next`** | Structured implementation | `/next "fix bug"` |
| **`/prompt`** | Context handoff | `/prompt` |
| **`/claude-md`** | Update instructions | `/claude-md refresh` |

## Typical Workflow

**New Feature (TDD-first):**
```bash
/tdd "user login"        # Write tests first
/check                   # Ensure quality  
/ship "add user login"   # Document & commit
```

**Bug Investigation & Fix:**
```bash
/debug "login fails"     # Systematic debugging
/check                   # Validate changes
/ship "fix login issue"  # Commit changes
```

**Code Improvement:**
```bash
/refactor "simplify login logic"  # Systematic refactoring
/check                            # Validate changes
/ship "improve code quality"      # Commit changes
```

**Feature Enhancement:**
```bash
/next "improve login"    # Structured approach
/check                   # Validate changes
/ship "enhance login"    # Commit changes
```

**Need Help?**
```bash
/prompt help             # Get guidance
/claude-md refresh       # Update instructions
```

## What's Included

### `CLAUDE.md`
Complete instruction file with:
- **Learning-First Development Protocol** - Build skills while building code
- **Test-Driven Development Protocol** - RED → GREEN → REFACTOR with AI
- **Quality standards** - Zero unwrap(), no emojis, production-ready code
- **Rust-specific rules** - Comprehensive forbidden patterns and best practices
- **Mastery progression tracking** - Skill development from Novice → Expert

### `.claude/commands/`
Eight powerful commands for systematic development:
- `check.md` - Comprehensive quality verification
- `debug.md` - Systematic debugging and root cause analysis
- `refactor.md` - Systematic code refactoring and improvement workflows
- `next.md` - Structured implementation workflow
- `tdd.md` - Complete TDD and test management
- `ship.md` - Roadmap updates and commit workflow
- `prompt.md` - Context handoff and help system
- `claude-md.md` - Instruction file maintenance

### Configuration
- `.claude/hooks/` - Quality enforcement hooks
- `.claude/settings.local.json` - Local Claude Code settings

## Philosophy

This template embodies a **learning-first, quality-first development approach**:

1. **Test-Driven Development** - Write tests first, let AI satisfy contracts
2. **Systematic Workflow** - Research → Plan → Test → Implement → Ship
3. **Knowledge Preservation** - Build understanding, not just working code
4. **Zero Tolerance Quality** - No shortcuts, no compromises
5. **Continuous Learning** - Track mastery progression and skill development

## Project Types Supported

The setup script supports multiple project types:
- **Rust** - `cargo init` with proper project structure
- **Node.js** - `npm init` with appropriate configurations
- **Python** - Virtual environment and project scaffolding
- **Universal** - Works with any language or framework

## Advanced Setup

### Global Git Template
Configure automatic Claude setup for all new repositories:
```bash
./setup-claude-project.sh
# Choose option 3: Configure global git template
```

### Shell Function
Add project creation function to your shell:
```bash
./setup-claude-project.sh
# Choose option 4: Install shell function
# Then use: new-claude-project my-awesome-app
```

## Support This Project

If this template helps your development workflow, consider supporting its continued development:

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-pink?logo=github)](https://github.com/sponsors/orielsanchez)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/orielsanchez)

**Other ways to support:**
- ⭐ Star this repository
- 🐛 Report issues and suggest improvements
- 📢 Share with your team and community
- 🤝 Contribute improvements and documentation

## Contributing

This template represents battle-tested practices for AI-assisted development. Contributions should:
- Maintain the learning-first philosophy
- Preserve systematic workflow patterns
- Include comprehensive testing
- Follow the established quality standards

## License

This template is designed for professional software development. Use it to build amazing products with Claude Code!

---

**Start building better software with systematic, AI-assisted development.**