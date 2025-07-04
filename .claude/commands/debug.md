---
allowed-tools: all
description: Systematic debugging workflow with investigation, root cause analysis, and regression testing
---
# Systematic Debugging & Root Cause Analysis

**Usage:**
- `/debug <issue>` - Full systematic debugging workflow
- `/debug with-test <test_name>` - Start with existing failing test
- `/debug --goto-fix "<hypothesis>"` - Fast-track when root cause is known
- `/debug investigate <symptoms>` - Investigation only (stops after Phase 2)
- `/debug regression <description>` - Create regression tests for resolved bugs

**Examples:**
- `/debug <issue>` - Full systematic debugging workflow
- `/debug with-test <test_name>` - Start with existing failing test
- `/debug --goto-fix "<hypothesis>"` - Fast-track when root cause is known
- `/debug investigate <symptoms>` - Investigation only (stops after Phase 2)
- `/debug regression <description>` - Create regression tests for resolved bugs

**YOU MUST SAY:** "Let me systematically investigate this issue before attempting any fixes."

For complex issue, say: "Let me think deeply about this issue using systematic investigation."


Stop, Observe, Understand, Fix, Validate. We do not guess. We do not fix symptoms. We find the root cause, write a test that proves it, fix it, and validate the fix against all quality gates.

## The Systematic Debug Process

**CRITICAL:** Before any investigation, create a dedicated git branch to isolate the debugging effort.

### **Usage Patterns Detailed**

**Standard Debugging: `/debug <issue>`**
Full 5-phase workflow for unknown bugs requiring investigation.

**Known Test: `/debug with-test <test_name>`**
When you have a specific failing test - assumes Phase 1 is complete, starts with Phase 2.

**Fast Track: `/debug --goto-fix "<hypothesis>"`**
For experienced developers with strong hypothesis about root cause:
- Still requires writing/updating the regression test (Phase 1)
- Skips deep investigation (Phase 2) 
- Proceeds directly to fix (Phase 3) and validation (Phase 4)

**Investigation Only: `/debug investigate <symptoms>`**
When you need to understand a problem but aren't ready to fix:
- Executes Phases 0-2 only
- Documents findings for later action
- Useful for complex systems requiring analysis before fixes

**Regression Testing: `/debug regression <description>`**
Create tests for bugs that were fixed without proper test coverage:
- Focuses on Phase 1 (writing comprehensive regression tests)
- Useful for hardening existing fixes

## Senior-Level Debugging Patterns

### **Hypothesis-Driven Investigation**
1. State hypothesis clearly
2. Design tests to validate/invalidate hypothesis  
3. Gather evidence systematically
4. Refine hypothesis based on evidence
5. Repeat until confident in root cause

### **Git Forensics**
```bash
# Find when bug was introduced
git bisect start
git bisect bad HEAD
git bisect good <last_known_good_commit>

# Analyze specific file history
git log -p --follow <file>
git blame <file>
```

### **Systematic Evidence Collection**
- **Code Analysis**: Static review of execution paths
- **Historical Analysis**: When and how was this code introduced?
- **Dynamic Analysis**: What happens during execution?
- **Environmental Analysis**: What's different about failing cases?

## Antipatterns to Avoid

**Shotgun Debugging**: Making random changes hoping one will work
- **Solution**: Follow systematic investigation before making changes

**Fixing Symptoms**: Patching visible problems without understanding underlying cause  
- **Solution**: Always trace to root cause before implementing fix

**Skipping the Test**: Writing a fix without proving the bug exists and the fix works
- **Solution**: Regression test is mandatory - no exceptions

**Ignoring Quality Gates**: Committing fixes that fail `/check`
- **Solution**: All fixes must meet same quality bar as features

**Debugging Spirals**: Getting lost in complex investigation without structure
- **Solution**: Use systematic phases and task delegation for complex issues

**Working on Main Branch**: Making experimental changes on main development branch
- **Solution**: Always create dedicated debug branch (Phase 0)

The `/debug` command transforms reactive firefighting into systematic engineering that strengthens both your codebase and your debugging skills.

## The Systematic Process

## Phase 1: ISOLATE

**Goal:** Create dedicated git branch to isolate the debugging effort

1. **Create Debug Branch: Prevents polluting main branch with experimental code**
2. **Document Context: Note current commit, affected systems, and reproduction environment**

**Learning Objective**: Maintain clean git hygiene and enable safe experimentation

## Phase 2: REPRODUCE

**Goal:** Create a single, minimal, automated test that reliably reproduces the bug

1. **Write Failing Regression Test: Use TDD workflow if no test exists**
2. **Verify Reproducibility: Ensure the test fails consistently**
3. **Document Symptoms: Environment, timing, user actions, error messages**

**Learning Objective**: Force precise thinking about the bug's behavior and create regression protection

## Phase 3: INVESTIGATE

**Goal:** Systematic root cause analysis through iterative hypothesis testing

1. **Formulate Initial Hypothesis: State a clear, testable hypothesis about the root cause**
2. **Systematic Evidence Gathering: Execute non-invasive checks to validate or refute hypothesis**
3. **USE TASK DELEGATION for complex investigation**
4. **Confirm Root Cause: Do not proceed until you have strong evidence pointing to a single root cause**

**Learning Objective**: Develop systematic investigation skills and understand the WHY behind bugs

## Phase 4: FIX

**Goal:** Implement the minimal fix to make the failing test pass

1. **Implement Minimal Fix: Write only the code needed to make the Phase 1 test pass**
2. **Verify Fix: Run the specific failing test to confirm it now passes**
3. **Regression Check: Run full test suite to ensure no new failures introduced**
4. **Refactor if Needed: Improve design while keeping tests passing**

**Learning Objective**: Experience how tests guide implementation and provide safety for improvements

## Phase 5: VALIDATE

**Goal:** Ensure the fix meets all project standards and capture learning

1. **Quality Gates: Run `/check` to ensure the fix meets all project quality standards**
2. **Reflect & Document: Root cause summary, fix summary, key learning, prevention strategy**
3. **Cleanup: Remove any temporary debugging code**
4. **Final Commit: Create clean, well-documented commit ready for pull request**

**Learning Objective**: Build systematic thinking about software quality and failure prevention

## Integration with Other Commands

- **`/debug` → `/tdd`**: Integration workflow
- **`/debug` → `/check`**: Integration workflow
- **`/debug` → `/ship`**: Integration workflow

**TDD-First Quality Pipeline:**
- **`/debug` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/debug` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging  
- **`/debug` → `/ship`**: Create final commit with proper documentation
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