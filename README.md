# Claude Code Template

**Professional development setup with Claude Code integration for systematic, high-quality software development.**

## Features

- **Test-Driven Development (TDD)** workflow with AI assistance
- **Quality-first approach** with automated checks and zero-tolerance policies
- **Learning-preservation protocols** to build senior-level skills
- **Systematic development workflow**: Research → Plan → Test → Implement → Ship
- **Complete command library** for streamlined development
- **No-emoji policy** for clean, professional code

## Quick Start

### Option 1: Use as GitHub Template

1. Click **"Use this template"** button above
2. Create your new repository
3. Clone and start developing:

```bash
git clone https://github.com/yourusername/your-new-repo.git
cd your-new-repo

# Start development with TDD
/tdd "implement user authentication"
/check  # Quality verification
/ship "add user authentication system"
```

### Option 2: Copy to Existing Project

```bash
# Download the template files
curl -L https://github.com/orielsanchez/claude-code-template/archive/main.tar.gz | tar xz
cp -r claude-code-template-main/{CLAUDE.md,.claude} your-project/
cd your-project

# Begin development
/tdd "your first feature"
```

### Option 3: Automated Setup Script

```bash
# Download and run the interactive setup script
curl -o setup-claude-project.sh https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/setup-claude-project.sh
chmod +x setup-claude-project.sh
./setup-claude-project.sh
```

## Available Commands

### Core Development
- **`/check`** - Quality verification with zero tolerance for issues
- **`/next <task>`** - Structured feature implementation with TDD integration
- **`/tdd <feature|action>`** - Complete TDD workflow and test management
- **`/ship [message]`** - Update roadmap, validate quality, and commit changes

### System & Help
- **`/prompt`** - Generate LLM handoff for context transitions (default)
- **`/prompt help [topic]`** - Interactive help for commands and workflows
- **`/claude-md <action>`** - Essential instruction file maintenance

## Development Workflow

### Standard Feature Development
```bash
/tdd "implement user login"     # Full TDD cycle: RED → GREEN → REFACTOR
/check                          # Quality verification
/ship "add user login feature"  # Update docs and commit
```

### Legacy Code Enhancement
```bash
/tdd design existing_module     # Retrofit tests for existing code
/next "refactor with safety"    # Structured refactoring
/ship "improve architecture"    # Document and commit
```

### Context Management
```bash
/prompt                         # Generate handoff when context gets full
/prompt help workflow           # Get development process guidance
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