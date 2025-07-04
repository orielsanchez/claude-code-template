#!/usr/bin/env bash
# smart-lint.sh - Intelligent project-aware code quality checks for Claude Code (MODULAR VERSION)
#
# SYNOPSIS
#   smart-lint.sh [options]
#
# DESCRIPTION
#   Automatically detects project type and runs ALL quality checks using modular architecture.
#   Every issue found is blocking - code must be 100% clean to proceed.
#
# OPTIONS
#   --debug       Enable debug output
#   --fast        Skip slow checks (import cycles, security scans)
#
# EXIT CODES
#   0 - Success (all checks passed - everything is ✅ GREEN)
#   1 - General error (missing dependencies, etc.)
#   2 - ANY issues found - ALL must be fixed
#
# CONFIGURATION
#   Project-specific overrides can be placed in .claude-hooks-config.sh
#   See inline documentation for all available options.

# Don't use set -e - we need to control exit codes carefully
set +e

# ============================================================================
# MODULAR ARCHITECTURE - LOAD SHARED UTILITIES AND LANGUAGE MODULES
# ============================================================================

# Determine the script's directory to find lib/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source shared utilities
if [[ -f "$PROJECT_ROOT/lib/hook-utils.sh" ]]; then
    # shellcheck source=../../lib/hook-utils.sh
    source "$PROJECT_ROOT/lib/hook-utils.sh"
else
    echo "ERROR: Cannot find lib/hook-utils.sh at $PROJECT_ROOT/lib/hook-utils.sh" >&2
    exit 1
fi

