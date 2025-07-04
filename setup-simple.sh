#!/bin/bash

# Simplified Claude Code Setup Script
# Handles three scenarios:
# 1. New project: ./setup-simple.sh [project-name] [framework]
# 2. Existing project w/o Claude: ./setup-simple.sh (in project directory)
# 3. Existing project w/ Claude: ./setup-simple.sh (updates existing setup)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Template directory
TEMPLATE_DIR="${CLAUDE_TEMPLATE_DIR:-$HOME/Projects/claude-code-template}"

echo -e "${BLUE}🚀 Claude Code Setup${NC}"
echo "=================================="

# Output functions
print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Check if template directory exists
if [ ! -d "$TEMPLATE_DIR" ]; then
    print_error "Template not found at $TEMPLATE_DIR"
    echo "Please ensure claude-code-template is available"
    exit 1
fi

# Detect scenario based on arguments and current directory
detect_scenario() {
    if [ $# -gt 0 ]; then
        echo "new-project"
    elif [ -f "CLAUDE.md" ] || [ -d ".claude" ]; then
        echo "existing-claude-update"
    else
        echo "existing-no-claude"
    fi
}

# Framework detection using existing system
detect_frameworks() {
    local project_dir="$1"
    
    # Use enhanced framework detection if available
    if command -v node >/dev/null 2>&1 && [ -f "$TEMPLATE_DIR/lib/framework-detector.js" ]; then
        cat > /tmp/simple-detect.js << 'EOF'
const { detectFrameworks } = require(process.argv[2] + '/lib/framework-detector.js');
const result = detectFrameworks(process.argv[3]);
console.log(JSON.stringify(result));
EOF
        
        local result=$(node /tmp/simple-detect.js "$TEMPLATE_DIR" "$project_dir" 2>/dev/null || echo '{"primary":"generic"}')
        rm -f /tmp/simple-detect.js
        echo "$result"
    else
        echo '{"primary":"generic","languages":[],"frameworks":[],"tools":[],"testFrameworks":[],"bundlers":[]}'
    fi
}

# Create new project
create_new_project() {
    local project_name="$1"
    local framework="${2:-auto}"
    
    print_status "Creating new project: $project_name"
    
    # Create project directory
    mkdir -p "$project_name"
    cd "$project_name"
    
    # Initialize git
    if [ ! -d ".git" ]; then
        git init
        print_status "Initialized git repository"
    fi
    
    # Initialize project based on framework
    case $framework in
        react)
            if command -v npm >/dev/null 2>&1; then
                npm create react-app . --template typescript 2>/dev/null || {
                    npm init -y
                    npm install react react-dom @types/react @types/react-dom typescript
                }
                print_status "Initialized React project"
            fi
            ;;
        python|django|flask)
            mkdir -p src tests
            echo 'def main():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    main()' > src/main.py
            touch requirements.txt
            print_status "Initialized Python project"
            ;;
        rust)
            if command -v cargo >/dev/null 2>&1; then
                cargo init --name "$project_name"
                print_status "Initialized Rust project"
            else
                mkdir -p src
                echo 'fn main() { println!("Hello, world!"); }' > src/main.rs
                echo "[package]\nname = \"$project_name\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n[dependencies]" > Cargo.toml
                print_status "Created Rust project structure"
            fi
            ;;
        *)
            # Auto-detect or generic
            touch README.md
            print_status "Created generic project structure"
            ;;
    esac
    
    # Add Claude setup
    add_claude_setup "$(pwd)"
    
    print_status "Project '$project_name' created successfully!"
}

