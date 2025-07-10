# Claude Code Quality Hooks

**Automated quality enforcement for professional development**

## Overview

The `.claude/hooks/` directory contains quality enforcement automation that maintains professional coding standards across all projects. These hooks integrate with git and Claude Code to ensure consistent, high-quality output.

## Available Hooks

### **`smart-lint.sh`** - Multi-Language Quality Checker
**Purpose**: Automated quality checks that run during development and git operations

**Supported Languages & Tools**:
- **JavaScript/TypeScript**: ESLint, Prettier, npm test
- **Python**: flake8, black, pytest  
- **Rust**: cargo check, clippy, rustfmt, cargo test
- **Go**: go vet, go test, gofmt
- **Swift**: SwiftLint, SwiftFormat (when available)
- **Universal**: Basic syntax and format checking

**Features**:
- 🔍 **Auto-detection**: Identifies project type from config files
- ⚡ **Performance optimized**: Runs only relevant checks
- 📊 **Clear reporting**: Detailed output with status indicators
- 🛡️ **Zero tolerance**: Blocks commits with quality issues
- 🔄 **Incremental**: Focuses on changed files when possible

### **Git Integration Hooks**

The setup script automatically installs:

#### **`commit-msg`** - Professional Commit Standards
- ❌ **Blocks Claude attribution** in commit messages
- ❌ **Prevents emojis** in commit messages  
- ✅ **Enforces professional standards** automatically

**Forbidden Patterns**:
```bash
# These will be blocked:
"Generated with Claude Code"
"Co-Authored-By: Claude"
"🎉 Add new feature"  # No emojis
```

## How Hooks Work

### **During Development**
```bash
# Manual quality check
./.claude/hooks/smart-lint.sh

# Automatic check on commit
git commit -m "add user authentication"
# → Runs commit-msg hook
# → Blocks if issues found
```

### **Integration with Commands**
```bash
/check                    # Calls smart-lint.sh
/ship "add feature"       # Runs all quality checks before commit
```

## Hook Configuration

### **Language-Specific Setup**

The smart-lint.sh hook automatically configures for detected languages:

**JavaScript/Node.js**:
```bash
# Looks for: package.json
# Runs: npm test, eslint, prettier
# Config: Uses project's .eslintrc, .prettierrc
```

**Python**:
```bash
# Looks for: requirements.txt, pyproject.toml, setup.py
# Runs: pytest, flake8, black
# Config: Uses project's setup.cfg, pyproject.toml
```

**Rust**:
```bash
# Looks for: Cargo.toml
# Runs: cargo check, clippy, test, fmt
# Config: Uses Cargo.toml settings
```

**Go**:
```bash
# Looks for: go.mod
# Runs: go vet, go test, gofmt check
# Config: Uses go.mod configuration
```

### **Custom Configuration**

For project-specific hook behavior, create:

**`.claude-hooks-config.sh`**:
```bash
# Override default behavior
SKIP_TESTS=false
LINT_STRICT=true
FORMAT_CHECK=true

# Custom commands
CUSTOM_LINT_CMD="your-custom-linter"
CUSTOM_TEST_CMD="your-test-runner"
```

## Quality Standards Enforced

### **Universal Standards**:
- ✅ **No emojis** in code, comments, or commits
- ✅ **No Claude attribution** in commit messages
- ✅ **Proper error handling** for each language
- ✅ **Consistent formatting** following language conventions
- ✅ **Clean commit history** with professional messages

### **Language-Specific Standards**:
- **JavaScript**: ESLint rules, Prettier formatting
- **Python**: PEP 8 compliance, type hints encouraged
- **Rust**: Clippy lints, rustfmt formatting, no unwrap()
- **Go**: Go vet checks, gofmt formatting
- **Swift**: SwiftLint rules, SwiftFormat style

## Hook Development

### **Adding New Language Support**

1. **Detection Logic** in `smart-lint.sh`:
```bash
elif [ -f "package.swift" ]; then
    echo "📦 Detected Swift Package Manager project"
    # Add Swift-specific checks
```

2. **Quality Checks**:
```bash
if command -v swiftlint >/dev/null 2>&1; then
    swiftlint --strict && echo "✅ SwiftLint passed"
fi
```

3. **Integration Testing**:
- Test with real projects of that language
- Verify error reporting is clear
- Ensure performance is acceptable

### **Hook Performance**

**Optimization Strategies**:
- ⚡ **Incremental checks**: Focus on changed files
- 🎯 **Smart detection**: Run only relevant tools
- 🔄 **Parallel execution**: Run independent checks concurrently
- 📊 **Clear reporting**: Fast feedback with detailed results

### **Troubleshooting Hooks**

**Common Issues**:

1. **Hook not executing**:
```bash
# Check permissions
chmod +x .claude/hooks/smart-lint.sh

# Check git hooks installation
ls -la .git/hooks/commit-msg
```

2. **False positives**:
```bash
# Temporarily disable for debugging
export CLAUDE_HOOKS_DISABLED=true
git commit -m "test commit"
```

3. **Performance issues**:
```bash
# Enable timing information
export CLAUDE_HOOKS_TIMING=true
./.claude/hooks/smart-lint.sh
```

## Integration with `lib/` Infrastructure

The hooks system integrates with:
- **`lib/hook-utils.sh`**: Shared utilities and patterns
- **`lib/linters/`**: Language-specific linting modules
- **`lib/detectors/`**: Project type detection
- **Framework detection**: Automatic tool configuration

This creates a comprehensive quality automation system that adapts to your project and enforces professional standards automatically.

## Best Practices

1. **Run hooks locally** before committing
2. **Keep tools updated** (ESLint, Prettier, etc.)
3. **Configure project-specific rules** in standard config files
4. **Test hook behavior** in your development environment
5. **Use `/check` command** for comprehensive validation

The hooks system ensures that all code committed through Claude Code meets professional standards automatically.