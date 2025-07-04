#!/bin/bash

# Shared utilities for Claude Code setup scripts
# Contains common functions used by both setup-simple.sh and setup-claude-project.sh

# ============================================================================
# COLOR DEFINITIONS
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Print colored status messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if a command exists
check_command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Initialize git repository if not already initialized
init_git_repository() {
    if [ ! -d ".git" ]; then
        git init
        print_status "Initialized git repository"
    fi
}

# Generate .gitignore based on project type
generate_gitignore() {
    local project_type="$1"
    local target_file="${2:-.gitignore}"
    
    if [ -f "$target_file" ]; then
        return 0  # Already exists, don't overwrite
    fi
    
    case "$project_type" in
        react|nextjs|vue|javascript|node)
            cat > "$target_file" << 'EOF'
node_modules/
dist/
build/
.env.local
.env
npm-debug.log*
EOF
            ;;
        python|django|flask)
            cat > "$target_file" << 'EOF'
__pycache__/
*.pyc
*.pyo
*.pyd
.env
venv/
.venv/
EOF
            ;;
        rust)
            cat > "$target_file" << 'EOF'
/target/
Cargo.lock
*.pdb
EOF
            ;;
        *)
            cat > "$target_file" << 'EOF'
.env
.DS_Store
*.log
EOF
            ;;
    esac
    
    print_status "Created .gitignore"
}

# Detect framework with fallback using framework-detector.js
detect_framework_with_fallback() {
    local project_dir="$1"
    local template_dir="$2"
    
    # Use enhanced framework detection if available
    if check_command_exists node && [ -f "$template_dir/lib/framework-detector.js" ]; then
        cat > /tmp/framework-detect.js << 'EOF'
const { detectFrameworks } = require(process.argv[2] + '/lib/framework-detector.js');
const result = detectFrameworks(process.argv[3]);
console.log(JSON.stringify(result));
EOF
        
        local result=$(node /tmp/framework-detect.js "$template_dir" "$project_dir" 2>/dev/null || echo '{"primary":"generic"}')
        rm -f /tmp/framework-detect.js
        echo "$result"
    else
        echo '{"primary":"generic","languages":[],"frameworks":[],"tools":[],"testFrameworks":[],"bundlers":[]}'
    fi
}

# Run enhanced setup with framework detection
run_enhanced_framework_setup() {
    local project_dir="$1"
    local template_dir="$2"
    
    # Check if Node.js and our detection system are available
    if check_command_exists node && [ -f "$template_dir/lib/framework-detector.js" ]; then
        print_status "🔍 Auto-detecting project framework..."
        
        # Create a simple Node.js script to run detection
        cat > /tmp/enhanced-setup.js << 'EOF'
const { enhancedSetup } = require(process.argv[2] + '/lib/framework-detector.js');
const projectPath = process.argv[3];

enhancedSetup(projectPath).then(result => {
    if (result.success) {
        console.log('SUCCESS');
        console.log('Primary:', result.detected.primary);
        console.log('Languages:', result.detected.languages.join(', '));
        console.log('Frameworks:', result.detected.frameworks.join(', '));
        console.log('Tools:', result.detected.tools.join(', '));
        if (result.detected.testFrameworks.length > 0) {
            console.log('Test Frameworks:', result.detected.testFrameworks.join(', '));
        }
        if (result.detected.bundlers.length > 0) {
            console.log('Bundlers:', result.detected.bundlers.join(', '));
        }
    } else {
        console.log('FALLBACK');
        console.log('Error:', result.error);
    }
}).catch(err => {
    console.log('FALLBACK');
    console.log('Detection failed:', err.message);
});
EOF
        
        # Run the detection
        local setup_output=$(node /tmp/enhanced-setup.js "$template_dir" "$project_dir" 2>/dev/null)
        local setup_status=$(echo "$setup_output" | head -n 1)
        
        if [ "$setup_status" = "SUCCESS" ]; then
            echo "$setup_output" | tail -n +2 | while IFS=': ' read -r key value; do
                if [ -n "$value" ]; then
                    print_status "$key: $value"
                fi
            done
            
            print_status "✨ Enhanced setup complete! Framework-specific configuration applied."
            rm -f /tmp/enhanced-setup.js
            return 0
        else
            print_warning "Auto-detection failed, falling back to manual setup"
            rm -f /tmp/enhanced-setup.js
            return 1
        fi
    else
        print_warning "Enhanced setup not available (Node.js required)"
        return 1
    fi
}

# Copy basic Claude setup files
copy_claude_setup() {
    local template_dir="$1"
    local target_dir="${2:-.}"
    
    if [ ! -d "$template_dir" ]; then
        print_error "Template not found at $template_dir"
        return 1
    fi
    
    # Copy Claude setup files
    cp -r "$template_dir/CLAUDE.md" "$target_dir/"
    cp -r "$template_dir/.claude" "$target_dir/"
    print_status "Added Claude Code configuration"
}