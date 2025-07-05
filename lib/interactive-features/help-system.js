/**
 * Layered Help System
 * 
 * Provides progressive disclosure help with:
 * - Three-tier help levels (quick → detailed → tutorial)
 * - Context-sensitive content generation
 * - Interactive tutorial flows with validation
 * - Usage analytics and content optimization
 * 
 * Part of Phase 3: Advanced Interactive Features
 */

const fs = require('fs');
const path = require('path');

class LayeredHelpSystem {
  constructor(sharedData = {}) {
    this.userId = sharedData.userId || 'default-user';
    this.projectId = sharedData.projectId || 'default-project';
    this.preferences = sharedData.preferences || {};
    this.dataDir = path.join(__dirname, '../../data/interactive-features');
    this.usageFile = path.join(this.dataDir, `${this.userId}-help-usage.json`);
    this.analytics = {
      popularTopics: [],
      effectiveLevels: {},
      averageTimeSpent: {},
      helpfulnessRatings: {}
    };
    this.activeTutorials = new Map();
    this.ensureDataDir();
    this.loadAnalytics();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getUserId() {
    return this.userId;
  }

  /**
   * Get quick help for a topic (30 second read)
   * @param {string} topic - Help topic to retrieve
   * @returns {Promise<Object>} Quick help with content and navigation
   */
  async getQuickHelp(topic) {
    if (!topic || typeof topic !== 'string') {
      throw new Error('Invalid topic: string required');
    }

    const helpContent = this.getHelpContent(topic);
    
    return {
      topic,
      level: 'quick',
      content: helpContent.quick || `Quick help for ${topic}: Basic overview and key commands.`,
      nextLevel: 'detailed',
      estimatedReadTime: '30 seconds'
    };
  }

  async getDetailedHelp(topic) {
    const helpContent = this.getHelpContent(topic);
    
    return {
      topic,
      level: 'detailed',
      content: helpContent.detailed || `Detailed help for ${topic}: Comprehensive explanation with examples.`,
      sections: helpContent.sections || ['Overview', 'Usage', 'Examples', 'Troubleshooting'],
      nextLevel: 'tutorial',
      estimatedReadTime: '3 minutes'
    };
  }

  async getTutorial(topic) {
    const helpContent = this.getHelpContent(topic);
    
    return {
      topic,
      level: 'tutorial',
      steps: helpContent.tutorialSteps || [
        { instruction: 'Step 1: Introduction', action: 'Read overview' },
        { instruction: 'Step 2: Practice', action: 'Try example command' },
        { instruction: 'Step 3: Apply', action: 'Use in your project' }
      ],
      interactive: true,
      estimatedDuration: '10 minutes'
    };
  }

  /**
   * Get contextual help based on current user situation
   * @param {Object} context - Current context with command, project type, errors, etc.
   * @returns {Promise<Object>} Contextual help with relevant topics and actions
   */
  async getContextualHelp(context) {
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid context: object required');
    }

    const relevantTopics = [];
    const quickActions = [];
    
    // Determine relevant topics based on context
    if (context.currentCommand === '/dev') {
      relevantTopics.push('development-workflow', 'tdd-basics', 'testing');
      quickActions.push('Run tests', 'Check quality', 'Commit changes');
    }

    if (context.projectType === 'nodejs') {
      relevantTopics.push('nodejs-setup', 'npm-commands', 'debugging-node');
    }

    if (context.lastError) {
      relevantTopics.push('error-recovery', 'troubleshooting');
      quickActions.push('View error details', 'Get recovery steps');
    }

    // Determine suggested level based on user experience
    const suggestedLevel = context.userExperience === 'beginner' ? 'tutorial' :
                          context.userExperience === 'intermediate' ? 'detailed' : 'quick';

    return {
      relevantTopics,
      quickActions,
      suggestedLevel,
      customContent: `Context-specific help for ${context.currentCommand || 'current situation'}`
    };
  }

