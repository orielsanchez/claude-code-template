#!/usr/bin/env node

/**
 * Phase 1 UX Research System Demonstration
 * 
 * This demo shows how the Phase 1 systems work together to:
 * 1. Collect user research data
 * 2. Track analytics and baseline metrics
 * 3. Classify user personas
 * 4. Assess quick win opportunities
 * 
 * Run with: node examples/phase1-ux-research-demo.js
 */

const UXResearchCollector = require('../lib/ux-research/research-collector');
const AnalyticsTracker = require('../lib/ux-research/analytics-tracker');
const UserPersonaClassifier = require('../lib/ux-research/user-persona-classifier');
const QuickWinAssessor = require('../lib/ux-research/quick-win-assessor');

console.log('🔬 Phase 1: UX Research & Baseline System Demo\n');
console.log('='.repeat(50));

// Initialize all systems
const collector = new UXResearchCollector();
const tracker = new AnalyticsTracker();
const classifier = new UserPersonaClassifier();
const assessor = new QuickWinAssessor();

console.log('\n📊 1. Collecting User Research Data...\n');

// Simulate collecting pain points from user feedback
const painPoints = [
  {
    category: 'onboarding',
    severity: 'high',
    frequency: 'very_common',
    description: 'README is too long and overwhelming for new users',
    userType: 'new_user'
  },
  {
    category: 'setup',
    severity: 'high',
    frequency: 'common',
    description: 'Setup script lacks progress indicators and error feedback',
    userType: 'new_user'
  },
  {
    category: 'command_discovery',
    severity: 'medium',
    frequency: 'common',
    description: 'Difficult to discover available commands without trial and error',
    userType: 'experienced_developer'
  },
  {
    category: 'documentation',
    severity: 'medium',
    frequency: 'uncommon',
    description: 'Advanced features lack detailed examples',
    userType: 'team_lead'
  }
];

painPoints.forEach(painPoint => {
  collector.addPainPoint(painPoint);
  console.log(`✓ Added pain point: ${painPoint.description}`);
});

// Simulate user workflow tracking
const workflows = [
  {
    userType: 'new_user',
    steps: ['visit_readme', 'confused_by_options', 'abandon'],
    timeSpent: 300,
    successfulCompletion: false,
    dropOffPoint: 'option_selection'
  },
  {
    userType: 'experienced_developer',
    steps: ['clone_repo', 'read_claude_md', 'run_dev_command'],
    timeSpent: 120,
    successfulCompletion: true,
    dropOffPoint: null
  },
  {
    userType: 'new_user',
    steps: ['visit_readme', 'read_getting_started', 'run_setup', 'success'],
    timeSpent: 180,
    successfulCompletion: true,
    dropOffPoint: null
  }
];

workflows.forEach(workflow => {
  collector.recordWorkflow(workflow);
  console.log(`✓ Recorded workflow: ${workflow.userType} - ${workflow.successfulCompletion ? 'Success' : 'Failed'}`);
});

console.log('\n📈 2. Tracking Analytics & Baseline Metrics...\n');

// Simulate setup attempts
const setupAttempts = [
  { setupType: 'one_line_curl', success: true, duration: 45, errors: [] },
  { setupType: 'one_line_curl', success: true, duration: 60, errors: [] },
  { setupType: 'manual_setup', success: false, duration: 300, errors: ['git_not_found'] },
  { setupType: 'github_template', success: true, duration: 90, errors: [] },
  { setupType: 'manual_setup', success: false, duration: 180, errors: ['permission_denied'] }
];

setupAttempts.forEach(attempt => {
  tracker.trackSetupAttempt(attempt);
});

// Simulate command usage
tracker.trackCommandUsage('/help', { success: true, duration: 30, userType: 'new_user' });
tracker.trackCommandUsage('/dev', { success: true, duration: 120, userType: 'experienced_developer' });
tracker.trackCommandUsage('/plan', { success: true, duration: 300, userType: 'team_lead' });
tracker.trackCommandUsage('/dev', { success: false, duration: 240, userType: 'new_user' });

// Simulate documentation engagement
tracker.trackDocumentationAccess('README.md', {
  timeSpent: 120,
  scrollDepth: 0.3,
  userType: 'new_user',
  bounced: true
});

tracker.trackDocumentationAccess('CLAUDE.md', {
  timeSpent: 300,
  scrollDepth: 0.8,
  userType: 'experienced_developer',
  bounced: false
});

const setupMetrics = tracker.getSetupMetrics();
console.log(`✓ Setup Success Rate: ${(setupMetrics.successRate * 100).toFixed(1)}%`);
console.log(`✓ Average Successful Setup Time: ${setupMetrics.averageSuccessDuration}s`);
console.log(`✓ Common Setup Errors: ${setupMetrics.commonErrors.join(', ') || 'None'}`);

const commandUsage = tracker.getCommandUsage();
console.log(`✓ Most Used Commands: ${Object.keys(commandUsage).join(', ')}`);

console.log('\n👥 3. User Persona Classification...\n');

// Test user classification
const testUsers = [
  {
    name: 'Alex (New User)',
    behavior: {
      setupTime: 300,
      commandsUsed: ['/help', '/plan'],
      timeSpentReading: 600,
      errorsEncountered: 3,
      askedForHelp: true
    }
  },
  {
    name: 'Sam (Experienced Developer)',
    behavior: {
      setupTime: 60,
      commandsUsed: ['/dev', '/refactor', '/ship'],
      timeSpentReading: 120,
      errorsEncountered: 1,
      askedForHelp: false
    }
  }
];

