#!/usr/bin/env bash
# nix.sh - Nix-specific linting module
#
# Provides standardized interface for Nix code quality checks

# Source shared utilities
if [[ -f "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh" ]]; then
    # shellcheck source=../hook-utils.sh
    source "$(dirname "${BASH_SOURCE[0]}")/../hook-utils.sh"
fi

# Nix linting function with standardized interface
lint_nix() {
    local target_dir="${1:-.}"
    local start_time
    
    # Check if Nix linting is enabled
    if ! check_language_enabled "nix"; then
        return 0
    fi
    
    # Check if this is a Nix project
    if ! detect_language_files "nix"; then
        log_debug "No Nix files detected, skipping Nix linting"
        return 0
    fi
    
    log_info "Running Nix quality checks"
    start_time=$(time_start)
    
    # Find Nix files
    local nix_files
    nix_files=$(find "$target_dir" -name "*.nix" -type f 2>/dev/null)
    
    if [[ -z "$nix_files" ]]; then
        log_debug "No Nix files found in $target_dir"
        time_end "$start_time"
        return 0
    fi
    
    local has_errors=0
    
    # Nixpkgs formatting
    if check_tool_available "nixpkgs-fmt"; then
        log_debug "Checking Nix formatting with nixpkgs-fmt"
        if ! nixpkgs-fmt --check $nix_files &>/dev/null; then
            log_error "Nix files need formatting (run: nixpkgs-fmt $nix_files)"
            has_errors=1
        else
            log_success "Nix formatting is correct"
        fi
    else
        log_debug "nixpkgs-fmt not available, skipping Nix formatting check"
    fi
    
    # Nix syntax check
    if check_tool_available "nix-instantiate"; then
        log_debug "Running Nix syntax check"
        local syntax_errors=0
        while IFS= read -r -d '' file; do
            if ! nix-instantiate --parse "$file" &>/dev/null; then
                log_error "Nix syntax error in $file"
                syntax_errors=1
            fi
        done < <(find "$target_dir" -name "*.nix" -type f -print0 2>/dev/null)
        
        if [[ $syntax_errors -eq 0 ]]; then
            log_success "Nix syntax check passed"
        else
            has_errors=1
        fi
    else
        log_debug "nix-instantiate not available, skipping Nix syntax check"
    fi
    
    # statix linting (if available)
    if check_tool_available "statix"; then
        log_debug "Running Nix linting with statix"
        if ! statix check "$target_dir" &>/dev/null; then
            log_error "Nix linting failed (run: statix check $target_dir)"
            has_errors=1
        else
            log_success "Nix linting passed"
        fi
    else
        log_debug "statix not available, skipping Nix linting"
    fi
    
    time_end "$start_time"
    
    if [[ $has_errors -eq 1 ]]; then
        return 1
    else
        return 0
    fi
}