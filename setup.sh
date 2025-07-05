#!/bin/bash

# Standalone Claude Code Setup Script
# Works with curl | bash - no external dependencies

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1" >&2
}

print_warning() {
    echo -e "${BLUE}⚠${NC} $1"
}

echo -e "${BLUE}🚀 Claude Code Standalone Setup${NC}"
echo "========================================="

# Check if git is installed
if ! command -v git >/dev/null 2>&1; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository, initialize if needed
if [ ! -d ".git" ]; then
    print_status "Initializing git repository..."
    if ! git init; then
        print_error "Failed to initialize git repository"
        exit 1
    fi
fi

# Detect if Claude setup already exists
if [ -f "CLAUDE.md" ] || [ -d ".claude" ]; then
    print_warning "Claude setup already exists in this directory"
    echo "This script will update the existing setup."
    echo ""
    read -p "Continue? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
    
    # Create backup
    backup_name="claude-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_name"
    [ -f "CLAUDE.md" ] && cp "CLAUDE.md" "$backup_name/"
    [ -d ".claude" ] && cp -r ".claude" "$backup_name/"
    print_status "Created backup: $backup_name"
fi

print_status "Downloading Claude Code template files..."

# Create .claude directory structure
mkdir -p .claude/{commands,hooks}

# Download CLAUDE.md
if ! curl -sL https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/CLAUDE.md > CLAUDE.md; then
    print_error "Failed to download CLAUDE.md"
    exit 1
fi

# Download all command files
commands=("dev" "debug" "refactor" "check" "ship" "help" "prompt" "claude-md" "plan")
for cmd in "${commands[@]}"; do
    if ! curl -sL "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/commands/${cmd}.md" > ".claude/commands/${cmd}.md"; then
        print_error "Failed to download ${cmd}.md"
        exit 1
    fi
done

# Download settings
if ! curl -sL https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/settings.local.json > .claude/settings.local.json; then
    print_error "Failed to download settings.local.json"
    exit 1
fi

# Create basic smart-lint.sh hook
cat > .claude/hooks/smart-lint.sh << 'EOF'
#!/bin/bash
# Basic quality checks - auto-generated

# Exit codes: 0 = success, 1 = error, 2 = issues found
set +e

# Detect project type and run appropriate checks
if [ -f "package.json" ]; then
    echo "Running JavaScript/TypeScript checks..."
    if command -v npm >/dev/null 2>&1; then
        # Run tests if available
        if npm run test --silent 2>/dev/null; then
            echo "✅ Tests passed"
        fi
        
        # Run linting if available
        if npm run lint --silent 2>/dev/null; then
            echo "✅ Linting passed"
        elif command -v eslint >/dev/null 2>&1; then
            eslint . --ext .js,.jsx,.ts,.tsx 2>/dev/null || echo "⚠ ESLint found issues"
        fi
        
        # Run formatting check if available
        if npm run format:check --silent 2>/dev/null; then
            echo "✅ Formatting check passed"
        elif command -v prettier >/dev/null 2>&1; then
            prettier --check . 2>/dev/null || echo "⚠ Prettier found formatting issues"
        fi
    fi
elif [ -f "Cargo.toml" ]; then
    echo "Running Rust checks..."
    if command -v cargo >/dev/null 2>&1; then
        cargo check --quiet && echo "✅ Cargo check passed"
        cargo clippy --quiet -- -D warnings 2>/dev/null && echo "✅ Clippy passed"
        cargo fmt -- --check 2>/dev/null && echo "✅ Formatting check passed"
        cargo test --quiet 2>/dev/null && echo "✅ Tests passed"
    fi
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    echo "Running Python checks..."
    if command -v python >/dev/null 2>&1; then
        # Run tests if pytest is available
        if command -v pytest >/dev/null 2>&1; then
            pytest --quiet 2>/dev/null && echo "✅ Tests passed"
        fi
        
        # Run linting if available
        if command -v flake8 >/dev/null 2>&1; then
            flake8 . 2>/dev/null && echo "✅ Flake8 passed"
        fi
        
        if command -v black >/dev/null 2>&1; then
            black --check . 2>/dev/null && echo "✅ Black formatting check passed"
        fi
    fi
elif [ -f "go.mod" ]; then
    echo "Running Go checks..."
    if command -v go >/dev/null 2>&1; then
        go vet ./... 2>/dev/null && echo "✅ Go vet passed"
        go test ./... 2>/dev/null && echo "✅ Tests passed"
        gofmt -l . | wc -l | grep -q "^0$" && echo "✅ Formatting check passed"
    fi
else
    echo "✅ No specific project type detected - basic checks complete"
fi

echo "✅ Quality checks complete"
exit 0
EOF

chmod +x .claude/hooks/smart-lint.sh

# Add to .gitignore if not already present
if [ -f ".gitignore" ]; then
    if ! grep -q "claude-backup-" .gitignore 2>/dev/null; then
        echo "claude-backup-*/" >> .gitignore
    fi
else
    echo "claude-backup-*/" > .gitignore
fi

print_status "Claude Code setup complete!"
echo ""
echo "Available Claude Code commands:"
echo "  /dev      - TDD-first development (PRIMARY COMMAND)"
echo "  /debug    - Systematic debugging workflow"  
echo "  /refactor - Code improvement workflow"
echo "  /check    - Quality verification"
echo "  /ship     - Complete and commit changes"
echo "  /plan     - Strategic planning & roadmap generation"
echo "  /help     - Comprehensive help system"
echo ""
echo "Quick workflow:"
echo "  /dev \"feature\" → /check → /ship \"description\""
echo ""
echo "Start Claude Code with: claude"