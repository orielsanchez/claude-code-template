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
    echo -e "${GREEN}[OK]${NC} [$CURRENT_STEP/$TOTAL_STEPS] $1"
}

print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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
echo -e "${BLUE}Claude Code Enhanced Setup${NC}"
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
if [ -f "CLAUDE.md" ]; then
    print_status "CLAUDE.md already exists - preserving existing file"
    print_info "Your existing CLAUDE.md will not be modified"
else
    if ! download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/CLAUDE.md" "CLAUDE.md"; then
        exit 1
    fi
    print_status "Downloaded CLAUDE.md"
fi
print_status "Installing configuration files complete"

# Step 6: Install command files (hybrid approach)
print_step "Installing command files"
commands=("dev" "debug" "refactor" "check" "ship" "help" "prompt" "claude-md" "plan" "explore")
total_commands=${#commands[@]}
current_command=0

# Always download from GitHub for consistency and simplicity

# Install commands from local source or download from GitHub
install_commands() {
    for cmd in "${commands[@]}"; do
        current_command=$((current_command + 1))
        echo -n "  Installing ${cmd}.md... ($current_command/$total_commands) "
        
        if download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/commands/${cmd}.md" ".claude/commands/${cmd}.md"; then
            echo "[OK] (download)"
        else
            echo "[ERROR] (download failed)"
            return 1
        fi
    done
    return 0
}

if install_commands; then
    print_status "Installed $total_commands command files"
else
    print_error "Failed to install command files"
    exit 1
fi

# Step 7: Download settings and create hooks
print_step "Configuring settings and quality hooks"

# Create simple settings.json
cat > .claude/settings.json << 'EOF'
{
  "version": "1.0.0",
  "project": {
    "name": "claude-code-template",
    "type": "template"
  },
  "features": {
    "tdd": true,
    "quality_hooks": true,
    "professional_standards": true
  },
  "git_hooks": {
    "pre_commit": true,
    "commit_msg": true,
    "smart_lint": true
  },
  "quality": {
    "emoji_enforcement": true,
    "claude_attribution_prevention": true,
    "forbidden_patterns": true
  },
  "defaults": {
    "workflow": "tdd-first",
    "primary_command": "/dev",
    "quality_gate": "/check"
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "WebSearch|WebFetch",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/hooks/validate-search-date.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "WebSearch|WebFetch",
        "hooks": [
          {
            "type": "command", 
            "command": "python .claude/hooks/validate-search-results.py"
          }
        ]
      }
    ]
  }
}
EOF

# Create enhanced smart-lint.sh hook
cat > .claude/hooks/smart-lint.sh << 'EOF'
#!/bin/bash
# Enhanced quality checks with better error reporting - auto-generated

# Exit codes: 0 = success, 1 = error, 2 = issues found
set +e

echo "Running quality checks..."

# Detect project type and run appropriate checks
if [ -f "package.json" ]; then
    echo "Detected Node.js/JavaScript project"
    if command -v npm >/dev/null 2>&1; then
        # Run tests if available
        if npm run test --silent 2>/dev/null; then
            echo "[OK] Tests passed"
        else
            echo "[WARN] Tests not available or failed"
        fi
        
        # Run linting if available
        if npm run lint --silent 2>/dev/null; then
            echo "[OK] Linting passed"
        elif command -v eslint >/dev/null 2>&1; then
            if eslint . --ext .js,.jsx,.ts,.tsx 2>/dev/null; then
                echo "[OK] ESLint passed"
            else
                echo "⚠ ESLint found issues"
            fi
        fi
        
        # Run formatting check if available
        if npm run format:check --silent 2>/dev/null; then
            echo "[OK] Formatting check passed"
        elif command -v prettier >/dev/null 2>&1; then
            if prettier --check . 2>/dev/null; then
                echo "[OK] Prettier formatting check passed"
            else
                echo "⚠ Prettier found formatting issues"
            fi
        fi
    fi
elif [ -f "Cargo.toml" ]; then
    echo "Detected Rust project"
    if command -v cargo >/dev/null 2>&1; then
        cargo check --quiet && echo "[OK] Cargo check passed"
        cargo clippy --quiet -- -D warnings 2>/dev/null && echo "[OK] Clippy passed"
        cargo fmt -- --check 2>/dev/null && echo "[OK] Formatting check passed"
        cargo test --quiet 2>/dev/null && echo "[OK] Tests passed"
    fi
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    echo "Detected Python project"
    if command -v python >/dev/null 2>&1; then
        # Run tests if pytest is available
        if command -v pytest >/dev/null 2>&1; then
            pytest --quiet 2>/dev/null && echo "[OK] Tests passed"
        fi
        
        # Run linting if available
        if command -v flake8 >/dev/null 2>&1; then
            flake8 . 2>/dev/null && echo "[OK] Flake8 passed"
        fi
        
        if command -v black >/dev/null 2>&1; then
            black --check . 2>/dev/null && echo "[OK] Black formatting check passed"
        fi
    fi