# Source all language modules
for linter_module in "$PROJECT_ROOT/lib/linters"/*.sh; do
    if [[ -f "$linter_module" ]]; then
        # shellcheck source=../../lib/linters/*.sh
        source "$linter_module"
        log_debug "Loaded linter module: $(basename "$linter_module")"
    fi
done

# ============================================================================
# LEGACY COMPATIBILITY - MAINTAINING EXISTING API
# ============================================================================

# Legacy summary tracking (compatible with existing code)
declare -a CLAUDE_HOOKS_SUMMARY=()
declare -i CLAUDE_HOOKS_ERROR_COUNT=0

add_summary() {
    local level="$1"
    local message="$2"
    
    if [[ "$level" == "error" ]]; then
        CLAUDE_HOOKS_ERROR_COUNT+=1
        CLAUDE_HOOKS_SUMMARY+=("${RED}❌${NC} $message")
    else
        CLAUDE_HOOKS_SUMMARY+=("${GREEN}✅${NC} $message")
    fi
}

print_summary() {
    if [[ $CLAUDE_HOOKS_ERROR_COUNT -gt 0 ]]; then
        # Only show failures when there are errors
        echo -e "\n${BLUE}═══ Summary ═══${NC}" >&2
        for item in "${CLAUDE_HOOKS_SUMMARY[@]}"; do
            # Only print error items
            if [[ "$item" == *"❌"* ]]; then
                echo -e "$item" >&2
            fi
        done
        
        echo -e "\n${RED}Found $CLAUDE_HOOKS_ERROR_COUNT issue(s) that MUST be fixed!${NC}" >&2
        echo -e "${RED}════════════════════════════════════════════${NC}" >&2
        echo -e "${RED}❌ ALL ISSUES ARE BLOCKING ❌${NC}" >&2
        echo -e "${RED}════════════════════════════════════════════${NC}" >&2
        echo -e "${RED}Fix EVERYTHING above until all checks are ✅ GREEN${NC}" >&2
    fi
}

# ============================================================================
# PROJECT DETECTION (USING MODULAR UTILITIES)
# ============================================================================

detect_project_type() {
    local project_type="unknown"
    local types=()
    
    # Use modular language detection
    for language in go python javascript rust nix; do
        if detect_language_files "$language"; then
            types+=("$language")
        fi
    done
    
    # Return primary type or "mixed" if multiple
    if [[ ${#types[@]} -eq 1 ]]; then
        project_type="${types[0]}"
    elif [[ ${#types[@]} -gt 1 ]]; then
        project_type="mixed:$(IFS=,; echo "${types[*]}")"
    fi
    
    log_debug "Detected project type: $project_type"
    echo "$project_type"
}

# Get list of modified files (if available from git)
get_modified_files() {
    if [[ -d .git ]] && command_exists git; then
        # Get files modified in the last commit or currently staged/modified
        git diff --name-only HEAD 2>/dev/null || true
        git diff --cached --name-only 2>/dev/null || true
    fi
}

# Check if we should skip a file
should_skip_file() {
    local file="$1"
    
    # Check .claude-hooks-ignore if it exists
    if [[ -f ".claude-hooks-ignore" ]]; then
        while IFS= read -r pattern; do
            # Skip comments and empty lines
            [[ -z "$pattern" || "$pattern" =~ ^[[:space:]]*# ]] && continue
            
            # Check if file matches pattern
            if [[ "$file" == $pattern ]]; then
                log_debug "Skipping $file due to .claude-hooks-ignore pattern: $pattern"
                return 0
            fi
        done < ".claude-hooks-ignore"
    fi
    
    # Check for inline skip comments
    if [[ -f "$file" ]] && head -n 5 "$file" 2>/dev/null | grep -q "claude-hooks-disable"; then
        log_debug "Skipping $file due to inline claude-hooks-disable comment"
        return 0
    fi
    
    return 1
}

# ============================================================================
# CONFIGURATION LOADING (USING MODULAR UTILITIES)
# ============================================================================

load_config() {
    load_project_config
    
    # Additional legacy configuration handling if needed
    local config_file=".claude-hooks-config.sh"
    if [[ -f "$config_file" ]]; then
        log_debug "Loading additional configuration from $config_file"
        # shellcheck source=/dev/null
        source "$config_file"
    fi
}

# ============================================================================
# MODULAR LANGUAGE LINTING - USING NEW ARCHITECTURE
# ============================================================================

# Wrapper functions that use modular linters but maintain legacy add_summary API
run_go_linting() {
    if lint_go "."; then
        add_summary "success" "Go linting passed"
    else
        add_summary "error" "Go linting failed"
        return 1
    fi
}

run_python_linting() {
    if lint_python "."; then
        add_summary "success" "Python linting passed"
    else
        add_summary "error" "Python linting failed"
        return 1
    fi
}

run_javascript_linting() {
    if lint_javascript "."; then
        add_summary "success" "JavaScript/TypeScript linting passed"
    else
        add_summary "error" "JavaScript/TypeScript linting failed"
        return 1
    fi
}

run_rust_linting() {
    if lint_rust "."; then
        add_summary "success" "Rust linting passed"
    else
        add_summary "error" "Rust linting failed"
        return 1
    fi
}

run_nix_linting() {
    if lint_nix "."; then
        add_summary "success" "Nix linting passed"
    else
        add_summary "error" "Nix linting failed"
        return 1
    fi
}

# ============================================================================
# MAIN EXECUTION LOGIC
# ============================================================================

main() {
    local exit_code=0
    local start_time
    start_time=$(time_start)
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --debug)
                export CLAUDE_HOOKS_DEBUG=1
                shift
                ;;
            --fast)
                export CLAUDE_HOOKS_FAST=1
                shift
                ;;
            *)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
        esac
    done
    
    log_info "Starting intelligent project-aware code quality checks..."
    log_debug "Using modular hook architecture"
    
    # Load configuration
    load_config
    
    # Initialize summary tracking
    init_summary_tracking
    
    # Detect project type using modular detection
    local project_type
    project_type=$(detect_project_type)
    log_info "Project type: $project_type"
    
    # Run language-specific linting using modular architecture
    case "$project_type" in
        "go")
            run_go_linting || exit_code=2
            ;;
        "python")
            run_python_linting || exit_code=2
            ;;
        "javascript")
            run_javascript_linting || exit_code=2
            ;;
        "rust")
            run_rust_linting || exit_code=2
            ;;
        "nix")
            run_nix_linting || exit_code=2
            ;;
        "mixed:"*)
            # For mixed projects, run all detected languages
            log_info "Mixed project detected, running all applicable linters..."
            
            if detect_language_files "go"; then
                run_go_linting || exit_code=2
            fi
            
            if detect_language_files "python"; then
                run_python_linting || exit_code=2
            fi
            
            if detect_language_files "javascript"; then
                run_javascript_linting || exit_code=2
            fi
            
            if detect_language_files "rust"; then
                run_rust_linting || exit_code=2
            fi
            
            if detect_language_files "nix"; then
                run_nix_linting || exit_code=2
            fi
            ;;
        "unknown")
            log_info "Unknown project type - no specific linting to run"
            add_summary "success" "No code quality checks needed"
            ;;
        *)
            log_error "Unexpected project type: $project_type"
            exit 1
            ;;
    esac
    
    # Print summary
    print_summary
    
    # Final status message
    if [[ $exit_code -eq 0 ]]; then
        time_end "$start_time"
        echo -e "${GREEN}✅ All quality checks passed! Code is ready.${NC}" >&2
    else
        echo -e "${RED}❌ Quality checks failed. Fix issues before proceeding.${NC}" >&2
    fi
    
    exit $exit_code
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi