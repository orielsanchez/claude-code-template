/**
 * Configuration for /plan command generation
 * Creates comprehensive roadmaps with phases that LLMs can follow
 */

const planCommandConfig = {
  name: 'plan',
  description: 'Strategic Planning & Roadmap Generation',
  allowedTools: 'all',
  type: 'workflow',
  subtitle: 'Generate comprehensive, phase-based roadmaps for any project or improvement initiative',
  
  actionVerb: 'analyze',
  target: 'project requirements',
  action: 'creating a detailed roadmap',
  
  usageExamples: [
    '/plan "improve our authentication system"',
    '/plan "add TypeScript to legacy JavaScript project"', 
    '/plan "optimize database performance"',
    '/plan "implement CI/CD pipeline"',
    '/plan "refactor monolithic architecture"'
  ],

  content: `## Planning Methodology

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

`,

  phases: [
    {
      name: 'Discovery & Analysis',
      goal: 'Understand current state and define requirements',
      keyActions: [
        'Analyze current architecture and identify pain points',
        'Gather stakeholder requirements and constraints', 
        'Assess technical debt and improvement opportunities',
        'Identify dependencies and integration points',
        'Research best practices and solution approaches'
      ],
      deliverables: [
        'Current state assessment',
        'Requirements documentation', 
        'Technical constraints analysis',
        'Solution research findings'
      ],
      learningObjective: 'Master thorough requirement analysis and constraint identification'
    },
    {
      name: 'Solution Design',
      goal: 'Design comprehensive solution architecture',
      keyActions: [
        'Design target architecture and solution approach',
        'Create detailed technical specifications',
        'Plan integration strategies and data migration',
        'Design testing and validation approaches',
        'Identify tools, technologies, and frameworks needed'
      ],
      deliverables: [
        'Solution architecture design',
        'Technical specifications',
        'Integration and migration plans',
        'Testing strategy'
      ],
      learningObjective: 'Develop skills in architectural design and technical planning'
    },
    {
      name: 'Phase Planning',
      goal: 'Break solution into actionable phases with clear deliverables',
      keyActions: [
        'Decompose solution into logical implementation phases',
        'Define phase boundaries and success criteria',
        'Plan dependency management and sequencing',
        'Estimate effort and timeline for each phase',
        'Identify risks and mitigation strategies per phase'
      ],
      deliverables: [
        'Phase breakdown structure',
        'Timeline and effort estimates',
        'Risk assessment and mitigation plans',
        'Success criteria for each phase'
      ],
      learningObjective: 'Master project decomposition and phase-based planning'
    },
    {
      name: 'Implementation Roadmap',
      goal: 'Create detailed roadmap with execution guidance',
      keyActions: [
        'Create detailed implementation steps for each phase',
        'Define validation checkpoints and quality gates',
        'Plan rollback strategies and contingencies',
        'Create monitoring and progress tracking mechanisms',
        'Document knowledge transfer and training needs'
      ],
      deliverables: [
        'Detailed implementation roadmap',
        'Quality assurance checkpoints',
        'Rollback and contingency plans',
        'Progress tracking framework'
      ],
      learningObjective: 'Develop expertise in execution planning and risk management'
    },
    {
      name: 'Resource & Timeline Planning',
      goal: 'Finalize resource allocation and realistic timelines',
      keyActions: [
        'Estimate resource requirements (team, tools, infrastructure)',
        'Create realistic timeline with buffer for unknowns',
        'Plan team coordination and communication strategies',
        'Identify training and skill development needs',
        'Create communication and status reporting plans'
      ],
      deliverables: [
        'Resource allocation plan',
        'Realistic project timeline',
        'Team coordination strategy',
        'Communication and reporting framework'
      ],
      learningObjective: 'Master resource planning and team coordination strategies'
    }
  ],

  integrations: ['dev', 'refactor', 'check', 'debug', 'ship'],

  customFields: {
    'planning-focus': 'comprehensive',
    'roadmap-type': 'phase-based',
    'execution-ready': 'true'
  }
};

module.exports = planCommandConfig;