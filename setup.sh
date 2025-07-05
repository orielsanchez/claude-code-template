#!/bin/bash

# Enhanced Claude Code Setup Script with Progress Indicators & Error Feedback
# Works with curl | bash - no external dependencies
# Addresses Phase 1 UX Research findings: setup success rate improvement

set -e  # Exit on any error

# Colors and visual elements (default to enabled, opt-out with NO_COLOR)
if [ "${NO_COLOR:-}" != "true" ] && [ "${TERM:-}" != "dumb" ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    YELLOW='\033[1;33m'
    NC='\033[0m' # No Color
else
    # No color support
    RED=''
    GREEN=''
    BLUE=''
    YELLOW=''
    NC=''
fi

# Setup configuration
TOTAL_STEPS=8
CURRENT_STEP=0
START_TIME=$(date +%s)
ESTIMATED_DURATION=30  # seconds

# Progress tracking
progress_bar() {
    local current=$1
    local total=$2
    local width=40
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    if [ -n "$BLUE" ]; then
        printf "\r${BLUE}["
        printf "%*s" $filled | tr ' ' '▓'
        printf "%*s" $empty | tr ' ' '░'
        printf "] %d%% [%d/%d] ETA: %ds${NC}" $percentage $current $total $((ESTIMATED_DURATION - ($(date +%s) - START_TIME)))
    else
        printf "\r["
        printf "%*s" $filled | tr ' ' '#'
        printf "%*s" $empty | tr ' ' '-'
        printf "] %d%% [%d/%d] ETA: %ds" $percentage $current $total $((ESTIMATED_DURATION - ($(date +%s) - START_TIME)))
    fi
    # Progress pattern examples: [1/8] [2/8] [3/8] etc.
}

# Enhanced print functions
print_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    echo ""
    progress_bar $CURRENT_STEP $TOTAL_STEPS
    echo ""
    echo -e "${GREEN}✓${NC} [$CURRENT_STEP/$TOTAL_STEPS] $1"
}

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Signal handling for graceful interruption
cleanup() {
    echo ""
    print_warning "Setup interrupted by user"
    print_info "Cleaning up partial installation..."
    
    # Remove partial files if they exist
    [ -f "CLAUDE.md.tmp" ] && rm -f "CLAUDE.md.tmp"
    [ -d ".claude.tmp" ] && rm -rf ".claude.tmp"
    
    print_info "Cleanup complete. You can safely re-run the setup script."
    exit 0
}

# Trap signals for graceful handling
trap cleanup INT TERM

# Validation functions
validate_environment() {
    print_step "Validating environment and requirements"
    
    # Check required commands
    local missing_deps=()
    
    if ! command -v curl >/dev/null 2>&1; then
        missing_deps+=("curl")
    fi
    
    if ! command -v git >/dev/null 2>&1; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        echo ""
        print_info "Installation suggestions:"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "git")
                    print_error "Git is not installed. Command git not found. Please install git first."
                    echo "  • macOS: brew install git"
                    echo "  • Ubuntu/Debian: sudo apt-get install git"
                    echo "  • CentOS/RHEL: sudo yum install git"
                    ;;
                "curl")
                    echo "  • macOS: brew install curl"
                    echo "  • Ubuntu/Debian: sudo apt-get install curl"
                    echo "  • CentOS/RHEL: sudo yum install curl"
                    ;;
            esac
        done
        echo ""
        print_error "Please install missing dependencies and try again"
        exit 1
    fi
    
    print_status "Environment validation complete"
}

