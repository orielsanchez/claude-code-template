# Command Migration Analysis & Plan

## Command Classification

### Workflow Commands (Systematic Multi-Phase)
- **debug.md** (225 lines) - 5-phase debugging workflow
- **refactor.md** (314 lines) - 4-phase refactoring workflow

### Quality/Action Commands  
- **check.md** (194 lines) - Quality verification and fixing
- **ship.md** (94 lines) - Documentation and commit workflow

### Utility/Information Commands
- **help.md** (266 lines) - Interactive help system
- **prompt.md** (57 lines) - Context handoff generation
- **claude-md.md** (33 lines) - CLAUDE.md maintenance

## Size Reduction Potential

Based on dev.md achieving 71% reduction (14,099 → 4,025):

**High Reduction Potential** (workflow commands):
- debug.md: ~225 lines → estimated ~65 lines (71% reduction)
- refactor.md: ~314 lines → estimated ~91 lines (71% reduction)

**Medium Reduction Potential** (structured commands):
- check.md: ~194 lines → estimated ~97 lines (50% reduction)
- ship.md: ~94 lines → estimated ~56 lines (40% reduction)
- help.md: ~266 lines → estimated ~160 lines (40% reduction)

**Low Reduction Potential** (utility commands):
- prompt.md: ~57 lines → estimated ~45 lines (20% reduction)
- claude-md.md: ~33 lines → estimated ~28 lines (15% reduction)

**Total Estimated Reduction**: ~1,183 lines → ~542 lines (54% overall reduction)

## Migration Priority Order

1. **debug.md** - High impact, workflow command with clear phases
2. **refactor.md** - High impact, workflow command with clear phases  
3. **check.md** - Medium impact, structured quality command
4. **ship.md** - Medium impact, structured workflow command
5. **help.md** - Medium impact, large utility command
6. **prompt.md** - Low impact, simple utility command
7. **claude-md.md** - Low impact, minimal utility command

## Required Template Enhancements

### New Templates Needed:
- `quality-enforcement.md` - For check.md specific patterns
- `commit-workflow.md` - For ship.md specific patterns  
- `help-sections.md` - For help.md command listings
- `utility-intro.md` - For simple utility commands

### Generator Enhancements:
- Support for non-workflow commands
- Custom content sections handling
- Command-specific template selection
- Utility command structure generation

## Migration Approach

Following TDD-first pattern:
1. **RED Phase**: Write failing tests for each command migration
2. **GREEN Phase**: Implement modular versions 
3. **REFACTOR Phase**: Optimize and clean up
4. **VALIDATE Phase**: Ensure identical functionality
5. **REPLACE Phase**: Replace original files