# Claude Code Template

**Professional development setup with Claude Code integration for systematic, high-quality software development.**

## Quick Start

**Prerequisites:** Install Claude Code: `npm install -g @anthropic-ai/claude-code`

### 🚀 One-Line Setup (Recommended)

```bash
curl -sL https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup.sh | bash
```

### Option 1: Use as GitHub Template

1. **Click "Use this template"** → Create your repository
2. **Clone and start coding:**

```bash
git clone https://github.com/yourusername/your-new-repo.git
cd your-new-repo
claude                                # Start Claude Code
/dev "implement user authentication"  # Your first TDD feature!
```

### Option 2: Add to Existing Project

```bash
# Quick copy to existing project
curl -sL https://github.com/orielsanchez/claude-code-template/archive/main.tar.gz | tar xz --strip=1 claude-code-template-main/{CLAUDE.md,.claude}
claude                 # Start Claude Code in your project
/dev "your first feature"
```

### Option 3: Manual Setup

```bash
# Download and run setup
curl -O https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup.sh
chmod +x setup.sh
./setup.sh                          # Add to current directory
```

---

## What's This?

A complete development environment template that enforces **Test-Driven Development**, **quality-first coding**, and **systematic workflows** when working with Claude Code. Includes 9 powerful commands, automated quality checks, strategic planning capabilities, and learning protocols to build senior-level development skills.

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
/dev "user authentication with JWT tokens"
# Claude writes tests first, implements code, runs tests, fixes issues
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
⚡ **9 Power Commands** - `/dev`, `/debug`, `/refactor`, `/plan`, `/check`, `/ship`, `/help`, `/prompt`, `/claude-md`  
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
| **`/dev`** | TDD-first development | `/dev "user login"` |
| **`/debug`** | Systematic debugging | `/debug "login fails"` |
| **`/refactor`** | Code improvement | `/refactor "simplify auth"` |
| **`/plan`** | Strategic roadmap generation | `/plan "improve auth system"` |
| **`/check`** | Quality gate | `/check` |
| **`/ship`** | Commit & document | `/ship "add auth"` |
| **`/help`** | Get help & guidance | `/help dev` |
| **`/prompt`** | Context handoff | `/prompt` |
| **`/claude-md`** | Update instructions | `/claude-md refresh` |

## Typical Workflow

**Strategic Planning & Implementation:**
```bash
/plan "implement user authentication system"  # Generate comprehensive roadmap
/dev "user login"                            # Implement following the plan (TDD)
/check                                       # Ensure quality  
/ship "add user login system"                # Document & commit
```

**New Feature (TDD-first):**
```bash
/dev "user login"        # Write tests first, then implement
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
/dev "improve login"     # TDD approach for enhancements
/check                   # Validate changes
/ship "enhance login"    # Commit changes
```

**Need Help?**
```bash
/help                    # Get help overview
/help dev                # Get help on TDD workflow
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
- `dev.md` - TDD-first development workflow (primary command)
- `debug.md` - Systematic debugging and root cause analysis
- `refactor.md` - Systematic code refactoring and improvement workflows
- `check.md` - Comprehensive quality verification
- `ship.md` - Roadmap updates and commit workflow
- `help.md` - Interactive help and guidance system
- `prompt.md` - Context handoff for LLM transitions
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

### Advanced Usage
The setup script automatically handles project initialization and can be run multiple times to update your Claude setup.

## Support This Project

If this template helps your development workflow, consider supporting its continued development:

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-pink?logo=github)](https://github.com/sponsors/orielsanchez)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/orielsanchez)

**Other ways to support:**
- ⭐ Star this repository
- 🐛 Report issues and suggest improvements
- 📢 Share with your team and community
- 🤝 Contribute improvements and documentation

## Recent Updates

**v1.7 - Strategic Planning Command** *(Latest)*
- **NEW**: `/plan` command for comprehensive roadmap generation
- Generate phase-based roadmaps for any project or improvement initiative  
- 5-phase methodology: Discovery → Design → Planning → Implementation → Resources
- Enhanced phase generator supporting rich planning structures (key actions, deliverables)
- LLM-followable roadmaps with clear dependencies and success criteria
- Integration with existing command ecosystem (/dev, /refactor, /check workflows)
- Planning-specific templates for methodology and execution guidance
- Backward compatible with all existing functionality (73/73 tests passing)

**v1.6 - Command Documentation Modularization**
- **COMPLETED**: Full command documentation modularization system implementation
- Created comprehensive lib/command-utils/ architecture with modular templates and generators
- **ALL 7 commands** successfully migrated to modular structure
- Achieved significant size reductions while maintaining full functionality
- **107 comprehensive tests** passing - complete TDD workflow implementation
- Eliminated ~300-400 lines of duplication across command files
- Established consistent, maintainable modular structure for all workflow commands
- **Zero breaking changes** - maintains 100% command functionality and user experience
- Enhanced system extensibility and maintainability for future development

**Key Technical Achievements:**
- Modular template system with variable substitution
- Comprehensive test coverage ensuring reliability
- Systematic TDD approach: RED → GREEN → REFACTOR phases completed
- Clean architecture supporting easy command modifications and additions

**v1.4 - Hook System Modularization**
- Refactored smart-lint.sh from 587 to 328 lines (44% reduction)
- Created modular architecture with lib/hook-utils.sh (185 lines shared utilities)
- Added 5 language-specific modules in lib/linters/ (Go, Python, JS/TS, Rust, Nix)
- Eliminated ~250 lines of duplicated code patterns across languages
- Maintained 100% backward compatibility and existing configuration
- Followed TDD-first approach with comprehensive testing
- Enables easy addition of new programming languages

**v1.3 - Setup Script Consolidation**
- Eliminated 145 lines of duplicated code between setup scripts
- Created robust lib/setup-utils.sh with 8 shared functions
- Reduced setup-simple.sh by 13% and setup-claude-project.sh by 26%
- Enhanced maintainability with centralized utility functions
- Zero breaking changes, 100% backward compatibility maintained

**v1.2 - Modular Framework Detection**
- Refactored framework detection into specialized language detectors
- Improved maintainability with single responsibility principle
- Enhanced extensibility for adding new languages/frameworks
- 62% reduction in main detection file complexity
- Zero breaking changes, 100% test coverage preserved

**v1.1 - Simplified Setup**
- New `setup-simple.sh` script with streamlined 3-scenario workflow
- Maintains full framework auto-detection capabilities
- Backup system for existing Claude setups
- Comprehensive TDD test coverage (17 new tests)
- Cleaner user experience with better error handling

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