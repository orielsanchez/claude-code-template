#!/usr/bin/env bash
# python.sh - Python-specific linting module
#
# Provides standardized interface for Python code quality checks

# Source shared utilities
if [[ -f "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh" ]]; then
    # shellcheck source=../hook-utils.sh
    source "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh"
fi

# Python linting function with standardized interface
lint_python() {
    local target_dir="${1:-.}"
    local start_time
    
    # Check if Python linting is enabled
    if ! check_language_enabled "python"; then
        return 0
    fi
    
    # Check if this is a Python project
    if ! detect_language_files "python"; then
        log_debug "No Python files detected, skipping Python linting"
        return 0
    fi
    
    log_info "Running Python quality checks"
    start_time=$(time_start)
    
    # Find Python files
    local python_files
    python_files=$(find "$target_dir" -name "*.py" -type f 2>/dev/null)
    
    if [[ -z "$python_files" ]]; then
        log_debug "No Python files found in $target_dir"
        time_end "$start_time"
        return 0
    fi
    
    local has_errors=0
    
    # Black formatting
    if check_tool_available "black"; then
        log_debug "Checking Python formatting with black"
        if ! black --check --diff "$target_dir" &>/dev/null; then
            log_error "Python files need formatting (run: black $target_dir)"
            has_errors=1
        else
            log_success "Python formatting is correct"
        fi
    else
        log_debug "black not available, skipping Python formatting check"
    fi
    
    # Ruff linting (modern Python linter)
    if check_tool_available "ruff"; then
        log_debug "Running Python linting with ruff"
        if ! ruff check "$target_dir" &>/dev/null; then
            log_error "Python linting failed (run: ruff check $target_dir)"
            has_errors=1
        else
            log_success "Python linting passed"
        fi
    elif check_tool_available "flake8"; then
        log_debug "Running Python linting with flake8"
        if ! flake8 "$target_dir" &>/dev/null; then
            log_error "Python linting failed (run: flake8 $target_dir)"
            has_errors=1
        else
            log_success "Python linting passed"
        fi
    else
        log_debug "No Python linter available (ruff, flake8), skipping lint check"
    fi
    
    # Type checking with mypy (if available)
    if check_tool_available "mypy"; then
        log_debug "Running Python type checking with mypy"
        if ! mypy "$target_dir" &>/dev/null; then
            log_error "Python type checking failed (run: mypy $target_dir)"
            has_errors=1
        else
            log_success "Python type checking passed"
        fi
    else
        log_debug "mypy not available, skipping type checking"
    fi
    
    time_end "$start_time"
    
    if [[ $has_errors -eq 1 ]]; then
        return 1
    else
        return 0
    fi
}