testUsers.forEach(user => {
  const classification = classifier.classifyUser(user.behavior);
  console.log(`✓ ${user.name}: Classified as '${classification.primaryPersona}' (${(classification.confidence * 100).toFixed(1)}% confidence)`);
  console.log(`  Reasoning: ${classification.reasoning}`);
});

// Update personas with research data
classifier.updatePersonasFromResearch({
  painPoints: collector.getPainPoints(),
  workflows: collector.getWorkflows()
});

console.log(`✓ Updated persona definitions with ${collector.getPainPoints().length} pain points and ${collector.getWorkflows().length} workflows`);

console.log('\n🎯 4. Quick Win Assessment...\n');

// Get top opportunities
const opportunities = collector.getTopOpportunities(3);
console.log('Top Improvement Opportunities:');

opportunities.forEach((opp, index) => {
  const assessment = assessor.assessOpportunity(opp);
  console.log(`\n${index + 1}. ${opp.description}`);
  console.log(`   Impact Score: ${assessment.impactScore}/100`);
  console.log(`   Effort Estimate: ${assessment.effortEstimate}/10`);
  console.log(`   Quick Win Score: ${assessment.quickWinScore.toFixed(1)}`);
  console.log(`   Priority: ${assessment.recommendedPriority.toUpperCase()}`);
  console.log(`   Reasoning: ${assessment.reasoning}`);
});

// Generate recommendations for top opportunity
if (opportunities.length > 0) {
  console.log('\n📋 Detailed Recommendations for Top Opportunity:\n');
  
  const topOpportunity = opportunities[0];
  const recommendations = assessor.generateRecommendations(topOpportunity);
  
  console.log(`Opportunity: ${topOpportunity.description}`);
  console.log(`Priority: ${recommendations.implementation.priority.toUpperCase()}`);
  console.log(`Complexity: ${recommendations.implementation.complexity}`);
  
  console.log('\nAction Items:');
  recommendations.actionItems.forEach(item => {
    console.log(`  • ${item}`);
  });
  
  console.log('\nSuccess Metrics:');
  recommendations.successMetrics.forEach(metric => {
    console.log(`  • ${metric}`);
  });
  
  console.log(`\nEstimated Timeline: ${recommendations.estimatedTimeline.total} days`);
  console.log(`  - Planning: ${recommendations.estimatedTimeline.planning} days`);
  console.log(`  - Implementation: ${recommendations.estimatedTimeline.implementation} days`);
  console.log(`  - Testing: ${recommendations.estimatedTimeline.testing} days`);
}

console.log('\n📊 5. Generating Phase 1 Baseline Report...\n');

const baseline = tracker.generateBaseline();
console.log('Baseline Metrics Generated:');
console.log(`✓ Setup Success Rate: ${(baseline.setupSuccessRate * 100).toFixed(1)}%`);
console.log(`✓ Average Setup Time: ${baseline.averageSetupTime}s`);
console.log(`✓ Overall Health Score: ${baseline.overallHealthScores.overall.toFixed(1)}/100`);

if (baseline.topIssues.length > 0) {
  console.log('\nTop Issues Identified:');
  baseline.topIssues.forEach(issue => {
    console.log(`  • [${issue.severity.toUpperCase()}] ${issue.description}`);
  });
}

console.log('\n💾 6. Saving Research Data...\n');

// Save all data
const researchFile = collector.saveData();
const analyticsFile = tracker.saveData();

console.log(`✓ Research data saved to: ${researchFile}`);
console.log(`✓ Analytics data saved to: ${analyticsFile}`);

// Generate comprehensive Phase 1 report
const phase1Report = {
  summary: {
    totalPainPoints: collector.getPainPoints().length,
    totalWorkflows: collector.getWorkflows().length,
    setupSuccessRate: baseline.setupSuccessRate,
    topOpportunities: opportunities.length,
    overallHealthScore: baseline.overallHealthScores.overall
  },
  painPoints: collector.getPainPoints(),
  workflows: collector.getWorkflows(),
  baseline: baseline,
  topOpportunities: opportunities,
  quickWins: assessor.rankQuickWins(opportunities),
  personas: classifier.getPersonas(),
  generatedAt: new Date().toISOString()
};

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '../data/ux-research/phase1-complete-report.json');
fs.writeFileSync(reportPath, JSON.stringify(phase1Report, null, 2));

console.log(`✓ Complete Phase 1 report saved to: ${reportPath}`);

console.log('\n🎉 Phase 1 Implementation Complete!');
console.log('\nKey Deliverables Generated:');
console.log(`  • ${phase1Report.summary.totalPainPoints} pain points collected and analyzed`);
console.log(`  • ${phase1Report.summary.totalWorkflows} user workflows documented`);
console.log(`  • Baseline metrics established with ${(phase1Report.summary.setupSuccessRate * 100).toFixed(1)}% setup success rate`);
console.log(`  • ${phase1Report.summary.topOpportunities} improvement opportunities identified`);
console.log(`  • User personas defined and classification system operational`);
console.log(`  • Quick win assessment framework implemented`);

console.log('\nNext Steps:');
console.log('  • Review Phase 1 report and validate findings');
console.log('  • Begin Phase 2: Quick Wins & Foundation implementation');
console.log('  • Use /dev command to implement top-priority improvements');
console.log('  • Continue collecting user feedback and analytics data');

console.log('\n' + '='.repeat(50));
console.log('Phase 1 UX Research & Baseline System Demo Complete! 🚀');