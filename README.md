# Claude Code Template

**Professional development setup with Claude Code integration for systematic, high-quality software development.**

## Summary

**Quick Start**: Get systematic TDD workflows with Claude Code in 30 seconds. One command sets up quality-first development with 10 power commands, automated testing, and learning protocols.

**Perfect for**: Teams wanting consistent, production-ready AI-assisted development.

**Ready to start?** → [Quick Start](#quick-start) • **New to Claude Code?** → [What is Claude Code?](#what-is-claude-code)

---

## Quick Start

**Prerequisites:** Install Claude Code: `npm install -g @anthropic-ai/claude-code`

### 🚀 One-Line Setup (Recommended - 30 seconds)

```bash
curl -sL https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup.sh | bash
```

**✅ Success**: You'll see "Setup complete!" and can start with `claude` then `/dev "your first feature"`

### Alternative Setup Options

<details>
<summary>📋 Other setup methods (click to expand)</summary>

#### GitHub Template Method

1. **Click "Use this template"** → Create your repository
2. **Clone and start coding:**

```bash
git clone https://github.com/yourusername/your-new-repo.git
cd your-new-repo
claude                                # Start Claude Code
/dev "implement user authentication"  # Your first TDD feature!
```

#### Add to Existing Project

**Preserve your existing CLAUDE.md:**
```bash
# Setup script will detect and preserve your existing CLAUDE.md
curl -sL https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup.sh | bash
claude                 # Start Claude Code in your project
/dev "your first feature"
```

**Replace with template CLAUDE.md:**
```bash
# Manual copy method - overwrites existing CLAUDE.md
curl -sL https://github.com/orielsanchez/claude-code-template/archive/main.tar.gz | tar xz --strip=1 claude-code-template-main/{CLAUDE.md,.claude}
claude                 # Start Claude Code in your project
/dev "your first feature"
```

</details>

---

## What is Claude Code?

**Claude Code** is an AI-powered command-line tool that revolutionizes software development by embedding Claude directly into your terminal. Unlike traditional AI coding assistants that just suggest code, Claude Code is **agentic** - meaning it can:

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

**Learn more:** [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) | [Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## Commands Overview

| Command | Purpose | Example |
|---------|---------|---------|
| **`/dev`** | TDD-first development | `/dev "user login"` |
| **`/debug`** | Systematic debugging | `/debug "login fails"` |
| **`/refactor`** | Code improvement | `/refactor "simplify auth"` |
| **`/plan`** | Strategic roadmap generation | `/plan "improve auth system"` |
| **`/explore`** | Codebase exploration & analysis | `/explore "authentication flow"` |
| **`/check`** | Quality gate | `/check` |
| **`/ship`** | Commit & document | `/ship "add auth"` |
| **`/help`** | Get help & guidance | `/help dev` |
| **`/prompt`** | Context handoff | `/prompt` |
| **`/claude-md`** | Update instructions | `/claude-md backup` |

## Typical Workflow

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

**Need Help?**
```bash
/help                    # Get help overview
/help dev                # Get help on TDD workflow
```

---

## Features & Philosophy

<details>
<summary>📖 Detailed Features (click to expand)</summary>

### Why Use This Template?

**Raw Claude Code** is powerful but unstructured. **This template** provides:

🎯 **Systematic Workflows** - Research → Plan → Test → Implement → Ship  
🛡️ **Quality Enforcement** - Zero tolerance for bad patterns, automatic checks  
📚 **Learning-First Approach** - Build senior-level skills, not just working code  
⚡ **10 Power Commands** - `/dev`, `/debug`, `/refactor`, `/plan`, `/explore`, `/check`, `/ship`, `/help`, `/prompt`, `/claude-md`  
🔧 **Multi-Language Support** - Works with any tech stack  
📖 **Battle-Tested Practices** - Based on real-world AI-assisted development

**Think of it as:** Claude Code + Engineering Discipline = Production-Ready Development

### Core Features

- **Test-Driven Development (TDD)** workflow with AI assistance
- **Quality-first approach** with automated checks and zero-tolerance policies
- **Learning-preservation protocols** to build senior-level skills
- **Systematic development workflow**: Research → Plan → Test → Implement → Ship
- **Complete command library** for streamlined development
- **No-emoji policy** for clean, professional code

### Philosophy

This template embodies a **learning-first, quality-first development approach**:

1. **Test-Driven Development** - Write tests first, let AI satisfy contracts
2. **Systematic Workflow** - Research → Plan → Test → Implement → Ship
3. **Knowledge Preservation** - Build understanding, not just working code
4. **Zero Tolerance Quality** - No shortcuts, no compromises
5. **Continuous Learning** - Track mastery progression and skill development

</details>

---

## Advanced Usage & Configuration

<details>
<summary>🔧 What's Included & Advanced Setup (click to expand)</summary>

### `CLAUDE.md`
Complete instruction file with:
- **Learning-First Development Protocol** - Build skills while building code
- **Test-Driven Development Protocol** - RED → GREEN → REFACTOR with AI
- **Quality standards** - Zero unwrap(), no emojis, production-ready code
- **Universal forbidden patterns** - Comprehensive quality rules for all languages
- **Mastery progression tracking** - Skill development from Novice → Expert

### `.claude/commands/`
Ten powerful commands for systematic development:
- `dev.md` - TDD-first development workflow (primary command)
- `debug.md` - Systematic debugging and root cause analysis
- `refactor.md` - Systematic code refactoring and improvement workflows
- `plan.md` - Strategic roadmap generation and planning
- `explore.md` - Codebase exploration and analysis workflows
- `check.md` - Comprehensive quality verification
- `ship.md` - Roadmap updates and commit workflow
- `help.md` - Interactive help and guidance system
- `prompt.md` - Context handoff for LLM transitions
- `claude-md.md` - Instruction file maintenance

### Configuration
The setup script creates:
- `.claude/hooks/smart-lint.sh` - Quality enforcement hooks
- `.claude/settings.local.json` - Local Claude Code settings
- Language-specific tooling configurations
- Enhanced project detection (when available)

### Project Types Supported

The setup script supports multiple project types:
- **Rust** - `cargo init` with proper project structure
- **Node.js** - `npm init` with appropriate configurations
- **Python** - Virtual environment and project scaffolding
- **Universal** - Works with any language or framework

### Advanced Usage
The **hybrid setup script** works in two modes:
- **`curl | bash` mode**: Downloads commands from GitHub for fresh setups
- **Local mode**: Copies from `.claude/commands/` when running in cloned template
- **Smart detection**: Automatically uses framework detection when available
- **Project customization**: Adapts to your specific tech stack

</details>

---

## Strategic Planning & Complex Workflows

<details>
<summary>🗺️ Strategic Planning & Implementation (click to expand)</summary>

**Strategic Planning & Implementation:**
```bash
/plan "implement user authentication system"  # Generate comprehensive roadmap
/dev "user login"                            # Implement following the plan (TDD)
/check                                       # Ensure quality  
/ship "add user login system"                # Document & commit
```

**Code Exploration & Analysis:**
```bash
/explore "authentication system"  # Understand existing code patterns
/plan "refactor auth module"      # Create improvement roadmap
/refactor "simplify auth logic"   # Systematic refactoring
/check                            # Validate changes
/ship "improve auth architecture" # Commit changes
```

**Feature Enhancement:**
```bash
/explore "existing feature"      # Understand current implementation
/dev "enhance feature"           # TDD approach for improvements
/check                           # Validate changes
/ship "enhance feature"          # Commit changes
```

</details>

---

## Recent Updates

<details>
<summary>📅 Version History (click to expand)</summary>

**v1.8 - Hybrid Setup & Cleanup** *(Latest)*
- **IMPROVED**: Hybrid setup.sh supports both `curl | bash` and local template usage
- **FIXED**: Added missing `explore` command to setup (now 10 commands total)
- **ENHANCED**: Smart framework detection integration for project customization
- **CLEANED**: Removed obsolete `.claude/commands-modular/` and duplicate files
- **OPTIMIZED**: Setup script now copies from local source when available
- **IMPROVED**: Better error handling and user feedback during setup
- **MAINTAINED**: 100% backward compatibility with existing workflows

**v1.7 - Strategic Planning Command**
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

</details>

---

## Support & Contributing

<details>
<summary>🤝 Support This Project (click to expand)</summary>

If this template helps your development workflow, consider supporting its continued development:

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-pink?logo=github)](https://github.com/sponsors/orielsanchez)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/orielsanchez)

**Other ways to support:**
- ⭐ Star this repository
- 🐛 Report issues and suggest improvements
- 📢 Share with your team and community
- 🤝 Contribute improvements and documentation

### Contributing

This template represents battle-tested practices for AI-assisted development. Contributions should:
- Maintain the learning-first philosophy
- Preserve systematic workflow patterns
- Include comprehensive testing
- Follow the established quality standards

</details>

---

## License

This template is designed for professional software development. Use it to build amazing products with Claude Code!

---

**Start building better software with systematic, AI-assisted development.**