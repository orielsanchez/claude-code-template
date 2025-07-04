---
allowed-tools: all
description: Verify code quality, run tests, and ensure production readiness
---

# CRITICAL REQUIREMENT: FIX ALL ERRORS!

**THIS IS NOT A REPORTING TASK - THIS IS A FIXING TASK!**

When you run `/check`, you are REQUIRED to:

1. **IDENTIFY** all errors, warnings, and issues
2. **FIX EVERY SINGLE ONE** - not just report them!
3. **USE MULTIPLE AGENTS** to fix issues in parallel:
   - Spawn one agent to fix linting issues
   - Spawn another to fix test failures
   - Spawn more agents for different files/modules
   - Say: "I'll spawn multiple agents to fix all these issues in parallel"
4. **DO NOT STOP** until:
   - ALL linters pass with ZERO warnings
   - ALL tests pass
   - Build succeeds
   - EVERYTHING is GREEN

**FORBIDDEN BEHAVIORS:**
- "Here are the issues I found" → NO! FIX THEM!
- "The linter reports these problems" → NO! RESOLVE THEM!
- "Tests are failing because..." → NO! MAKE THEM PASS!
- Stopping after listing issues → NO! KEEP WORKING!

**MANDATORY WORKFLOW:**
```
1. Run checks → Find issues
2. IMMEDIATELY spawn agents to fix ALL issues
3. Re-run checks → Find remaining issues
4. Fix those too
5. REPEAT until EVERYTHING passes
```

**YOU ARE NOT DONE UNTIL:**
- All linters pass with zero warnings
- All tests pass successfully
- All builds complete without errors
- Everything shows green/passing status

---

**MANDATORY PRE-FLIGHT CHECK**
1. Re-read ~/.claude/CLAUDE.md RIGHT NOW
2. Check current TODO.md status
3. Verify you're not declaring "done" prematurely

Execute comprehensive quality checks with ZERO tolerance for excuses.

**FORBIDDEN EXCUSE PATTERNS:**
- "This is just stylistic" → NO, it's a requirement
- "Most remaining issues are minor" → NO, ALL issues must be fixed
- "This can be addressed later" → NO, fix it now
- "It's good enough" → NO, it must be perfect
- "The linter is being pedantic" → NO, the linter is right

Let me ultrathink about validating this codebase against our exceptional standards.

**REMEMBER: Hooks will verify EVERYTHING and block on violations!**

**Universal Quality Verification Protocol:**

**Step 0: Hook Status Check**
- Run `~/.claude/hooks/smart-lint.sh` directly to see current state
- If ANY issues exist, they MUST be fixed before proceeding
- Check `~/.claude/hooks/violation-status.sh` if it exists

**Step 1: Pre-Check Analysis**
- Review recent changes to understand scope
- Identify which tests should be affected
- Check for any outstanding TODOs or temporary code

**Step 2: Language-Agnostic Linting**
Run appropriate linters for ALL languages in the project:
- `make lint` if Makefile exists
- `~/.claude/hooks/smart-lint.sh` for automatic detection
- Manual linter runs if needed

**Universal Requirements:**
- ZERO warnings across ALL linters
- ZERO disabled linter rules without documented justification
- ZERO "nolint" or suppression comments without explanation
- ZERO formatting issues (all code must be auto-formatted)

**For Go projects specifically:**
- ZERO warnings from golangci-lint (all checks enabled)
- No disabled linter rules without explicit justification
- No use of interface{} or any{} types
- No nolint comments unless absolutely necessary with explanation
- Proper error wrapping with context
- No naked returns in functions over 5 lines
- Consistent naming following Go conventions

**Step 3: Test Verification**
Run `make test` and ensure:
- ALL tests pass without flakiness
- Test coverage is meaningful (not just high numbers)
- Table-driven tests for complex logic
- No skipped tests without justification
- Benchmarks exist for performance-critical paths
- Tests actually test behavior, not implementation details

**Go Quality Checklist:**
- [ ] No interface{} or any{} - concrete types everywhere
- [ ] Simple error handling - no custom error hierarchies
- [ ] Early returns to reduce nesting
- [ ] Meaningful variable names (userID not id)
- [ ] Proper context propagation
- [ ] No goroutine leaks
- [ ] Deferred cleanup where appropriate
- [ ] No race conditions (run with -race flag)
- [ ] No time.Sleep() for synchronization - channels used instead
- [ ] Select with timeouts instead of polling loops

**Code Hygiene Verification:**
- [ ] All exported symbols have godoc comments
- [ ] No commented-out code blocks
- [ ] No debugging print statements
- [ ] No placeholder implementations
- [ ] Consistent formatting (gofmt/goimports)
- [ ] Dependencies are actually used
- [ ] No circular dependencies

**Security Audit:**
- [ ] Input validation on all external data
- [ ] SQL queries use prepared statements
- [ ] Crypto operations use crypto/rand
- [ ] No hardcoded secrets or credentials
- [ ] Proper permission checks
- [ ] Rate limiting where appropriate

**Performance Verification:**
- [ ] No obvious N+1 queries
- [ ] Appropriate use of pointers vs values
- [ ] Buffered channels where beneficial
- [ ] Connection pooling configured
- [ ] No unnecessary allocations in hot paths
- [ ] No busy-wait loops consuming CPU
- [ ] Channels used for efficient goroutine coordination

**Failure Response Protocol:**
When issues are found:
1. **IMMEDIATELY SPAWN AGENTS** to fix issues in parallel:
   ```
   "I found 15 linting issues and 3 test failures. I'll spawn agents to fix these:
   - Agent 1: Fix linting issues in files A, B, C
   - Agent 2: Fix linting issues in files D, E, F  
   - Agent 3: Fix the failing tests
   Let me tackle all of these in parallel..."
   ```
2. **FIX EVERYTHING** - Address EVERY issue, no matter how "minor"
3. **VERIFY** - Re-run all checks after fixes
4. **REPEAT** - If new issues found, spawn more agents and fix those too
5. **NO STOPPING** - Keep working until ALL checks show GREEN
6. **NO EXCUSES** - Common invalid excuses:
   - "It's just formatting" → Auto-format it NOW
   - "It's a false positive" → Prove it or fix it NOW
   - "It works fine" → Working isn't enough, fix it NOW
   - "Other code does this" → Fix that too NOW
7. **ESCALATE** - Only ask for help if truly blocked after attempting fixes

**Final Verification:**
The code is ready when:
- make lint: PASSES with zero warnings
- make test: PASSES all tests
- go test -race: NO race conditions
- All checklist items verified
- Feature works end-to-end in realistic scenarios
- Error paths tested and handle gracefully

**Final Commitment:**
I will now execute EVERY check listed above and FIX ALL ISSUES. I will:
- Run all checks to identify issues
- SPAWN MULTIPLE AGENTS to fix issues in parallel
- Keep working until EVERYTHING passes
- Not stop until all checks show passing status

I will NOT:
- Just report issues without fixing them
- Skip any checks
- Rationalize away issues
- Declare "good enough"
- Stop at "mostly passing"
- Stop working while ANY issues remain

**REMEMBER: This is a FIXING task, not a reporting task!**

The code is ready ONLY when every single check shows GREEN.

**Executing comprehensive validation and FIXING ALL ISSUES NOW...**