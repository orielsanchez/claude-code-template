## Integration with Other Commands

{{integrationList}}

**TDD-First Quality Pipeline:**
- **`/{{commandName}}` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/{{commandName}}` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging  
- **`/{{commandName}}` → `/ship`**: Create final commit with proper documentation