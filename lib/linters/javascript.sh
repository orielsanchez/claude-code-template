#!/usr/bin/env bash
# javascript.sh - JavaScript/TypeScript-specific linting module
#
# Provides standardized interface for JavaScript and TypeScript code quality checks

# Source shared utilities
if [[ -f "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh" ]]; then
    # shellcheck source=../hook-utils.sh
    source "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh"
fi

# JavaScript/TypeScript linting function with standardized interface
lint_javascript() {
    local target_dir="${1:-.}"
    local start_time
    
    # Check if JavaScript linting is enabled
    if ! check_language_enabled "javascript"; then
        return 0
    fi
    
    # Check if this is a JavaScript/TypeScript project
    if ! detect_language_files "javascript"; then
        log_debug "No JavaScript/TypeScript files detected, skipping JavaScript linting"
        return 0
    fi
    
    log_info "Running JavaScript/TypeScript quality checks"
    start_time=$(time_start)
    
    # Find JavaScript/TypeScript files
    local js_files
    js_files=$(find "$target_dir" \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -type f 2>/dev/null)
    
    if [[ -z "$js_files" ]]; then
        log_debug "No JavaScript/TypeScript files found in $target_dir"
        time_end "$start_time"
        return 0
    fi
    
    local has_errors=0
    
    # Prettier formatting
    if check_tool_available "prettier"; then
        log_debug "Checking JavaScript/TypeScript formatting with prettier"
        if ! prettier --check "$target_dir" &>/dev/null; then
            log_error "JavaScript/TypeScript files need formatting (run: prettier --write $target_dir)"
            has_errors=1
        else
            log_success "JavaScript/TypeScript formatting is correct"
        fi
    else
        log_debug "prettier not available, skipping JavaScript/TypeScript formatting check"
    fi
    
    # ESLint linting
    if check_tool_available "eslint"; then
        log_debug "Running JavaScript/TypeScript linting with eslint"
        if ! eslint "$target_dir" &>/dev/null; then
            log_error "JavaScript/TypeScript linting failed (run: eslint $target_dir)"
            has_errors=1
        else
            log_success "JavaScript/TypeScript linting passed"
        fi
    else
        log_debug "eslint not available, skipping JavaScript/TypeScript linting"
    fi
    
    # TypeScript compilation check (if TypeScript files present)
    if [[ -n "$(find "$target_dir" \( -name "*.ts" -o -name "*.tsx" \) -type f 2>/dev/null)" ]]; then
        if check_tool_available "tsc"; then
            log_debug "Running TypeScript compilation check"
            if ! tsc --noEmit &>/dev/null; then
                log_error "TypeScript compilation failed (run: tsc --noEmit)"
                has_errors=1
            else
                log_success "TypeScript compilation passed"
            fi
        else
            log_debug "tsc not available, skipping TypeScript compilation check"
        fi
    fi
    
    time_end "$start_time"
    
    if [[ $has_errors -eq 1 ]]; then
        return 1
    else
        return 0
    fi
}