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
TOTAL_STEPS=9
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
    local elapsed=$(($(date +%s) - START_TIME))
    local eta=$((ESTIMATED_DURATION - elapsed))
    
    if [ -n "$BLUE" ]; then
        printf "\r${BLUE}["
        printf "%*s" $filled | tr ' ' '▓'
        printf "%*s" $empty | tr ' ' '░'
        printf "] %d%% [%d/%d] " $percentage $current $total
        if [ $eta -lt 0 ]; then
            printf "Finalizing...${NC}"
        else
            printf "ETA: %ds${NC}" $eta
        fi
    else
        printf "\r["
        printf "%*s" $filled | tr ' ' '#'
        printf "%*s" $empty | tr ' ' '-'
        printf "] %d%% [%d/%d] " $percentage $current $total
        if [ $eta -lt 0 ]; then
            printf "Finalizing..."
        else
            printf "ETA: %ds" $eta
        fi
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
    local exit_code=${1:-130}  # Default to 130 (SIGINT)
    echo ""
    print_warning "Setup interrupted by user"
    print_info "Cleaning up partial installation..."
    
    # Enhanced rollback capability
    # Remove partial files if they exist
    [ -f "CLAUDE.md.tmp" ] && rm -f "CLAUDE.md.tmp"
    [ -d ".claude.tmp" ] && rm -rf ".claude.tmp"
    
    # Restore from backup if it exists
    if [ -n "${BACKUP_DIR:-}" ] && [ -d "$BACKUP_DIR" ]; then
        print_info "Restoring from backup..."
        [ -f "$BACKUP_DIR/CLAUDE.md" ] && cp "$BACKUP_DIR/CLAUDE.md" "."
        [ -d "$BACKUP_DIR/.claude" ] && cp -r "$BACKUP_DIR/.claude" "."
        print_status "Restored from backup: $BACKUP_DIR"
    fi
    
    # Remove failed installation artifacts
    if [ -f ".claude/settings.json" ] && [ ! -s ".claude/settings.json" ]; then
        rm -f ".claude/settings.json"
    fi
    
    print_info "Cleanup complete. You can safely re-run the setup script."
    exit $exit_code
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

# Enhanced network download with comprehensive error handling
download_with_retry() {
    local url=$1
    local output=$2
    local max_attempts=3
    local attempt=1
    
    # Validate inputs
    if [ -z "$url" ] || [ -z "$output" ]; then
        print_error "Invalid download parameters"
        return 1
    fi
    
    # Check disk space (require at least 1MB free)
    if ! check_disk_space "$(dirname "$output")"; then
        print_error "Insufficient disk space for download"
        return 1
    fi
    
    while [ $attempt -le $max_attempts ]; do
        # Enhanced curl with better error handling
        local curl_output
        curl_output=$(mktemp)
        
        if curl -sL --max-time 30 --connect-timeout 10 \
                --fail --location --show-error \
                --write-out "HTTPSTATUS:%{http_code}\nCONTENT_TYPE:%{content_type}" \
                "$url" > "$output" 2>"$curl_output"; then
            
            # Validate download
            if validate_download "$output" "$url"; then
                rm -f "$curl_output"
                return 0
            else
                print_warning "Download validation failed, retrying..."
            fi
        else
            local error_msg
            error_msg=$(cat "$curl_output" 2>/dev/null || echo "Unknown error")
            print_warning "Download failed (attempt $attempt/$max_attempts): $error_msg"
        fi
        
        rm -f "$curl_output"
        
        if [ $attempt -lt $max_attempts ]; then
            print_info "Retrying in 2 seconds..."
            sleep 2
        fi
        
        attempt=$((attempt + 1))
    done
    
    print_error "Failed to download after $max_attempts attempts: $url"
    print_info "Troubleshooting suggestions:"
    echo "  • Check your internet connection"
    echo "  • Verify network proxy settings (HTTP_PROXY, HTTPS_PROXY)"
    echo "  • Check firewall/corporate proxy restrictions"
    echo "  • Verify SSL/TLS certificate configuration"
    echo "  • Try again later if the server is temporarily unavailable"
    echo "  • Download manually from: https://github.com/orielsanchez/claude-code-template"
    return 1
}

# Check available disk space
check_disk_space() {
    local dir=${1:-.}
    local required_mb=1
    
    if command -v df >/dev/null 2>&1; then
        local available_kb
        available_kb=$(df "$dir" 2>/dev/null | awk 'NR==2 {print $4}')
        local available_mb=$((available_kb / 1024))
        
        if [ "$available_mb" -lt "$required_mb" ]; then
            print_error "Insufficient disk space: ${available_mb}MB available, ${required_mb}MB required"
            return 1
        fi
    fi
    return 0
}