# Add Claude setup to existing project
add_claude_setup() {
    local project_dir="$1"
    
    print_status "Adding Claude Code setup..."
    
    # Detect frameworks
    local detection=$(detect_frameworks "$project_dir")
    local primary=$(echo "$detection" | node -p "JSON.parse(require('fs').readFileSync(0)).primary" 2>/dev/null || echo "generic")
    
    if [ "$primary" != "generic" ]; then
        print_status "Detected framework: $primary"
        
        # Run enhanced setup if available
        if command -v node >/dev/null 2>&1 && [ -f "$TEMPLATE_DIR/lib/framework-detector.js" ]; then
            cat > /tmp/enhanced-setup.js << 'EOF'
const { enhancedSetup } = require(process.argv[2] + '/lib/framework-detector.js');
enhancedSetup(process.argv[3]).then(result => {
    if (result.success) {
        console.log('SUCCESS: Enhanced setup complete');
        process.exit(0);
    } else {
        console.log('FALLBACK: ' + result.error);
        process.exit(1);
    }
}).catch(err => {
    console.log('FALLBACK: ' + err.message);
    process.exit(1);
});
EOF
            
            if node /tmp/enhanced-setup.js "$TEMPLATE_DIR" "$project_dir" 2>/dev/null; then
                rm -f /tmp/enhanced-setup.js
                print_status "Framework-specific configuration applied"
                return
            fi
            rm -f /tmp/enhanced-setup.js
        fi
    fi
    
    # Fallback: Copy basic Claude setup
    cp -r "$TEMPLATE_DIR/CLAUDE.md" "$project_dir/"
    cp -r "$TEMPLATE_DIR/.claude" "$project_dir/"
    print_status "Added Claude Code configuration"
    
    # Create appropriate .gitignore if it doesn't exist
    if [ ! -f "$project_dir/.gitignore" ]; then
        case $primary in
            react|nextjs|vue)
                echo -e "node_modules/\ndist/\nbuild/\n.env.local\n.env" > "$project_dir/.gitignore"
                ;;
            python|django|flask)
                echo -e "__pycache__/\n*.pyc\nvenv/\n.venv/\n.env" > "$project_dir/.gitignore"
                ;;
            rust)
                echo -e "/target/\nCargo.lock\n*.pdb" > "$project_dir/.gitignore"
                ;;
            *)
                echo -e ".env\n.DS_Store\n*.log" > "$project_dir/.gitignore"
                ;;
        esac
        print_status "Created .gitignore"
    fi
}

# Update existing Claude setup
update_claude_setup() {
    local project_dir="$1"
    
    print_status "Updating existing Claude Code setup..."
    
    # Create backup
    local backup_name="claude-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_name"
    [ -f "CLAUDE.md" ] && cp "CLAUDE.md" "$backup_name/"
    [ -d ".claude" ] && cp -r ".claude" "$backup_name/"
    print_status "Created backup: $backup_name"
    
    # Preserve custom commands
    local custom_commands=()
    if [ -d ".claude/commands" ]; then
        for cmd in .claude/commands/*.md; do
            if [ -f "$cmd" ]; then
                local basename=$(basename "$cmd")
                # Check if it's a custom command (not in template)
                if [ ! -f "$TEMPLATE_DIR/.claude/commands/$basename" ]; then
                    custom_commands+=("$cmd")
                fi
            fi
        done
    fi
    
    # Update Claude setup (this will overwrite existing)
    add_claude_setup "$project_dir"
    
    # Restore custom commands
    if [ ${#custom_commands[@]} -gt 0 ]; then
        for cmd in "${custom_commands[@]}"; do
            cp "$backup_name/.claude/commands/$(basename "$cmd")" ".claude/commands/"
        done
        print_status "Preserved ${#custom_commands[@]} custom commands"
    fi
    
    # Re-detect frameworks in case project evolved
    local detection=$(detect_frameworks "$project_dir")
    local primary=$(echo "$detection" | node -p "JSON.parse(require('fs').readFileSync(0)).primary" 2>/dev/null || echo "generic")
    
    if [ "$primary" != "generic" ]; then
        print_status "Updated configuration for: $primary"
    fi
}

# Show usage information
show_usage() {
    echo ""
    echo "Usage:"
    echo "  $0 [project-name] [framework]  # Create new project"
    echo "  $0                             # Setup current directory"
    echo ""
    echo "Examples:"
    echo "  $0 my-app react               # New React project"
    echo "  $0 my-api python              # New Python project"
    echo "  $0 my-service rust            # New Rust project"
    echo "  $0 my-project                 # Auto-detect framework"
    echo "  $0                            # Add/update Claude setup here"
    echo ""
}

# Main execution
main() {
    local scenario=$(detect_scenario "$@")
    
    case $scenario in
        new-project)
            if [ -z "$1" ]; then
                print_error "Project name required for new project"
                show_usage
                exit 1
            fi
            
            if [ -d "$1" ]; then
                print_error "Directory '$1' already exists"
                exit 1
            fi
            
            create_new_project "$1" "$2"
            ;;
            
        existing-no-claude)
            print_status "Adding Claude setup to existing project"
            add_claude_setup "$(pwd)"
            ;;
            
        existing-claude-update)
            print_status "Updating existing Claude setup"
            update_claude_setup "$(pwd)"
            ;;
    esac
    
    # Show completion message
    echo ""
    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo ""
    echo "Available Claude Code commands:"
    echo "  /dev      - TDD-first development (PRIMARY COMMAND)"
    echo "  /debug    - Systematic debugging workflow"  
    echo "  /refactor - Code improvement workflow"
    echo "  /check    - Quality verification"
    echo "  /ship     - Complete and commit changes"
    echo "  /help     - Comprehensive help system"
    echo ""
    echo "Quick workflow:"
    echo "  /dev \"feature\" → /check → /ship \"description\""
    echo ""
}

# Handle help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_usage
    exit 0
fi

# Run main function with all arguments
main "$@"