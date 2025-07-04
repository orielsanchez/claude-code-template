#!/usr/bin/env bash
# go.sh - Go-specific linting module
#
# Provides standardized interface for Go code quality checks

# Source shared utilities
if [[ -f "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh" ]]; then
    # shellcheck source=../hook-utils.sh
    source "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh"
fi

# Go linting function with standardized interface
lint_go() {
    local target_dir="${1:-.}"
    local start_time
    
    # Check if Go linting is enabled
    if ! check_language_enabled "go"; then
        return 0
    fi
    
    # Check if this is a Go project
    if ! detect_language_files "go"; then
        log_debug "No Go files detected, skipping Go linting"
        return 0
    fi
    
    log_info "Running Go quality checks"
    start_time=$(time_start)
    
    # Find Go files
    local go_files
    go_files=$(find "$target_dir" -name "*.go" -type f 2>/dev/null)
    
    if [[ -z "$go_files" ]]; then
        log_debug "No Go files found in $target_dir"
        time_end "$start_time"
        return 0
    fi
    
    local has_errors=0
    
    # Go formatting
    if check_tool_available "gofmt"; then
        log_debug "Checking Go formatting with gofmt"
        local unformatted_files
        unformatted_files=$(gofmt -l "$target_dir" 2>/dev/null)
        if [[ -n "$unformatted_files" ]]; then
            log_error "Go files need formatting (run: gofmt -w $target_dir)"
            has_errors=1
        else
            log_success "Go formatting is correct"
        fi
    else
        log_debug "gofmt not available, skipping Go formatting check"
    fi
    
    # Go imports
    if check_tool_available "goimports"; then
        log_debug "Checking Go imports with goimports"
        local unformatted_imports
        unformatted_imports=$(goimports -l "$target_dir" 2>/dev/null)
        if [[ -n "$unformatted_imports" ]]; then
            log_error "Go imports need formatting (run: goimports -w $target_dir)"
            has_errors=1
        else
            log_success "Go imports are correct"
        fi
    else
        log_debug "goimports not available, skipping import check"
    fi
    
    # Go vet
    if check_tool_available "go"; then
        log_debug "Running Go vet"
        if ! go vet "$target_dir/..." &>/dev/null; then
            log_error "Go vet found issues (run: go vet $target_dir/...)"
            has_errors=1
        else
            log_success "Go vet passed"
        fi
    else
        log_debug "go not available, skipping vet check"
    fi
    
    # Staticcheck (if available)
    if check_tool_available "staticcheck"; then
        log_debug "Running staticcheck"
        if ! staticcheck "$target_dir/..." &>/dev/null; then
            log_error "staticcheck found issues (run: staticcheck $target_dir/...)"
            has_errors=1
        else
            log_success "staticcheck passed"
        fi
    else
        log_debug "staticcheck not available, skipping static analysis"
    fi
    
    # golangci-lint (comprehensive linter)
    if check_tool_available "golangci-lint"; then
        log_debug "Running golangci-lint"
        if ! golangci-lint run "$target_dir/..." &>/dev/null; then
            log_error "golangci-lint found issues (run: golangci-lint run $target_dir/...)"
            has_errors=1
        else
            log_success "golangci-lint passed"
        fi
    else
        log_debug "golangci-lint not available, skipping comprehensive linting"
    fi
    
    time_end "$start_time"
    
    if [[ $has_errors -eq 1 ]]; then
        return 1
    else
        return 0
    fi
}