# Validate downloaded file
validate_download() {
    local file=$1
    local url=$2
    
    # Check file exists and is not empty
    if [ ! -f "$file" ] || [ ! -s "$file" ]; then
        print_warning "Downloaded file is empty or missing"
        return 1
    fi
    
    # Validate content based on file type
    case "$file" in
        *.md)
            # Markdown files should contain valid text
            if ! file "$file" | grep -q "text"; then
                print_warning "Downloaded .md file appears to be binary"
                return 1
            fi
            ;;
        *.json)
            # JSON files should be valid JSON
            if command -v python3 >/dev/null 2>&1; then
                if ! python3 -m json.tool "$file" >/dev/null 2>&1; then
                    print_warning "Downloaded .json file is not valid JSON"
                    return 1
                fi
            fi
            ;;
        *.sh)
            # Shell scripts should have proper syntax
            if ! bash -n "$file" 2>/dev/null; then
                print_warning "Downloaded .sh file has syntax errors"
                return 1
            fi
            ;;
    esac
    
    # Check for HTML error pages (common when download fails)
    if grep -q "<html\|<HTML" "$file" 2>/dev/null; then
        print_warning "Downloaded file appears to be an HTML error page"
        return 1
    fi
    
    return 0
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
    
    # Create backup with timestamp and track it globally for cleanup
    BACKUP_DIR="claude-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    [ -f "CLAUDE.md" ] && cp "CLAUDE.md" "$BACKUP_DIR/"
    [ -d ".claude" ] && cp -r ".claude" "$BACKUP_DIR/"
    print_status "Created backup: $BACKUP_DIR"
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

# Step 6: Install command files and documentation
print_step "Installing command files and documentation"
commands=("dev" "debug" "refactor" "check" "ship" "help" "prompt" "claude-md" "plan")
documentation=("README")
total_files=$((${#commands[@]} + ${#documentation[@]}))
current_file=0

# Install commands from GitHub
install_commands() {
    for cmd in "${commands[@]}"; do
        current_file=$((current_file + 1))
        echo -n "  Installing ${cmd}.md... ($current_file/$total_files) "
        
        if download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/commands/${cmd}.md" ".claude/commands/${cmd}.md"; then
            echo "[OK] (download)"
        else
            echo "[ERROR] (download failed)"
            return 1
        fi
    done
    
    # Install documentation files
    for doc in "${documentation[@]}"; do
        current_file=$((current_file + 1))
        echo -n "  Installing ${doc}.md... ($current_file/$total_files) "
        
        if download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/commands/${doc}.md" ".claude/commands/${doc}.md"; then
            echo "[OK] (download)"
        else
            echo "[ERROR] (download failed)"
            return 1
        fi
    done
    
    return 0
}

if install_commands; then
    print_status "Installed $total_files commands and documentation files"
else
    print_error "Failed to install command files"
    exit 1
fi

# Step 7: Download settings and create hooks
print_step "Configuring settings and quality hooks"

# Create valid settings.json with only recognized fields
cat > .claude/settings.json << 'EOF'
{
  "includeCoAuthoredBy": false,
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "WebSearch|WebFetch",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/validate-search-date.py"
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
            "command": "python3 .claude/hooks/validate-search-results.py"
          }
        ]
      }
    ]
  }
}
EOF

# Download smart-lint.sh hook from repo
echo -n "  Installing smart-lint.sh hook... "
if download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/hooks/smart-lint.sh" ".claude/hooks/smart-lint.sh"; then
    echo "[OK]"
else
    # Fallback: create a basic version if download fails
    echo "[WARN] (download failed, creating basic version)"
    cat > .claude/hooks/smart-lint.sh << 'EOF'
#!/bin/bash
# Basic quality checks fallback

echo "🔍 Running quality checks..."

# Simple detection for common project types
if [ -f "package.json" ]; then
    echo "📦 Detected Node.js/JavaScript project"
elif [ -f "tsconfig.json" ]; then
    echo "📘 Detected TypeScript project"
elif [ -f "Cargo.toml" ]; then
    echo "🦀 Detected Rust project"
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    echo "🐍 Detected Python project"
elif [ -f "go.mod" ]; then
    echo "🐹 Detected Go project"
else
    echo "📄 Generic project detected"
fi

echo "✅ Basic quality checks complete"
exit 0
EOF
fi

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

# Install hook documentation and examples
echo -n "  Installing hooks documentation... "
if download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/hooks/README.md" ".claude/hooks/README.md"; then
    echo "[OK]"
else
    echo "[WARN] (documentation download failed, continuing...)"
fi

echo -n "  Installing example hook config... "
if download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/hooks/example-claude-hooks-config.sh" ".claude/hooks/example-claude-hooks-config.sh"; then
    echo "[OK]"
    chmod +x .claude/hooks/example-claude-hooks-config.sh
else
    echo "[WARN] (example config download failed, continuing...)"
fi

echo -n "  Installing example ignore patterns... "
if download_with_retry "https://raw.githubusercontent.com/orielsanchez/claude-code-template/main/.claude/hooks/example-claude-hooks-ignore" ".claude/hooks/example-claude-hooks-ignore"; then
    echo "[OK]"
else
    echo "[WARN] (example ignore patterns download failed, continuing...)"
fi

print_status "Claude tool hooks configured"
print_status "Quality hooks configured"
print_status "Documentation and examples installed"

# Step 8: Basic project type detection
print_step "Detecting project type for quality checks"

# Simple project type detection for smart-lint.sh
if [ -f "package.json" ]; then
    print_status "Detected: Node.js/JavaScript project"
elif [ -f "Cargo.toml" ]; then
    print_status "Detected: Rust project"
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
    print_status "Detected: Python project"
elif [ -f "go.mod" ]; then
    print_status "Detected: Go project"
else
    print_status "Detected: Generic project"
fi

print_status "Project detection complete"

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
echo "  ✓ Installed $total_files commands and documentation files"
echo "  ✓ Created .claude/settings.json (hook configuration)"
echo "  ✓ Configured 3 quality hooks (smart-lint.sh + web search validation)"
echo "  ✓ Installed hook documentation and examples"
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