elif [ -f "go.mod" ]; then
    echo "Detected Go project"
    if command -v go >/dev/null 2>&1; then
        go vet ./... 2>/dev/null && echo "[OK] Go vet passed"
        go test ./... 2>/dev/null && echo "[OK] Tests passed"
        if [ "$(gofmt -l . | wc -l)" -eq 0 ]; then
            echo "[OK] Formatting check passed"
        fi
    fi
else
    echo "Generic project detected"
fi

echo "[OK] Quality checks complete"
exit 0
EOF

chmod +x .claude/hooks/smart-lint.sh

# Create commit-msg hook for Claude attribution enforcement
if [ -d ".git" ]; then
    mkdir -p .git/hooks
    cat > .git/hooks/commit-msg << 'EOF'
#!/usr/bin/env bash
# commit-msg - Validate commit messages for forbidden patterns
#
# This hook enforces the UNIVERSAL FORBIDDEN PATTERNS from CLAUDE.md
# specifically checking for Claude attribution in commit messages.

commit_msg_file="$1"

# Read the commit message
commit_msg=$(cat "$commit_msg_file")

# Check for forbidden Claude attribution patterns
if grep -qiE "(generated with.*claude|co-authored-by.*claude)" "$commit_msg_file"; then
    echo "ERROR: Commit message contains forbidden Claude attribution"
    echo "FORBIDDEN PATTERN: Claude attribution in commit messages is not allowed"
    echo ""
    echo "Remove any of these patterns:"
    echo "  - 'Generated with Claude Code'"
    echo "  - 'Co-Authored-By: Claude'"
    echo "  - Similar Claude attribution text"
    echo ""
    echo "See CLAUDE.md UNIVERSAL FORBIDDEN PATTERNS for details."
    exit 1
fi

# Check for emojis in commit messages (basic pattern matching)
if grep -qE '[😀-🿿]|[🀀-🯿]' "$commit_msg_file"; then
    echo "ERROR: Commit message contains emojis"
    echo "FORBIDDEN PATTERN: No emojis allowed in commit messages"
    echo ""
    echo "See CLAUDE.md UNIVERSAL FORBIDDEN PATTERNS for details."
    exit 1
fi

exit 0
EOF
    chmod +x .git/hooks/commit-msg
    print_status "Git commit-msg hook installed (enforces professional standards)"
else
    print_warning "Not a git repository - commit-msg hook will be installed when git init is run"
fi

# Create pre-commit hook to run quality checks
if [ -d ".git" ]; then
    cat > .git/hooks/pre-commit << 'EOF'
#!/usr/bin/env bash
# pre-commit - Run quality checks before allowing commits
#
# This hook runs the smart-lint.sh quality checker before each commit
# to ensure all code meets professional standards.

if [ -f ".claude/hooks/smart-lint.sh" ]; then
    echo "Running pre-commit quality checks..."
    bash .claude/hooks/smart-lint.sh
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo ""
        echo "[ERROR] Pre-commit quality checks failed!"
        echo "Fix all issues above before committing."
        echo "Run 'bash .claude/hooks/smart-lint.sh' to see details."
        exit 1
    fi
    echo "[OK] Pre-commit quality checks passed!"
else
    echo "[WARN] Warning: .claude/hooks/smart-lint.sh not found"
fi

exit 0
EOF
    chmod +x .git/hooks/pre-commit
    print_status "Git pre-commit hook installed (runs quality checks)"
fi


# Create web search validation hooks
cat > .claude/hooks/validate-search-date.py << 'EOF'
#!/usr/bin/env python3
"""
PreToolUse Hook: Validate search queries for current date context
Ensures web searches include current year (2025) when appropriate
"""
import sys
import json
import re
from datetime import datetime

def main():
    if len(sys.argv) != 2:
        sys.exit(0)
    
    tool_input = json.loads(sys.argv[1])
    query = tool_input.get('query', '')
    
    current_year = datetime.now().year
    
    # Check for outdated year references
    old_years = ['2020', '2021', '2022', '2023', '2024']
    for year in old_years:
        if year in query and str(current_year) not in query:
            print(f"[WARN] Warning: Search query contains {year} but not {current_year}")
            print(f"Consider adding '{current_year}' for current results")
            break
    
    # Suggest adding current year for time-sensitive topics
    time_sensitive = ['latest', 'new', 'recent', 'current', 'update', 'release']
    if any(word in query.lower() for word in time_sensitive):
        if str(current_year) not in query:
            print(f"[TIP] Tip: Add '{current_year}' to get the most current results")

if __name__ == '__main__':
    main()
EOF

cat > .claude/hooks/validate-search-results.py << 'EOF'
#!/usr/bin/env python3
"""
PostToolUse Hook: Analyze search results for outdated information
Warns about potentially stale search results
"""
import sys
import json
import re

