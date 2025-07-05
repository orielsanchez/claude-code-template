---
allowed-tools: all
description: Strategic Planning & Roadmap Generation
planning-focus: comprehensive
roadmap-type: phase-based
execution-ready: true
---
# Plan Command

Generate comprehensive, phase-based roadmaps for any project or improvement initiative

**Usage:**
- `/plan "improve our authentication system"`
- `/plan "add TypeScript to legacy JavaScript project"`
- `/plan "optimize database performance"`
- `/plan "implement CI/CD pipeline"`
- `/plan "refactor monolithic architecture"`

**YOU MUST SAY:** "Let me systematically analyze this project requirements before creating a detailed roadmap."

For complex project requirements, say: "Let me think deeply about this project requirements using systematic investigation."

**CRITICAL: SAVE ROADMAP TO FILE**
After generating the complete roadmap, you MUST save it to a markdown file:
- **File naming**: Use format `ROADMAP-[PROJECT-NAME]-[DATE].md` (e.g., `ROADMAP-USER-EXPERIENCE-IMPROVEMENTS-2025-07-05.md`)
- **Always save**: Every completed roadmap must be saved for future reference
- **Location**: Save in the project root directory
- **Content**: Include the complete formatted roadmap with all phases, deliverables, and implementation details

## Planning Methodology

The systematic planning process analyzes requirements, identifies dependencies, and creates actionable roadmaps with clear phases and deliverables.

**Key Planning Principles:**
- **Incremental Delivery**: Break large initiatives into manageable phases
- **Risk Assessment**: Identify potential blockers and mitigation strategies  
- **Dependency Mapping**: Understand prerequisite relationships
- **Success Metrics**: Define measurable outcomes for each phase
- **Resource Planning**: Estimate effort and timeline requirements

**Planning Scope Examples:**
- **Technical Improvements**: Performance optimization, security hardening, scalability
- **Architecture Changes**: Microservices migration, technology upgrades, refactoring
- **Feature Development**: New functionality, integrations, user experience improvements
- **Process Improvements**: CI/CD, testing, documentation, team workflows
- **Infrastructure**: Cloud migration, monitoring, disaster recovery

## The Systematic Process

### Phase 1: DISCOVERY & ANALYSIS

**Goal:** Understand current state and define requirements

**Key Actions:**
1. Analyze current architecture and identify pain points
2. Gather stakeholder requirements and constraints
3. Assess technical debt and improvement opportunities
4. Identify dependencies and integration points
5. Research best practices and solution approaches

**Deliverables:**
- Current state assessment
- Requirements documentation
- Technical constraints analysis
- Solution research findings

**Learning Objective**: Master thorough requirement analysis and constraint identification

### Phase 2: SOLUTION DESIGN

**Goal:** Design comprehensive solution architecture

**Key Actions:**
1. Design target architecture and solution approach
2. Create detailed technical specifications
3. Plan integration strategies and data migration
4. Design testing and validation approaches
5. Identify tools, technologies, and frameworks needed

**Deliverables:**
- Solution architecture design
- Technical specifications
- Integration and migration plans
- Testing strategy

**Learning Objective**: Develop skills in architectural design and technical planning

### Phase 3: PHASE PLANNING

**Goal:** Break solution into actionable phases with clear deliverables

**Key Actions:**
1. Decompose solution into logical implementation phases
2. Define phase boundaries and success criteria
3. Plan dependency management and sequencing
4. Estimate effort and timeline for each phase
5. Identify risks and mitigation strategies per phase

**Deliverables:**
- Phase breakdown structure
- Timeline and effort estimates
- Risk assessment and mitigation plans
- Success criteria for each phase

**Learning Objective**: Master project decomposition and phase-based planning

### Phase 4: IMPLEMENTATION ROADMAP

**Goal:** Create detailed roadmap with execution guidance

**Key Actions:**
1. Create detailed implementation steps for each phase
2. Define validation checkpoints and quality gates
3. Plan rollback strategies and contingencies
4. Create monitoring and progress tracking mechanisms
5. Document knowledge transfer and training needs

**Deliverables:**
- Detailed implementation roadmap
- Quality assurance checkpoints
- Rollback and contingency plans
- Progress tracking framework

**Learning Objective**: Develop expertise in execution planning and risk management

### Phase 5: RESOURCE & TIMELINE PLANNING

**Goal:** Finalize resource allocation and realistic timelines

**Key Actions:**
1. Estimate resource requirements (team, tools, infrastructure)
2. Create realistic timeline with buffer for unknowns
3. Plan team coordination and communication strategies
4. Identify training and skill development needs
5. Create communication and status reporting plans

**Deliverables:**
- Resource allocation plan
- Realistic project timeline
- Team coordination strategy
- Communication and reporting framework

**Learning Objective**: Master resource planning and team coordination strategies

## Integration with Other Commands

- **`/plan` → `/dev`**: Integration workflow
- **`/plan` → `/refactor`**: Integration workflow
- **`/plan` → `/check`**: Integration workflow
- **`/plan` → `/debug`**: Integration workflow
- **`/plan` → `/ship`**: Integration workflow

**TDD-First Quality Pipeline:**
- **`/plan` → `/check`**: Comprehensive quality validation (tests + linting + formatting)
- **`/plan` → `/debug`**: When tests fail unexpectedly, switch to systematic debugging  
- **`/plan` → `/ship`**: Create final commit with proper documentation

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