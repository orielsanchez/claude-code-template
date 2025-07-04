#!/bin/bash

# Claude Code Project Setup Script
# Interactive setup for new projects with Claude Code integration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default paths
DEFAULT_TEMPLATE_DIR="$HOME/Projects/default-claude-setup"
GIT_TEMPLATE_DIR="$HOME/.git-templates/claude-setup"

echo -e "${BLUE}🚀 Claude Code Project Setup${NC}"
echo "================================================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if default template exists
if [ ! -d "$DEFAULT_TEMPLATE_DIR" ]; then
    print_error "Default Claude setup not found at $DEFAULT_TEMPLATE_DIR"
    echo "Please run this script from your Projects directory where default-claude-setup exists."
    exit 1
fi

# Setup type selection
echo ""
echo "What would you like to do?"
echo "1) Create new project with Claude setup"
echo "2) Add Claude setup to existing project"
echo "3) Configure global git template (one-time setup)"
echo "4) Install shell function for easy project creation"
echo "5) All of the above (recommended for first run)"
echo ""
read -p "Enter your choice (1-5): " setup_choice

case $setup_choice in
    1|2|5)
        # Project setup
        if [ "$setup_choice" = "1" ]; then
            echo ""
            read -p "Enter project name: " project_name
            if [ -z "$project_name" ]; then
                print_error "Project name cannot be empty"
                exit 1
            fi
            
            if [ -d "$project_name" ]; then
                print_error "Directory '$project_name' already exists"
                exit 1
            fi
            
            echo ""
            echo "Select project type:"
            echo "1) Rust project (cargo init)"
            echo "2) Node.js project (npm init)"
            echo "3) Python project (basic structure)"
            echo "4) Empty project (just Claude setup)"
            echo ""
            read -p "Enter choice (1-4): " project_type
            
            # Create project directory
            mkdir -p "$project_name"
            cd "$project_name"
            print_status "Created project directory: $project_name"
            
        else
            # Adding to existing project
            project_name=$(basename $(pwd))
            echo ""
            echo "Adding Claude setup to current directory: $(pwd)"
            echo "Project name: $project_name"
            echo ""
            read -p "Continue? (y/N): " confirm
            if [[ ! $confirm =~ ^[Yy]$ ]]; then
                echo "Cancelled."
                exit 0
            fi
            project_type=4  # Treat as empty project
        fi
        
        # Initialize project based on type
        case $project_type in
            1)
                if command -v cargo >/dev/null 2>&1; then
                    cargo init --name "$project_name"
                    print_status "Initialized Rust project with Cargo"
                else
                    print_warning "Cargo not found, creating basic Rust structure"
                    mkdir -p src
                    echo 'fn main() { println!("Hello, world!"); }' > src/main.rs
                    echo '[package]
name = "'$project_name'"
version = "0.1.0"
edition = "2021"

[dependencies]' > Cargo.toml
                fi
                ;;
            2)
                if command -v npm >/dev/null 2>&1; then
                    npm init -y
                    print_status "Initialized Node.js project with npm"
                else
                    print_warning "npm not found, creating basic package.json"
                    echo '{
  "name": "'$project_name'",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}' > package.json
                fi
                ;;
            3)
                mkdir -p src tests docs
                echo 'def main():
    print("Hello, world!")

if __name__ == "__main__":
    main()' > src/main.py
                echo '# '$project_name'

A Python project with Claude Code integration.

## Setup

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Usage

```bash
python src/main.py
```' > README.md
                touch requirements.txt
                print_status "Created Python project structure"
                ;;
            4)
                touch README.md
                print_status "Created empty project"
                ;;
        esac
        
        # Copy Claude setup
        cp -r "$DEFAULT_TEMPLATE_DIR"/{CLAUDE.md,.claude} .
        print_status "Copied Claude Code setup (CLAUDE.md and .claude/)"
        
        # Initialize git if not already a repo
        if [ ! -d ".git" ]; then
            git init
            print_status "Initialized git repository"
        fi
        
        # Create initial .gitignore if it doesn't exist
        if [ ! -f ".gitignore" ]; then
            case $project_type in
                1)
                    echo '/target/
Cargo.lock
*.pdb' > .gitignore
                    ;;
                2)
                    echo 'node_modules/
npm-debug.log*
.env
dist/' > .gitignore
                    ;;
                3)
                    echo '__pycache__/
*.pyc
*.pyo
*.pyd
.env
venv/
.venv/' > .gitignore
                    ;;
                *)
                    echo '.env
.DS_Store
*.log' > .gitignore
                    ;;
            esac
            print_status "Created .gitignore"
        fi
        
        echo ""
        print_status "Project '$project_name' ready!"
        echo ""
        echo "Available Claude Code commands:"
        echo "  /check    - Quality verification"
        echo "  /next     - Structured implementation"
        echo "  /tdd      - Test-driven development"
        echo "  /ship     - Complete and commit changes"
        echo "  /prompt   - LLM handoff (default) and help system"
        echo ""
        echo "Quick workflow:"
        echo "  /tdd \"feature\" → /check → /ship \"description\""
        echo "  /prompt (when context gets full)"
        echo ""
        
        if [ "$setup_choice" != "5" ]; then
            exit 0
        fi
        ;;
esac

case $setup_choice in
    3|5)
        # Configure git template
        echo ""
        echo "Setting up global git template..."
        
        mkdir -p "$GIT_TEMPLATE_DIR"
        cp -r "$DEFAULT_TEMPLATE_DIR"/{CLAUDE.md,.claude} "$GIT_TEMPLATE_DIR/"
        
        git config --global init.templateDir "$GIT_TEMPLATE_DIR"
        print_status "Configured global git template"
        echo "  Now 'git init' will automatically include Claude setup"
        
        if [ "$setup_choice" != "5" ]; then
            exit 0
        fi
        ;;
esac

case $setup_choice in
    4|5)
        # Install shell function
        echo ""
        echo "Installing shell function..."
        
        # Detect shell
        if [[ $SHELL == *"zsh"* ]]; then
            shell_rc="$HOME/.zshrc"
        elif [[ $SHELL == *"bash"* ]]; then
            shell_rc="$HOME/.bashrc"
        else
            shell_rc="$HOME/.profile"
        fi
        
        # Function to add
        function_code='
# Claude Code project creation function
new-claude-project() {
    local project_name=${1:-$(basename $(pwd))}
    local setup_script="$HOME/Projects/setup-claude-project.sh"
    
    if [ ! -f "$setup_script" ]; then
        echo "Error: Setup script not found at $setup_script"
        return 1
    fi
    
    if [ -n "$1" ]; then
        # Create new project
        cd "$HOME/Projects" 2>/dev/null || cd ~
        echo "$project_name" | "$setup_script"
    else
        # Setup in current directory
        echo "2" | "$setup_script"
    fi
}'
        
        # Check if function already exists
        if grep -q "new-claude-project" "$shell_rc" 2>/dev/null; then
            print_warning "Shell function already exists in $shell_rc"
        else
            echo "$function_code" >> "$shell_rc"
            print_status "Added shell function to $shell_rc"
            echo "  Usage: new-claude-project [project-name]"
            echo "  Reload shell or run: source $shell_rc"
        fi
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Quick start:"
echo "  1. Start new project: new-claude-project my-app"
echo "  2. Or use git: git init (auto-includes Claude setup)"
echo "  3. Begin development: /tdd \"implement feature\""
echo "  4. Quality check: /check"
echo "  5. Ship changes: /ship \"feature description\""
echo "  6. Context handoff: /prompt (when context gets full)"
echo ""
echo "For help: /prompt help workflow"