  async recordUsage(usage) {
    // Update popular topics
    const topicIndex = this.analytics.popularTopics.findIndex(t => t.topic === usage.topic);
    if (topicIndex >= 0) {
      this.analytics.popularTopics[topicIndex].count++;
    } else {
      this.analytics.popularTopics.push({ topic: usage.topic, count: 1 });
    }

    // Update effective levels
    if (!this.analytics.effectiveLevels[usage.level]) {
      this.analytics.effectiveLevels[usage.level] = { total: 0, helpful: 0 };
    }
    this.analytics.effectiveLevels[usage.level].total++;
    if (usage.helpful) {
      this.analytics.effectiveLevels[usage.level].helpful++;
    }

    // Update average time spent
    if (!this.analytics.averageTimeSpent[usage.topic]) {
      this.analytics.averageTimeSpent[usage.topic] = { total: 0, count: 0 };
    }
    this.analytics.averageTimeSpent[usage.topic].total += usage.timeSpent;
    this.analytics.averageTimeSpent[usage.topic].count++;

    // Update helpfulness ratings
    if (!this.analytics.helpfulnessRatings[usage.topic]) {
      this.analytics.helpfulnessRatings[usage.topic] = { total: 0, count: 0 };
    }
    this.analytics.helpfulnessRatings[usage.topic].total += usage.helpful ? 1 : 0;
    this.analytics.helpfulnessRatings[usage.topic].count++;

    this.saveAnalytics();
  }

  getUsageAnalytics() {
    return this.analytics;
  }

  async startInteractiveTutorial(tutorialId) {
    const tutorials = {
      'first-feature-development': {
        id: tutorialId,
        name: 'First Feature Development',
        steps: [
          {
            instruction: 'Start by writing a failing test that defines your feature behavior',
            command: '/dev test add <feature-name>',
            validation: (input) => input.includes('test'),
            hints: ['Think about what your feature should do', 'Write specific test cases']
          },
          {
            instruction: 'Implement the minimal code to make your test pass',
            command: '/dev implement',
            validation: (input) => input.includes('implement'),
            hints: ['Keep it simple', 'Just make the test pass']
          },
          {
            instruction: 'Refactor your code while keeping tests green',
            command: '/dev refactor',
            validation: (input) => input.includes('refactor'),
            hints: ['Clean up code', 'Improve design', 'Tests protect you']
          }
        ]
      }
    };

    const tutorial = tutorials[tutorialId];
    if (!tutorial) {
      throw new Error(`Tutorial ${tutorialId} not found`);
    }

    const tutorialInstance = {
      ...tutorial,
      currentStep: 1,
      totalSteps: tutorial.steps.length,
      step: tutorial.steps[0],
      completeStep: async (success) => {
        if (success && tutorialInstance.currentStep < tutorialInstance.totalSteps) {
          tutorialInstance.currentStep++;
          tutorialInstance.step = tutorial.steps[tutorialInstance.currentStep - 1];
        }
        return tutorialInstance;
      }
    };

    this.activeTutorials.set(tutorialId, tutorialInstance);
    return tutorialInstance;
  }

  getHelpContent(topic) {
    const content = {
      'git-workflow': {
        quick: 'Git workflow: commit, push, pull, merge. Use /git for guided workflows.',
        detailed: 'Git workflow management with branch strategies, commit conventions, and collaboration patterns.',
        sections: ['Basic Commands', 'Branching', 'Merging', 'Collaboration'],
        tutorialSteps: [
          { instruction: 'Initialize or clone repository', action: 'git init or git clone' },
          { instruction: 'Make changes and commit', action: 'git add, git commit' },
          { instruction: 'Push and collaborate', action: 'git push, git pull' }
        ]
      }
    };

    return content[topic] || {
      quick: `Quick help for ${topic}`,
      detailed: `Detailed help for ${topic}`,
      sections: ['Overview'],
      tutorialSteps: [{ instruction: 'Basic usage', action: 'Try the command' }]
    };
  }

  loadAnalytics() {
    try {
      if (fs.existsSync(this.usageFile)) {
        this.analytics = JSON.parse(fs.readFileSync(this.usageFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Failed to load analytics:', error.message);
    }
  }

  saveAnalytics() {
    try {
      fs.writeFileSync(this.usageFile, JSON.stringify(this.analytics, null, 2));
    } catch (error) {
      console.warn('Failed to save analytics:', error.message);
    }
  }
}

module.exports = LayeredHelpSystem;