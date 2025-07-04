#!/usr/bin/env bash
# hook-utils.sh - Shared utilities for hook system modularization
#
# This module provides common utilities used across all language-specific
# linting modules, extracted from smart-lint.sh to eliminate duplication.

# ============================================================================
# COLOR DEFINITIONS AND UTILITIES
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Debug mode
CLAUDE_HOOKS_DEBUG="${CLAUDE_HOOKS_DEBUG:-0}"

# Logging functions
log_debug() {
    [[ "$CLAUDE_HOOKS_DEBUG" == "1" ]] && echo -e "${CYAN}[DEBUG]${NC} $*" >&2
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $*" >&2
}

# ============================================================================
# PERFORMANCE TIMING
# ============================================================================

time_start() {
    echo $(($(date +%s%N)/1000000))
}

time_end() {
    if [[ "$CLAUDE_HOOKS_DEBUG" == "1" ]]; then
        local start=$1
        local end=$(($(date +%s%N)/1000000))
        local duration=$((end - start))
        log_debug "Execution time: ${duration}ms"
    fi
}

# ============================================================================
# TOOL DETECTION UTILITIES
# ============================================================================

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check if a tool is available and log the result
check_tool_available() {
    local tool_name="$1"
    if command_exists "$tool_name"; then
        log_debug "$tool_name is available"
        return 0
    else
        log_debug "$tool_name is not available"
        return 1
    fi
}

# ============================================================================
# LANGUAGE CONFIGURATION
# ============================================================================

# Check if a language is enabled via configuration
check_language_enabled() {
    local language="$1"
    local language_upper=$(echo "$language" | tr '[:lower:]' '[:upper:]')
    local var_name="CLAUDE_HOOKS_${language_upper}_ENABLED"
    local enabled="${!var_name:-true}"
    
    if [[ "$enabled" == "true" ]]; then
        log_debug "$language linting is enabled"
        return 0
    else
        log_debug "$language linting is disabled"
        return 1
    fi
}

# ============================================================================
# SUMMARY TRACKING
# ============================================================================

# Summary tracking arrays
declare -a SUMMARY_RESULTS=()
declare -a SUMMARY_TIMINGS=()

# Initialize summary tracking
init_summary_tracking() {
    SUMMARY_RESULTS=()
    SUMMARY_TIMINGS=()
}

# Add a result to the summary with timing
add_summary_with_timing() {
    local status="$1"
    local message="$2"
    local timing_ms="$3"
    
    SUMMARY_RESULTS+=("[$status] $message")
    SUMMARY_TIMINGS+=("$timing_ms")
    
    if [[ "$status" == "success" ]]; then
        log_success "$message (${timing_ms}ms)"
    elif [[ "$status" == "error" ]]; then
        log_error "$message (${timing_ms}ms)"
    else
        log_info "$message (${timing_ms}ms)"
    fi
}

# Print summary report
print_summary_report() {
    local total_items=${#SUMMARY_RESULTS[@]}
    local success_count=0
    local error_count=0
    local total_time=0
    
    for i in "${!SUMMARY_RESULTS[@]}"; do
        local result="${SUMMARY_RESULTS[$i]}"
        local timing="${SUMMARY_TIMINGS[$i]}"
        
        echo "$result (${timing}ms)"
        
        if [[ "$result" == *"[success]"* ]]; then
            ((success_count++))
        elif [[ "$result" == *"[error]"* ]]; then
            ((error_count++))
        fi
        
        ((total_time += timing))
    done
    
    echo ""
    echo "Summary: $success_count success, $error_count errors, ${total_time}ms total"
}

# ============================================================================
# FORMAT-THEN-LINT PATTERN
# ============================================================================

# Standard format-then-lint pattern used by all languages
run_format_then_lint() {
    local language="$1"
    local file_pattern="$2"
    local format_cmd="$3"
    local lint_cmd="$4"
    local start_time
    
    log_info "Running $language format and lint checks"
    start_time=$(time_start)
    
    # Format check/fix
    if check_tool_available "$(echo "$format_cmd" | awk '{print $1}')"; then
        log_debug "Running formatter: $format_cmd $file_pattern"
        if eval "$format_cmd $file_pattern" &>/dev/null; then
            log_success "$language formatting correct"
        else
            log_error "$language files need formatting"
            return 1
        fi
    else
        log_debug "$language formatter not available, skipping format check"
    fi
    
    # Lint check
    if check_tool_available "$(echo "$lint_cmd" | awk '{print $1}')"; then
        log_debug "Running linter: $lint_cmd $file_pattern"
        if eval "$lint_cmd $file_pattern" &>/dev/null; then
            log_success "$language linting passed"
        else
            log_error "$language linting failed"
            return 1
        fi
    else
        log_debug "$language linter not available, skipping lint check"
    fi
    
    time_end "$start_time"
    return 0
}

# ============================================================================
# CONFIGURATION LOADING
# ============================================================================

# Load project-specific configuration if it exists
load_project_config() {
    local config_file=".claude-hooks-config.sh"
    
    if [[ -f "$config_file" ]]; then
        log_debug "Loading project configuration from $config_file"
        # shellcheck source=/dev/null
        source "$config_file"
    else
        log_debug "No project configuration found ($config_file)"
    fi
}

# ============================================================================
# PROJECT TYPE DETECTION
# ============================================================================

# Detect if current directory contains files of a specific language
detect_language_files() {
    local language="$1"
    
    case "$language" in
        "go")
            [[ -f "go.mod" ]] || [[ -f "go.sum" ]] || [[ -n "$(find . -maxdepth 3 -name "*.go" -type f -print -quit 2>/dev/null)" ]]
            ;;
        "python")
            [[ -f "pyproject.toml" ]] || [[ -f "setup.py" ]] || [[ -f "requirements.txt" ]] || [[ -n "$(find . -maxdepth 3 -name "*.py" -type f -print -quit 2>/dev/null)" ]]
            ;;
        "javascript")
            [[ -f "package.json" ]] || [[ -f "tsconfig.json" ]] || [[ -n "$(find . -maxdepth 3 \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -type f -print -quit 2>/dev/null)" ]]
            ;;
        "rust")
            [[ -f "Cargo.toml" ]] || [[ -n "$(find . -maxdepth 3 -name "*.rs" -type f -print -quit 2>/dev/null)" ]]
            ;;
        "nix")
            [[ -f "flake.nix" ]] || [[ -f "default.nix" ]] || [[ -n "$(find . -maxdepth 3 -name "*.nix" -type f -print -quit 2>/dev/null)" ]]
            ;;
        *)
            log_error "Unknown language: $language"
            return 1
            ;;
    esac
}