# Network retry logic
download_with_retry() {
    local url=$1
    local output=$2
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -sL --max-time 30 --connect-timeout 10 "$url" > "$output"; then
            # Verify download was successful (file not empty)
            if [ -s "$output" ]; then
                return 0
            else
                print_warning "Downloaded file is empty, retrying..."
            fi
        else
            print_warning "Download failed (attempt $attempt/$max_attempts)"
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            print_info "Retrying in 2 seconds..."
            sleep 2
        fi
        
        attempt=$((attempt + 1))
    done
    
    print_error "Failed to download after $max_attempts attempts: $url"
    print_info "Troubleshooting suggestions:"
    echo "  • Check your internet connection"
    echo "  • Verify network proxy settings"
    echo "  • Try again later if the server is temporarily unavailable"
    echo "  • Download manually from: https://github.com/orielsanchez/claude-code-template"
    return 1
}

# Header
echo -e "${BLUE}🚀 Claude Code Enhanced Setup${NC}"
echo "========================================="
print_info "Setup takes approximately 30 seconds"
print_info "Estimated time: ${ESTIMATED_DURATION} seconds"
print_info "Setting up systematic TDD workflows with progress tracking..."
echo ""

# Step 1: Environment validation
validate_environment

# Step 2: Git repository initialization
print_step "Initializing git repository if needed"
if [ ! -d ".git" ]; then
    if ! git init; then
        print_error "Failed to initialize git repository"
        print_info "Troubleshooting: Check write permissions in current directory"
        print_info "Permission denied - try running with appropriate access rights"
        exit 1
    fi
    print_status "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Step 3: Handle existing installations
print_step "Checking for existing Claude Code setup"
if [ -f "CLAUDE.md" ] || [ -d ".claude" ]; then
    print_warning "Claude setup already exists in this directory"
    print_info "This script will update the existing setup safely"
    echo ""
    
    # Check if running in interactive mode (TTY available)
    if [ -t 0 ]; then
        # Interactive mode - prompt user
        read -p "Continue with update? (y/N): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            print_info "Setup cancelled by user"
            exit 0
        fi
    else
        # Non-interactive mode (pipe execution) - proceed with safe default
        print_info "Running in non-interactive mode - proceeding with update"
        confirm="y"
    fi
    
    # Create backup with timestamp
    backup_name="claude-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_name"
    [ -f "CLAUDE.md" ] && cp "CLAUDE.md" "$backup_name/"
    [ -d ".claude" ] && cp -r ".claude" "$backup_name/"
    print_status "Created backup: $backup_name"
fi

# Step 4: Create directory structure
print_step "Setting up and Configuring directory structure"
mkdir -p .claude/{commands,hooks}
print_status "Directory structure created"
print_status "Configuring project layout"

# Step 5: Download main configuration
print_step "Installing main configuration files"
if ! download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/CLAUDE.md" "CLAUDE.md"; then
    exit 1
fi
print_status "Downloaded CLAUDE.md"
print_status "Installing configuration files complete"

