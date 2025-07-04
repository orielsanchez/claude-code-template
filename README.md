# Claude Code Template

**Professional development setup with Claude Code integration for systematic, high-quality software development.**

## What's This?

A complete development environment template that enforces **Test-Driven Development**, **quality-first coding**, and **systematic workflows** when working with Claude Code. Includes 6 powerful commands, automated quality checks, and learning protocols to build senior-level development skills.

**Perfect for:** Teams wanting consistent, high-quality AI-assisted development.

## Features

- **Test-Driven Development (TDD)** workflow with AI assistance
- **Quality-first approach** with automated checks and zero-tolerance policies
- **Learning-preservation protocols** to build senior-level skills
- **Systematic development workflow**: Research → Plan → Test → Implement → Ship
- **Complete command library** for streamlined development
- **No-emoji policy** for clean, professional code

## Quick Start

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
/tdd "implement user authentication"  # Start with TDD!
```

### Option 2: Add to Existing Project

```bash
# Quick copy to existing project
curl -sL https://github.com/orielsanchez/claude-code-template/archive/main.tar.gz | tar xz --strip=1 claude-code-template-main/{CLAUDE.md,.claude}
/tdd "your first feature"
```

### Option 3: Manual Setup

```bash
# Download and run interactive setup
curl -O https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup-claude-project.sh
chmod +x setup-claude-project.sh
./setup-claude-project.sh
```

## Commands Overview

| Command | Purpose | Example |
|---------|---------|---------|
| **`/tdd`** | Start with tests | `/tdd "user login"` |
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

**Fix/Refactor:**
```bash
/next "fix login bug"    # Structured approach
/check                   # Validate changes
/ship "fix login issue"  # Commit changes
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
Six powerful commands for systematic development:
- `check.md` - Comprehensive quality verification
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