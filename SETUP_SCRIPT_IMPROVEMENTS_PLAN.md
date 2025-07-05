# Setup Script UX Improvements Plan

## Overview
Transform the current all-or-nothing setup script into a sophisticated, user-friendly tool that respects existing configurations while providing flexible update options.

## Implementation Phases

```
Phase 1: Essential Safety (Quick Win)
    |
    v
Phase 2: Preview & Intelligence  
    |
    v  
Phase 3: Interactive Experience
    |
    v
Phase 4: Advanced Features
    |
    v
Phase 5: Polish & Documentation
```

---

## PHASE 1: ESSENTIAL SAFETY
**Goal:** Solve immediate pain points with selective updates

### Core Features
- **Command-line flags for selective updates**
  - `--commands-only`: Update/add commands without touching CLAUDE.md
  - `--claude-md-only`: Update only CLAUDE.md file
  - `--force`: Skip all confirmations
  - `--help`: Show usage guide

- **Enhanced backup system**
  - Descriptive backup messages with restoration instructions
  - Backup manifest file tracking what was changed
  - Clear backup location display

- **Selective update logic**
  - `update_commands_only()` function preserves CLAUDE.md
  - `update_claude_md_only()` function preserves commands
  - Preserve existing custom hooks

### Usage Examples
```bash
# Add new commands to existing setup
curl -sL setup.sh | bash -s -- --commands-only

# Update just CLAUDE.md template
curl -sL setup.sh | bash -s -- --claude-md-only

# Full setup (current behavior)
curl -sL setup.sh | bash
```

---

## PHASE 2: PREVIEW & INTELLIGENCE
**Goal:** Build user confidence with change previews

### Core Features
- **Preview functionality**
  - `--preview`: Show what would change without executing
  - File-by-file change summary with diffs
  - Highlight conflicts and customizations

- **Smart CLAUDE.md merging**
  - Detect custom sections (after `# Custom Configuration`)
  - Multiple merge strategies: replace/merge/preserve
  - Conflict resolution with user choice

- **Change detection**
  - Compare local vs template versions
  - Identify new, modified, and deleted items
  - Show impact assessment

### Usage Examples
```bash
# See what would change
curl -sL setup.sh | bash -s -- --preview

# Choose merge strategy
curl -sL setup.sh | bash -s -- --merge-strategy=preserve
```

---

## PHASE 3: INTERACTIVE EXPERIENCE  
**Goal:** Enable power user scenarios with guided workflows

### Core Features
- **Interactive menu system**
  - Guided selection for complex scenarios
  - Command-by-command selection interface
  - Quick presets for common situations

- **Conflict resolution**
  - Interactive dialogs for conflicts
  - Side-by-side comparison views
  - Undo/redo capability during session

- **Quick configuration options**
  - Preset combinations for common use cases
  - Template customization during install
  - Project type detection and recommendations

### Usage Examples
```bash
# Launch interactive mode
curl -sL setup.sh | bash -s -- --interactive

# Quick preset for adding commands only
curl -sL setup.sh | bash -s -- --quick-config=add-commands
```

---

## PHASE 4: ADVANCED FEATURES
**Goal:** Complete professional toolset

### Core Features
- **Dry-run mode**
  - `--dry-run`: Preview + validation without changes
  - Syntax checking and dependency validation
  - Impact analysis and recommendations

- **Rollback capabilities**  
  - `--rollback`: Restore from backup using manifests
  - Multiple backup versions support
  - Selective rollback of specific components

- **Version management**
  - Compare local vs remote template versions
  - Update notifications and changelogs
  - Template version pinning

- **Maintenance tools**
  - `--uninstall`: Clean removal option
  - Cleanup of old backups
  - Health check and repair utilities

---

## PHASE 5: POLISH & DOCUMENTATION
**Goal:** Production-ready user experience

### Core Features
- **Comprehensive help system**
  - Detailed `--help` with examples
  - Context-sensitive guidance
  - Error message improvements

- **Documentation and guides**
  - Troubleshooting guide in README
  - Migration guide for existing users
  - Best practices documentation

- **Performance optimization**
  - Progress indicators for slow operations
  - Parallel downloads where possible
  - Optimized file handling for large setups

---

## Implementation Sequence

### Week 1: Phase 1 Implementation
1. Add argument parsing to setup.sh
2. Implement `--commands-only` flag
3. Enhance backup messaging
4. Test on various repo configurations

### Week 2: Phase 2 Implementation  
1. Build preview functionality
2. Implement smart CLAUDE.md merging
3. Add change detection logic
4. Create merge strategy options

### Week 3: Phases 3-4 Implementation
1. Build interactive menu system
2. Add conflict resolution workflows
3. Implement dry-run and rollback features
4. Add version management

### Week 4: Phase 5 Polish
1. Comprehensive help system
2. Documentation and guides
3. Performance optimizations
4. Final testing and validation

## Immediate Next Steps

1. **Create feature branch:** `setup-script-improvements`
2. **Implement argument parsing** in setup.sh
3. **Add `--commands-only` functionality** (highest ROI feature)

This plan delivers immediate value with Phase 1 while building toward a comprehensive solution that addresses all user experience concerns.