---
allowed-tools: all
description: Update roadmap documentation and commit changes with quality validation
---

# Ship Changes

Complete workflow to update roadmap, validate quality, and commit changes.

**Usage:** `/ship [message]`

**Examples:**
- `/ship "implement user authentication"` - Ship with specific commit message
- `/ship` - Ship with auto-generated message based on changes

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
/tdd "user authentication"     # Implement with TDD
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

## Learning Integration

**Knowledge Preservation:**
- Document what was learned during implementation
- Update mastery progression if significant learning occurred
- Record successful patterns for future reference
- Identify areas for continued learning

**Roadmap Evolution:**
- Mark completed features and milestones
- Adjust future priorities based on implementation insights
- Document any scope changes or new requirements discovered
- Plan next logical development steps

The `/ship` command ensures that every change is properly documented, validated, and committed with full context preservation.