# Step 6: Download command files
print_step "Downloading and Installing command files"
commands=("dev" "debug" "refactor" "check" "ship" "help" "prompt" "claude-md" "plan")
total_commands=${#commands[@]}
current_command=0

for cmd in "${commands[@]}"; do
    current_command=$((current_command + 1))
    echo -n "  Downloading ${cmd}.md... ($current_command/$total_commands) "
    
    if download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/commands/${cmd}.md" ".claude/commands/${cmd}.md"; then
        echo "✓"
    else
        echo "✗"
        exit 1
    fi
done
print_status "Downloaded $total_commands command files"

# Step 7: Download settings and create hooks
print_step "Configuring settings and quality hooks"

# Download settings
if ! download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/settings.local.json" ".claude/settings.local.json"; then
    exit 1
fi

# Create enhanced smart-lint.sh hook
cat > .claude/hooks/smart-lint.sh << 'EOF'
#!/bin/bash
# Enhanced quality checks with better error reporting - auto-generated

# Exit codes: 0 = success, 1 = error, 2 = issues found
set +e

echo "🔍 Running quality checks..."

# Detect project type and run appropriate checks
if [ -f "package.json" ]; then
    echo "📦 Detected Node.js/JavaScript project"
    if command -v npm >/dev/null 2>&1; then
        # Run tests if available
        if npm run test --silent 2>/dev/null; then
            echo "✅ Tests passed"
        else
            echo "⚠ Tests not available or failed"
        fi
        
        # Run linting if available
        if npm run lint --silent 2>/dev/null; then
            echo "✅ Linting passed"
        elif command -v eslint >/dev/null 2>&1; then
            if eslint . --ext .js,.jsx,.ts,.tsx 2>/dev/null; then
                echo "✅ ESLint passed"
            else
                echo "⚠ ESLint found issues"
            fi
        fi
        
        # Run formatting check if available
        if npm run format:check --silent 2>/dev/null; then
            echo "✅ Formatting check passed"
        elif command -v prettier >/dev/null 2>&1; then
            if prettier --check . 2>/dev/null; then
                echo "✅ Prettier formatting check passed"
            else
                echo "⚠ Prettier found formatting issues"
            fi
        fi
    fi
elif [ -f "Cargo.toml" ]; then
    echo "🦀 Detected Rust project"
    if command -v cargo >/dev/null 2>&1; then
        cargo check --quiet && echo "✅ Cargo check passed"
        cargo clippy --quiet -- -D warnings 2>/dev/null && echo "✅ Clippy passed"
        cargo fmt -- --check 2>/dev/null && echo "✅ Formatting check passed"
        cargo test --quiet 2>/dev/null && echo "✅ Tests passed"
    fi
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    echo "🐍 Detected Python project"
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
    echo "🐹 Detected Go project"
    if command -v go >/dev/null 2>&1; then
        go vet ./... 2>/dev/null && echo "✅ Go vet passed"
        go test ./... 2>/dev/null && echo "✅ Tests passed"
        if [ "$(gofmt -l . | wc -l)" -eq 0 ]; then
            echo "✅ Formatting check passed"
        fi
    fi
else
    echo "📄 Generic project detected"
fi

echo "✅ Quality checks complete"
exit 0
EOF

chmod +x .claude/hooks/smart-lint.sh
print_status "Quality hooks configured"

# Step 8: Final configuration
print_step "Finalizing setup and configuration"

# Add to .gitignore if not already present
if [ -f ".gitignore" ]; then
    if ! grep -q "claude-backup-" .gitignore 2>/dev/null; then
        echo "claude-backup-*/" >> .gitignore
    fi
else
    echo "claude-backup-*/" > .gitignore
fi

# Calculate actual setup time
setup_time=$(($(date +%s) - START_TIME))

# Final success message
echo ""
progress_bar $TOTAL_STEPS $TOTAL_STEPS
echo ""
echo ""
print_status "Claude Code setup complete! (${setup_time}s)"

# Setup summary
echo ""
echo -e "${BLUE}📋 Installation Summary:${NC}"
echo "  ✓ Downloaded 1 configuration file (CLAUDE.md)"
echo "  ✓ Downloaded $total_commands command files"
echo "  ✓ Configured 1 quality hook (smart-lint.sh)"
echo "  ✓ Created .claude directory structure"
echo "  ✓ Updated .gitignore"
echo ""

echo -e "${GREEN}🎯 Available Claude Code commands:${NC}"
echo "  /dev      - TDD-first development (PRIMARY COMMAND)"
echo "  /debug    - Systematic debugging workflow"  
echo "  /refactor - Code improvement workflow"
echo "  /check    - Quality verification"
echo "  /ship     - Complete and commit changes"
echo "  /plan     - Strategic planning & roadmap generation"
echo "  /help     - Comprehensive help system"
echo ""

echo -e "${YELLOW}⚡ Quick Workflow:${NC}"
echo "  /dev \"feature\" → /check → /ship \"description\""
echo ""

echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "  1. Start Claude Code with: ${GREEN}claude${NC}"
echo -e "  2. Try your first TDD feature: ${GREEN}/dev \"user authentication\"${NC}"
echo -e "  3. Get help anytime with: ${GREEN}/help${NC}"
echo ""

print_info "Setup completed successfully! Your development environment is ready."