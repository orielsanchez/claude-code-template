/**
 * TDD Tests for Phase 1: UX Research & Baseline Implementation
 * 
 * These tests define the behavior for:
 * - User research data collection system
 * - Analytics tracking for setup success and command usage
 * - User persona classification
 * - Quick win opportunity assessment
 */

const fs = require('fs');
const path = require('path');

// Import the modules we're going to implement
const UXResearchCollector = require('../lib/ux-research/research-collector');
const AnalyticsTracker = require('../lib/ux-research/analytics-tracker');
const UserPersonaClassifier = require('../lib/ux-research/user-persona-classifier');
const QuickWinAssessor = require('../lib/ux-research/quick-win-assessor');

describe('Phase 1: UX Research & Baseline Systems', () => {
  
  beforeEach(() => {
    // Clean up any test data files
    const testDataDir = path.join(__dirname, '../data/ux-research');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('UXResearchCollector', () => {
    let collector;

    beforeEach(() => {
      collector = new UXResearchCollector();
    });

    test('should collect user pain points with structured data', () => {
      const painPoint = {
        category: 'onboarding',
        severity: 'high',
        description: 'README too long and overwhelming for new users',
        userType: 'new_user',
        frequency: 'common'
      };

      collector.addPainPoint(painPoint);
      const painPoints = collector.getPainPoints();

      expect(painPoints).toHaveLength(1);
      expect(painPoints[0]).toMatchObject(painPoint);
      expect(painPoints[0]).toHaveProperty('timestamp');
      expect(painPoints[0]).toHaveProperty('id');
    });

    test('should track user workflow patterns', () => {
      const workflow = {
        userType: 'experienced',
        steps: ['clone_repo', 'read_claude_md', 'run_dev_command'],
        timeSpent: 180, // seconds
        successfulCompletion: true,
        dropOffPoint: null
      };

      collector.recordWorkflow(workflow);
      const workflows = collector.getWorkflows();

      expect(workflows).toHaveLength(1);
      expect(workflows[0]).toMatchObject(workflow);
      expect(workflows[0]).toHaveProperty('sessionId');
    });

    test('should generate user journey maps for different personas', () => {
      // Add sample data for journey map generation
      collector.addPainPoint({
        category: 'setup',
        userType: 'new_user',
        description: 'Multiple setup options cause decision paralysis'
      });

      collector.recordWorkflow({
        userType: 'new_user',
        steps: ['visit_readme', 'confused_by_options', 'abandon'],
        successfulCompletion: false,
        dropOffPoint: 'option_selection'
      });

      const journeyMap = collector.generateJourneyMap('new_user');

      expect(journeyMap).toHaveProperty('persona', 'new_user');
      expect(journeyMap).toHaveProperty('stages');
      expect(journeyMap).toHaveProperty('painPoints');
      expect(journeyMap).toHaveProperty('opportunities');
      expect(journeyMap.stages).toBeInstanceOf(Array);
    });

    test('should identify top 3 high-impact improvement opportunities', () => {
      // Add various pain points with different impact scores
      collector.addPainPoint({
        category: 'onboarding',
        severity: 'high',
        frequency: 'very_common',
        description: 'README overwhelms new users'
      });

      collector.addPainPoint({
        category: 'command_discovery',
        severity: 'medium',
        frequency: 'common',
        description: 'Hard to discover available commands'
      });

      collector.addPainPoint({
        category: 'setup',
        severity: 'high',
        frequency: 'common',
        description: 'Setup script lacks progress feedback'
      });

      const opportunities = collector.getTopOpportunities(3);

      expect(opportunities).toHaveLength(3);
      expect(opportunities[0]).toHaveProperty('impactScore');
      expect(opportunities[0]).toHaveProperty('category');
      expect(opportunities[0]).toHaveProperty('description');
      // Should be sorted by impact score (highest first)
      expect(opportunities[0].impactScore).toBeGreaterThanOrEqual(opportunities[1].impactScore);
    });

    test('should persist research data to file system', () => {
      collector.addPainPoint({
        category: 'test',
        description: 'test pain point'
      });

      collector.saveData();

      const dataPath = path.join(__dirname, '../data/ux-research/research-data.json');
      expect(fs.existsSync(dataPath)).toBe(true);

      const savedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      expect(savedData).toHaveProperty('painPoints');
      expect(savedData.painPoints).toHaveLength(1);
    });
  });

  describe('AnalyticsTracker', () => {
    let tracker;

    beforeEach(() => {
      tracker = new AnalyticsTracker();
    });

    test('should track setup success rates with context', () => {
      tracker.trackSetupAttempt({
        setupType: 'one_line_curl',
        success: true,
        duration: 45, // seconds
        userAgent: 'bash/5.0',
        errors: []
      });

      tracker.trackSetupAttempt({
        setupType: 'manual_setup',
        success: false,
        duration: 180,
        userAgent: 'bash/4.0',
        errors: ['git_not_found']
      });

      const metrics = tracker.getSetupMetrics();

      expect(metrics.totalAttempts).toBe(2);
      expect(metrics.successRate).toBe(0.5);
      expect(metrics.averageSuccessDuration).toBe(45);
      expect(metrics.commonErrors).toContain('git_not_found');
    });

    test('should track command usage patterns', () => {
      tracker.trackCommandUsage('/dev', {
        success: true,
        duration: 120,
        userType: 'experienced',
        context: 'new_feature'
      });

      tracker.trackCommandUsage('/plan', {
        success: true,
        duration: 300,
        userType: 'new_user',
        context: 'first_project'
      });

      const usage = tracker.getCommandUsage();

      expect(usage['/dev']).toHaveProperty('totalUses', 1);
      expect(usage['/dev']).toHaveProperty('successRate', 1);
      expect(usage['/dev']).toHaveProperty('averageDuration', 120);
      expect(usage['/plan']).toHaveProperty('totalUses', 1);
    });

    test('should benchmark documentation engagement metrics', () => {
      tracker.trackDocumentationAccess('README.md', {
        timeSpent: 120,
        scrollDepth: 0.3, // Read 30% of document
        userType: 'new_user',
        bounced: true // Left without action
      });

      tracker.trackDocumentationAccess('CLAUDE.md', {
        timeSpent: 300,
        scrollDepth: 0.8,
        userType: 'experienced',
        bounced: false
      });

      const engagement = tracker.getDocumentationMetrics();

      expect(engagement['README.md']).toHaveProperty('averageTimeSpent', 120);
      expect(engagement['README.md']).toHaveProperty('averageScrollDepth', 0.3);
      expect(engagement['README.md']).toHaveProperty('bounceRate', 1);
      expect(engagement['CLAUDE.md']).toHaveProperty('bounceRate', 0);
    });

    test('should provide baseline metrics for comparison', () => {
      // Add sample data
      tracker.trackSetupAttempt({ success: true, duration: 60 });
      tracker.trackSetupAttempt({ success: false, duration: 180 });
      tracker.trackCommandUsage('/help', { success: true, duration: 30 });

      const baseline = tracker.generateBaseline();

      expect(baseline).toHaveProperty('setupSuccessRate');
      expect(baseline).toHaveProperty('averageSetupTime');
      expect(baseline).toHaveProperty('commandUsageDistribution');
      expect(baseline).toHaveProperty('documentationEngagement');
      expect(baseline).toHaveProperty('generatedAt');
      expect(new Date(baseline.generatedAt)).toBeInstanceOf(Date);
    });
  });

  describe('UserPersonaClassifier', () => {
    let classifier;

    beforeEach(() => {
      classifier = new UserPersonaClassifier();
    });

    test('should define standard user personas with characteristics', () => {
      const personas = classifier.getPersonas();

      expect(personas).toHaveProperty('new_user');
      expect(personas).toHaveProperty('experienced_developer');
      expect(personas).toHaveProperty('team_lead');

      const newUser = personas.new_user;
      expect(newUser).toHaveProperty('characteristics');
      expect(newUser).toHaveProperty('goals');
      expect(newUser).toHaveProperty('painPoints');
      expect(newUser).toHaveProperty('preferredWorkflows');
    });

    test('should classify users based on behavior patterns', () => {
      const userBehavior = {
        setupTime: 300, // Long setup time
        commandsUsed: ['/help', '/plan'],
        documentationAccessed: ['README.md', 'CLAUDE.md'],
        timeSpentReading: 600,
        errorsEncountered: 3,
        askedForHelp: true
      };

      const classification = classifier.classifyUser(userBehavior);

      expect(classification).toHaveProperty('primaryPersona');
      expect(classification).toHaveProperty('confidence');
      expect(classification).toHaveProperty('reasoning');
      expect(classification.primaryPersona).toBe('new_user');
      expect(classification.confidence).toBeGreaterThan(0.7);
    });

    test('should update persona definitions based on research data', () => {
      const researchData = {
        painPoints: [
          { userType: 'new_user', category: 'onboarding', frequency: 'very_common' }
        ],
        workflows: [
          { userType: 'new_user', steps: ['struggle', 'ask_help'], successfulCompletion: false }
        ]
      };

      classifier.updatePersonasFromResearch(researchData);
      const updatedPersonas = classifier.getPersonas();

      expect(updatedPersonas.new_user.painPoints).toContainEqual(
        expect.objectContaining({ category: 'onboarding' })
      );
    });
  });

  describe('QuickWinAssessor', () => {
    let assessor;

    beforeEach(() => {
      assessor = new QuickWinAssessor();
    });

    test('should assess implementation effort vs impact for opportunities', () => {
      const opportunity = {
        category: 'documentation',
        description: 'Simplify README structure',
        painPoints: [
          { severity: 'high', frequency: 'very_common' },
          { severity: 'medium', frequency: 'common' }
        ],
        affectedUsers: ['new_user', 'experienced_developer']
      };

      const assessment = assessor.assessOpportunity(opportunity);

      expect(assessment).toHaveProperty('impactScore');
      expect(assessment).toHaveProperty('effortEstimate');
      expect(assessment).toHaveProperty('quickWinScore');
      expect(assessment).toHaveProperty('recommendedPriority');
      expect(assessment.impactScore).toBeGreaterThan(0);
      expect(assessment.effortEstimate).toBeGreaterThan(0);
    });

    test('should rank opportunities by quick win potential', () => {
      const opportunities = [
        {
          description: 'Add progress indicators to setup',
          category: 'setup',
          impactScore: 8,
          effortEstimate: 3
        },
        {
          description: 'Redesign entire architecture',
          category: 'architecture', 
          impactScore: 9,
          effortEstimate: 10
        },
        {
          description: 'Fix typo in README',
          category: 'documentation',
          impactScore: 2,
          effortEstimate: 1
        }
      ];

      const ranked = assessor.rankQuickWins(opportunities);

      expect(ranked).toHaveLength(3);
      // Setup enhancement should rank highest (high impact, low effort)
      expect(ranked[0].description).toContain('setup');
      expect(ranked[0]).toHaveProperty('quickWinScore');
    });

    test('should generate actionable recommendations', () => {
      const opportunity = {
        category: 'onboarding',
        description: 'README overwhelms new users',
        painPoints: [{ severity: 'high', frequency: 'very_common' }]
      };

      const recommendations = assessor.generateRecommendations(opportunity);

      expect(recommendations).toHaveProperty('actionItems');
      expect(recommendations).toHaveProperty('successMetrics');
      expect(recommendations).toHaveProperty('estimatedTimeline');
      expect(recommendations.actionItems).toBeInstanceOf(Array);
      expect(recommendations.actionItems.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('should generate complete Phase 1 deliverables', async () => {
      const collector = new UXResearchCollector();
      const tracker = new AnalyticsTracker();
      const assessor = new QuickWinAssessor();

      // Simulate collecting research data
      collector.addPainPoint({
        category: 'onboarding',
        severity: 'high',
        frequency: 'very_common',
        description: 'README too complex for newcomers'
      });

      tracker.trackSetupAttempt({ success: false, duration: 300 });
      tracker.trackSetupAttempt({ success: true, duration: 60 });

      // Generate all Phase 1 deliverables
      const painPoints = collector.getPainPoints();
      const baseline = tracker.generateBaseline();
      const opportunities = collector.getTopOpportunities(3);
      const quickWins = assessor.rankQuickWins(opportunities);

      // Verify we have all required deliverables
      expect(painPoints).toBeInstanceOf(Array);
      expect(baseline).toHaveProperty('setupSuccessRate');
      expect(opportunities.length).toBeGreaterThan(0); // Should have opportunities based on data
      expect(quickWins).toBeInstanceOf(Array);

      // Should be able to save comprehensive report
      const phase1Report = {
        painPoints,
        baseline,
        topOpportunities: opportunities,
        quickWins,
        generatedAt: new Date().toISOString()
      };

      expect(phase1Report).toHaveProperty('painPoints');
      expect(phase1Report).toHaveProperty('baseline');
      expect(phase1Report).toHaveProperty('topOpportunities');
      expect(phase1Report).toHaveProperty('quickWins');
    });
  });
});