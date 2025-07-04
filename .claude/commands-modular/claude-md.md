---
allowed-tools: all
description: Essential CLAUDE.md maintenance
---
# CLAUDE.md Maintenance

**Usage:**
- `/claude-md backup` - Create timestamped backup before changes
- `/claude-md update-mastery` - Update skill progression markers

**Examples:**
- `/claude-md backup` - Create timestamped backup before changes
- `/claude-md update-mastery` - Update skill progression markers

Essential maintenance for your instruction file.

## Essential Functions Only

### **`/claude-md backup`**
- Create timestamped backup before major changes
- Preserve working instruction sets
- Enable safe experimentation with new patterns

### **`/claude-md update-mastery`** 
- Update the Mastery Progression section
- Track learning progress: novice → intermediate → advanced → expert
- Adjust current focus areas and learning objectives

**Other maintenance (patterns, reviews, validation) can be handled through direct conversation with the LLM rather than specialized commands.**

**Maintenance Schedule:**
- **Backup**: Before major instruction changes
- **Update Mastery**: Weekly progression review
## Integration with Other Commands
**TDD-First Quality Pipeline:**
- **`/claude-md` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/claude-md` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging  
- **`/claude-md` → `/ship`**: Create final commit with proper documentation