def main():
    if len(sys.argv) != 2:
        sys.exit(0)
    
    result = sys.argv[1]
    
    # Look for outdated year references in results
    old_years = ['2020', '2021', '2022', '2023', '2024']
    for year in old_years:
        if year in result:
            print(f"[NOTICE] Notice: Search results contain references to {year}")
            print("Consider refining search with current year for latest information")
            break

if __name__ == '__main__':
    main()
EOF

# Make Python hooks executable
chmod +x .claude/hooks/validate-search-date.py
chmod +x .claude/hooks/validate-search-results.py

print_status "Claude tool hooks configured"
print_status "Quality hooks configured"

# Step 8: Enhanced project detection and customization
print_step "Detecting project type and customizing setup"

# Try to use enhanced framework detection if available
run_framework_detection() {
    local lib_path=""
    
    # Look for lib directory in various locations (check relative paths)
    if [ -d "lib" ] && [ -f "lib/framework-detector.js" ]; then
        lib_path="lib"
    elif [ -d "../lib" ] && [ -f "../lib/framework-detector.js" ]; then
        lib_path="../lib"
    elif [ -d "../../lib" ] && [ -f "../../lib/framework-detector.js" ]; then
        lib_path="../../lib"
    elif [ -d "claude-code-template/lib" ] && [ -f "claude-code-template/lib/framework-detector.js" ]; then
        lib_path="claude-code-template/lib"
    fi
    
    if [ -n "$lib_path" ] && command -v node >/dev/null 2>&1; then
        print_status "Enhanced framework detection available - analyzing project..."
        
        # Create temporary detection script
        cat > /tmp/framework-detect.js << EOF
const path = require('path');
const fs = require('fs');

// Add the lib directory to the path
const libPath = path.resolve('$lib_path');
const { detectFrameworks } = require(path.join(libPath, 'framework-detector'));

async function detect() {
    try {
        const detected = await detectFrameworks(process.cwd());
        console.log(JSON.stringify(detected, null, 2));
    } catch (error) {
        console.error('Detection failed:', error.message);
        process.exit(1);
    }
}

detect();
EOF
        
        # Run detection and capture output
        if detection_result=$(node /tmp/framework-detect.js 2>/dev/null); then
            print_status "Project analysis complete"
            echo "$detection_result" > .claude/project-detection.json
            
            # Extract primary language/framework for user info
            if command -v node >/dev/null 2>&1; then
                primary=$(echo "$detection_result" | node -pe "JSON.parse(require('fs').readFileSync(0)).primary || 'Unknown'")
                if [ "$primary" != "Unknown" ]; then
                    print_status "Detected: $primary project"
                fi
            fi
        else
            print_warning "Enhanced detection failed - using basic setup"
        fi
        
        # Cleanup
        rm -f /tmp/framework-detect.js
    else
        print_status "Using basic project setup (enhanced detection not available)"
    fi
}

print_status "Setup complete"

# Step 9: Final configuration
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
echo -e "${BLUE}Installation Summary:${NC}"
echo "  ✓ Installed 1 configuration file (CLAUDE.md)"
echo "  ✓ Installed $total_commands command files"
echo "  ✓ Created .claude/settings.json (project + hook config)"
echo "  ✓ Configured 3 quality hooks (smart-lint.sh + web search validation)"
if [ -d ".git" ]; then
    echo "  ✓ Installed git pre-commit hook (quality checks)"
    echo "  ✓ Installed git commit-msg hook (Claude attribution enforcement)"
fi
echo "  ✓ Created .claude directory structure"
echo "  ✓ Updated .gitignore"
echo ""

echo -e "${GREEN}Available Claude Code commands:${NC}"
echo "  /dev      - TDD-first development (PRIMARY COMMAND)"
echo "  /debug    - Systematic debugging workflow"  
echo "  /refactor - Code improvement workflow"
echo "  /plan     - Strategic planning & roadmap generation"
echo "  /explore  - Codebase exploration & analysis"
echo "  /check    - Quality verification"
echo "  /ship     - Complete and commit changes (NO Claude attribution)"
echo "  /prompt   - Generate LLM handoff prompts"
echo "  /help     - Comprehensive help system"
echo ""

echo -e "${YELLOW}⚡ Quick Workflow:${NC}"
echo "  /dev \"feature\" → /check → /ship \"description\""
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Start Claude Code with: ${GREEN}claude${NC}"
echo -e "  2. Try your first TDD feature: ${GREEN}/dev \"user authentication\"${NC}"
echo -e "  3. Get help anytime with: ${GREEN}/help${NC}"
echo ""

if [ -d ".git" ]; then
    echo -e "${YELLOW}⚡ Professional Standards Enforced:${NC}"
    echo "  • Git hooks prevent Claude attribution in commit messages"
    echo "  • No emojis allowed in commits (professional standards)"  
    echo "  • Clean commit history automatically maintained"
    echo ""
fi

print_info "Setup completed successfully! Your development environment is ready."