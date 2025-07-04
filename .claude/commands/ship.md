---
allowed-tools: all
description: Update roadmap documentation and commit changes with quality validation
---
# Documentation Updates & Commit Workflow

**Usage:**
- `/ship [message]` - Ship with specific commit message
- `/ship` - Ship with auto-generated message based on changes

**Examples:**
- `/ship [message]` - Ship with specific commit message
- `/ship` - Ship with auto-generated message based on changes

**YOU MUST SAY:** "Let me systematically approach this task before proceeding."

For complex tasks, say: "Let me think deeply about this problem using systematic investigation."


Complete workflow to update roadmap, validate quality, and commit changes.

## Complete Ship Workflow

### **1. Pre-Ship Quality Validation**
- Run comprehensive `/check` to ensure all quality gates pass
- Verify all tests are passing
- Confirm no linting or formatting issues
- Validate that implementation is complete

### **2. Documentation Updates**
- Update project roadmap with completed features
- Document any architectural decisions made
- Update CHANGELOG.md or project documentation
- Record lessons learned and patterns discovered

### **3. Commit Preparation**
- Analyze git diff to understand scope of changes
- Generate meaningful commit message if not provided
- Stage all relevant files for commit
- Follow project commit message conventions

### **4. Final Validation & Commit**
- Final quality check with hooks
- Create commit with proper attribution
- Verify commit succeeded
- Optionally update mastery progression

## Smart Commit Messages

**Auto-generated messages include:**
- Feature scope and primary changes
- Files modified and their purpose
- Any architectural or design decisions
- Testing coverage and validation performed

**Message format follows project conventions:**
```
feat: implement user authentication system

- Add JWT token-based authentication
- Implement login/logout endpoints  
- Add middleware for route protection
- Include comprehensive test coverage

Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Integration with Development Workflow

**Typical Usage Pattern:**
```bash
/dev "user authentication"     # Implement with TDD
/check                         # Validate quality
/ship "implement auth system"  # Update docs and commit
```

**Pre-Ship Checklist (Auto-Executed):**
- All tests passing
- Linters pass with zero warnings
- Code formatted correctly
- Documentation updated
- Roadmap reflects current state
- Commit message is meaningful

The `/ship` command ensures that every change is properly documented, validated, and committed with full context preservation.
## Integration with Other Commands

- **`/ship` → `/dev`**: Integration workflow
- **`/ship` → `/debug`**: Integration workflow
- **`/ship` → `/refactor`**: Integration workflow
- **`/ship` → `/check`**: Integration workflow

**TDD-First Quality Pipeline:**
- **`/ship` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/ship` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging  
- **`/ship` → `/ship`**: Create final commit with proper documentation
**Quality Requirements**:
- Follow all forbidden patterns from CLAUDE.md
- Use proper error handling for your language (Result types, exceptions)
- No unwrap(), expect(), panic!() in production code
- Delete old code when replacing functionality

**Universal Quality Standards:**
- **Delete** old code when replacing it
- **Meaningful names**: `user_id` not `id`, `process_payment` not `do_stuff`
- **Early returns** to reduce nesting depth
- **Proper error handling** for your language (exceptions, Result types, etc.)
- **Comprehensive tests** for complex logic
- **Consistent code style** following project/language conventions
## Learning Integration

### **Before Starting**:
- State your hypothesis about the problem/approach
- Identify which concepts you want to understand deeply
- Set learning objectives: "I want to understand X pattern"

### **During Implementation**:
- Explain the "why" behind each architectural decision
- Connect new patterns to existing knowledge
- Document mental models and intuition being built

### **After Completion**:
- Summarize key insights gained
- Update personal knowledge base with new patterns
- Identify areas for deeper independent study