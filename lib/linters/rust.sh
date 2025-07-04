#!/usr/bin/env bash
# rust.sh - Rust-specific linting module
#
# Provides standardized interface for Rust code quality checks

# Source shared utilities
if [[ -f "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh" ]]; then
    # shellcheck source=../hook-utils.sh
    source "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh"
fi

# Rust linting function with standardized interface
lint_rust() {
    local target_dir="${1:-.}"
    local start_time
    
    # Check if Rust linting is enabled
    if ! check_language_enabled "rust"; then
        return 0
    fi
    
    # Check if this is a Rust project
    if ! detect_language_files "rust"; then
        log_debug "No Rust files detected, skipping Rust linting"
        return 0
    fi
    
    log_info "Running Rust quality checks"
    start_time=$(time_start)
    
    # Find Rust files
    local rust_files
    rust_files=$(find "$target_dir" -name "*.rs" -type f 2>/dev/null)
    
    if [[ -z "$rust_files" ]]; then
        log_debug "No Rust files found in $target_dir"
        time_end "$start_time"
        return 0
    fi
    
    local has_errors=0
    
    # Rustfmt formatting
    if check_tool_available "rustfmt"; then
        log_debug "Checking Rust formatting with rustfmt"
        if ! rustfmt --check $rust_files &>/dev/null; then
            log_error "Rust files need formatting (run: rustfmt $rust_files)"
            has_errors=1
        else
            log_success "Rust formatting is correct"
        fi
    else
        log_debug "rustfmt not available, skipping Rust formatting check"
    fi
    
    # Clippy linting
    if check_tool_available "cargo" && [[ -f "Cargo.toml" ]]; then
        if check_tool_available "cargo-clippy" || cargo clippy --version &>/dev/null; then
            log_debug "Running Rust linting with clippy"
            if ! cargo clippy -- -D warnings &>/dev/null; then
                log_error "Rust clippy found issues (run: cargo clippy)"
                has_errors=1
            else
                log_success "Rust clippy passed"
            fi
        else
            log_debug "clippy not available, skipping Rust linting"
        fi
        
        # Cargo check
        log_debug "Running cargo check"
        if ! cargo check &>/dev/null; then
            log_error "Rust compilation check failed (run: cargo check)"
            has_errors=1
        else
            log_success "Rust compilation check passed"
        fi
    else
        log_debug "cargo not available or no Cargo.toml, skipping Rust checks"
    fi
    
    time_end "$start_time"
    
    if [[ $has_errors -eq 1 ]]; then
        return 1
    else
        return 0
    fi
}