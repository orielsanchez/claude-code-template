/**
 * Phase 4.3: Personalized Onboarding
 * Provides experience level detection and customized onboarding flows
 */

const fs = require('fs');
const path = require('path');

class PersonalizedOnboarding {
  constructor(sharedData = {}) {
    this.userId = sharedData.userId || 'default-user';
    this.preferences = sharedData.preferences || {};
    this.dataDir = path.join(__dirname, '../../data/accessibility-personalization');
    this.experienceLevels = ['beginner', 'intermediate', 'expert'];
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getUserId() {
    return this.userId;
  }

  async detectExperienceLevel(patterns) {
    const indicators = [];
    let score = 0;
    
    // Analyze command usage patterns
    const advancedCommands = ['/dev', '/debug', '/ship', '/refactor'];
    const basicCommands = ['/help', '/explore'];
    
    const advancedUsage = patterns.commandsUsed.filter(cmd => 
      advancedCommands.includes(cmd)
    ).length;
    
    const basicUsage = patterns.commandsUsed.filter(cmd => 
      basicCommands.includes(cmd)
    ).length;
    
    // Score based on command sophistication
    if (advancedUsage > basicUsage) {
      score += 30;
      indicators.push('Uses advanced commands frequently');
    } else {
      score -= 10;
      indicators.push('Primarily uses basic commands');
    }
    
    // Score based on error rate
    if (patterns.errors < 5) {
      score += 25;
      indicators.push('Low error rate');
    } else if (patterns.errors > 10) {
      score -= 15;
      indicators.push('High error rate');
    }
    
    // Score based on success rate
    if (patterns.successRate > 0.9) {
      score += 25;
      indicators.push('High success rate');
    } else if (patterns.successRate < 0.7) {
      score -= 20;
      indicators.push('Lower success rate');
    }
    
    // Score based on session efficiency
    if (patterns.averageSessionTime < 600) { // 10 minutes
      score += 20;
      indicators.push('Efficient session times');
    } else if (patterns.averageSessionTime > 1200) { // 20 minutes
      score -= 10;
      indicators.push('Longer session times');
    }
    
    // Score based on help usage
    if (patterns.helpUsage === 'rare') {
      score += 15;
      indicators.push('Self-sufficient with minimal help');
    } else if (patterns.helpUsage === 'frequent') {
      score -= 15;
      indicators.push('Frequent help usage');
    }
    
    // Determine level and confidence
    let level, confidence;
    if (score >= 60) {
      level = 'expert';
      confidence = Math.min(0.95, (score - 60) / 40 + 0.8);
    } else if (score >= 20) {
      level = 'intermediate';
      confidence = Math.min(0.85, (score - 20) / 40 + 0.6);
    } else {
      level = 'beginner';
      confidence = Math.min(0.90, (20 - score) / 30 + 0.7);
    }
    
    const recommendations = this.generateRecommendations(level, indicators);
    
    return {
      level,
      confidence: Math.round(confidence * 100) / 100,
      indicators,
      recommendations
    };
  }

  generateRecommendations(level, indicators) {
    const recommendations = [];
    
    switch (level) {
      case 'beginner':
        recommendations.push('Start with guided tutorials');
        recommendations.push('Use verbose output mode');
        recommendations.push('Enable all help prompts');
        break;
      case 'intermediate':
        recommendations.push('Try advanced workflow commands');
        recommendations.push('Explore automation features');
        recommendations.push('Customize your development environment');
        break;
      case 'expert':
        recommendations.push('Use streamlined interfaces');
        recommendations.push('Leverage scripting and automation');
        recommendations.push('Contribute to system improvements');
        break;
    }
    
    return recommendations;
  }

  async customizeOnboardingFlow(accessibilityNeeds) {
    const steps = [];
    const accessibility = {
      outputFormat: 'human',
      announcements: false,
      visualElements: true
    };
    
    // Customize based on accessibility needs
    if (accessibilityNeeds.screenReader) {
      accessibility.outputFormat = 'structured';
      accessibility.announcements = true;
      accessibility.visualElements = false;
      
      steps.push({
        type: 'accessibility-setup',
        title: 'Screen Reader Configuration',
        description: 'Configure optimal settings for screen reader usage',
        screenReaderOptimized: true,
        actions: [
          'Enable structured output format',
          'Configure semantic announcements',
          'Set up keyboard navigation'
        ]
      });
    }
    
    if (accessibilityNeeds.highContrast) {
      accessibility.theme = 'high-contrast';
      
      steps.push({
        type: 'theme-setup',
        title: 'High Contrast Setup',
        description: 'Configure high contrast theme for better visibility',
        highContrastMode: true,
        actions: [
          'Apply high contrast color scheme',
          'Increase text size if needed',
          'Validate color contrast ratios'
        ]
      });
    }
    
    if (accessibilityNeeds.reducedMotion) {
      steps.push({
        type: 'motion-setup',
        title: 'Reduced Motion Settings',
        description: 'Disable animations and motion effects',
        actions: [
          'Disable progress animations',
          'Use static status indicators',
          'Simplify visual transitions'
        ]
      });
    }
    
    // Add common onboarding steps
    steps.push({
      type: 'preference-setup',
      title: 'Personal Preferences',
      description: 'Set up your personal development preferences',
      actions: [
        'Choose default output format',
        'Select preferred verbosity level',
        'Configure workspace layout'
      ]
    });
    
    const estimatedDuration = this.calculateEstimatedDuration(steps, accessibilityNeeds);
    
    return {
      steps,
      accessibility,
      estimatedDuration
    };
  }

  calculateEstimatedDuration(steps, accessibilityNeeds) {
    let baseTime = steps.length * 2; // 2 minutes per step base
    
    if (accessibilityNeeds.screenReader) {
      baseTime += 5; // Additional time for screen reader setup
    }
    
    return `${baseTime}-${baseTime + 5} minutes`;
  }

  async integrateWithResearch(existingResearch) {
    const addressedPainPoints = [];
    
    // Address accessibility pain points
    existingResearch.painPoints.forEach(painPoint => {
      if (painPoint.category === 'accessibility') {
        let solution = 'Generic accessibility improvement';
        let implemented = true;
        
        if (painPoint.description.includes('color contrast')) {
          solution = 'High contrast theme with WCAG AA compliance';
        } else if (painPoint.description.includes('screen reader')) {
          solution = 'Structured output format optimized for screen readers';
        }
        
        addressedPainPoints.push({
          painPoint: painPoint.description,
          solution,
          implemented
        });
      }
    });
    
    // Generate persona adaptations
    const personaAdaptations = {};
    existingResearch.userPersonas.forEach(persona => {
      personaAdaptations[persona.id] = this.generatePersonaAdaptations(persona);
    });
    
    // Prioritize features based on research
    const prioritizedFeatures = this.prioritizeFeatures(existingResearch);
    
    return {
      addressedPainPoints,
      personaAdaptations,
      prioritizedFeatures
    };
  }

  generatePersonaAdaptations(persona) {
    const adaptations = {
      onboardingPath: [],
      recommendedSettings: {},
      supportLevel: 'standard'
    };
    
    if (persona.traits.includes('screen-reader')) {
      adaptations.onboardingPath.push('accessibility-first-setup');
      adaptations.recommendedSettings.outputFormat = 'structured';
      adaptations.supportLevel = 'enhanced';
    }
    
    if (persona.traits.includes('expert')) {
      adaptations.onboardingPath.push('advanced-setup');
      adaptations.recommendedSettings.verbosity = 'minimal';
      adaptations.supportLevel = 'minimal';
    }
    
    return adaptations;
  }

  prioritizeFeatures(research) {
    const features = [
      { name: 'High Contrast Theme', priority: 'high', category: 'accessibility' },
      { name: 'Screen Reader Support', priority: 'high', category: 'accessibility' },
      { name: 'Keyboard Navigation', priority: 'medium', category: 'accessibility' },
      { name: 'Custom Themes', priority: 'low', category: 'personalization' }
    ];
    
    // Boost priority based on pain points
    research.painPoints.forEach(painPoint => {
      if (painPoint.severity === 'high') {
        features.forEach(feature => {
          if (feature.category === painPoint.category) {
            feature.priority = 'critical';
          }
        });
      }
    });
    
    return features.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async adaptHelpContent(topic, experienceLevel) {
    const baseContent = this.getBaseHelpContent(topic);
    
    const adaptedContent = {
      overview: '',
      steps: [],
      examples: []
    };
    
    switch (experienceLevel) {
      case 'beginner':
        adaptedContent.overview = `Introduction to ${topic}: ${baseContent.overview}`;
        adaptedContent.steps = this.expandStepsForBeginners(baseContent.steps);
        adaptedContent.examples = baseContent.examples.map(ex => ({
          ...ex,
          explanation: `Detailed explanation: ${ex.explanation}`
        }));
        break;
        
      case 'intermediate':
        adaptedContent.overview = baseContent.overview;
        adaptedContent.steps = baseContent.steps;
        adaptedContent.examples = baseContent.examples;
        break;
        
      case 'expert':
        adaptedContent.overview = `Quick reference for ${topic}`;
        adaptedContent.steps = this.summarizeStepsForExperts(baseContent.steps);
        adaptedContent.examples = baseContent.examples.slice(0, 2); // Fewer examples
        break;
    }
    
    const interactionStyle = experienceLevel === 'beginner' ? 'guided' : 
                           experienceLevel === 'expert' ? 'reference' : 'interactive';
    
    const estimatedTime = experienceLevel === 'expert' ? '30 seconds' :
                         experienceLevel === 'beginner' ? '5 minutes' : '2 minutes';
    
    return {
      topic,
      experienceLevel,
      content: adaptedContent,
      interactionStyle,
      estimatedTime
    };
  }

  getBaseHelpContent(topic) {
    return {
      overview: 'Basic workflow for managing code changes with Git',
      steps: [
        'Check current status',
        'Stage your changes', 
        'Create a commit',
        'Push to remote',
        'Create pull request'
      ],
      examples: [
        { command: 'git status', explanation: 'Check what files have changed' },
        { command: 'git add .', explanation: 'Stage all changes' }
      ]
    };
  }

  expandStepsForBeginners(steps) {
    return steps.flatMap(step => {
      switch (step) {
        case 'Check current status':
          return [
            'Open your terminal or command prompt',
            'Navigate to your project directory',
            'Run git status to see current state'
          ];
        case 'Stage your changes':
          return [
            'Review the files that have changed',
            'Decide which changes to include',
            'Use git add to stage files'
          ];
        default:
          return [step];
      }
    });
  }

  summarizeStepsForExperts(steps) {
    return [
      'Review and stage changes',
      'Commit with message',
      'Push and create PR'
    ];
  }

  async integrateWithExistingSystems(systems) {
    const { uxResearch, commandDiscovery, interactiveFeatures } = systems;
    
    // Determine experience level from existing data
    let experienceLevel = 'intermediate';
    if (interactiveFeatures.helpUsage === 'frequent') {
      experienceLevel = 'beginner';
    } else if (commandDiscovery.recentCommands.includes('/debug') || 
               commandDiscovery.recentCommands.includes('/refactor')) {
      experienceLevel = 'expert';
    }
    
    // Generate recommended settings based on persona
    const recommendedSettings = {};
    if (uxResearch.userPersonas.some(p => p.id === 'accessibility-focused')) {
      recommendedSettings.accessibility = {
        screenReader: true,
        highContrast: true,
        structuredOutput: true
      };
    }
    
    // Create onboarding path
    const onboardingPath = [
      'welcome-and-assessment',
      'core-features-introduction',
      'hands-on-practice'
    ];
    
    if (experienceLevel === 'beginner') {
      onboardingPath.unshift('basics-tutorial');
    } else if (experienceLevel === 'expert') {
      onboardingPath.push('advanced-customization');
    }
    
    return {
      experienceLevel,
      recommendedSettings,
      onboardingPath
    };
  }
}

module.exports = PersonalizedOnboarding;