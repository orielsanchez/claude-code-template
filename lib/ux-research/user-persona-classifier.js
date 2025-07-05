/**
 * User Persona Classifier
 * Defines user personas and classifies users based on behavior patterns
 */

class UserPersonaClassifier {
  constructor() {
    this.personas = this._initializePersonas();
  }

  /**
   * Get all defined user personas
   */
  getPersonas() {
    return this.personas;
  }

  /**
   * Classify a user based on their behavior patterns
   */
  classifyUser(userBehavior) {
    const scores = {};
    
    for (const [personaType, persona] of Object.entries(this.personas)) {
      scores[personaType] = this._calculatePersonaScore(userBehavior, persona);
    }
    
    // Find the persona with the highest score
    const personaEntries = Object.entries(scores);
    const topPersona = personaEntries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    const [primaryPersona, confidence] = topPersona;
    
    return {
      primaryPersona,
      confidence: confidence / 100, // Normalize to 0-1
      reasoning: this._generateReasoning(userBehavior, primaryPersona),
      allScores: scores
    };
  }

  /**
   * Update persona definitions based on research data
   */
  updatePersonasFromResearch(researchData) {
    const { painPoints, workflows } = researchData;
    
    // Group pain points by user type
    const painPointsByUser = painPoints.reduce((acc, painPoint) => {
      if (!acc[painPoint.userType]) acc[painPoint.userType] = [];
      acc[painPoint.userType].push(painPoint);
      return acc;
    }, {});
    
    // Group workflows by user type
    const workflowsByUser = workflows.reduce((acc, workflow) => {
      if (!acc[workflow.userType]) acc[workflow.userType] = [];
      acc[workflow.userType].push(workflow);
      return acc;
    }, {});
    
    // Update each persona with new insights
    for (const userType of Object.keys(this.personas)) {
      if (painPointsByUser[userType]) {
        this._updatePersonaPainPoints(userType, painPointsByUser[userType]);
      }
      
      if (workflowsByUser[userType]) {
        this._updatePersonaWorkflows(userType, workflowsByUser[userType]);
      }
    }
  }

  /**
   * Add or update a custom persona
   */
  addPersona(personaType, personaData) {
    this.personas[personaType] = {
      ...personaData,
      lastUpdated: new Date().toISOString()
    };
  }

  // Private methods

  _initializePersonas() {
    return {
      new_user: {
        characteristics: [
          'First time with Claude Code',
          'Limited experience with AI development tools',
          'Needs guidance and clear instructions',
          'Prefers step-by-step processes'
        ],
        goals: [
          'Successfully set up the development environment',
          'Understand basic workflow concepts',
          'Complete first successful feature implementation',
          'Build confidence with the tool'
        ],
        painPoints: [
          'Information overload from documentation',
          'Uncertainty about which setup option to choose',
          'Fear of making mistakes or breaking things',
          'Difficulty understanding command relationships'
        ],
        preferredWorkflows: [
          'Guided tutorials with clear steps',
          'Progressive disclosure of features',
          'Frequent confirmation and validation',
          'Simple, single-purpose commands'
        ],
        behaviorPatterns: {
          setupTime: { min: 180, max: 600 }, // 3-10 minutes
          documentationTime: { min: 300, max: 900 }, // 5-15 minutes
          errorsBeforeSuccess: { min: 2, max: 8 },
          helpSeeking: 'high',
          commandsPerSession: { min: 1, max: 3 }
        }
      },
      
      experienced_developer: {
        characteristics: [
          'Familiar with development tools and workflows',
          'Has used AI assistants before',
          'Values efficiency and customization',
          'Comfortable with command-line interfaces'
        ],
        goals: [
          'Quickly integrate into existing workflow',
          'Discover advanced features and capabilities',
          'Optimize development productivity',
          'Customize tool behavior for specific needs'
        ],
        painPoints: [
          'Too much hand-holding in documentation',
          'Slow or inefficient default workflows',
          'Limited customization options',
          'Verbose output that slows them down'
        ],
        preferredWorkflows: [
          'Quick reference documentation',
          'Keyboard shortcuts and efficient commands',
          'Batch operations and automation',
          'Integration with existing tools'
        ],
        behaviorPatterns: {
          setupTime: { min: 30, max: 120 }, // 0.5-2 minutes
          documentationTime: { min: 60, max: 300 }, // 1-5 minutes
          errorsBeforeSuccess: { min: 0, max: 3 },
          helpSeeking: 'low',
          commandsPerSession: { min: 3, max: 10 }
        }
      },
      
      team_lead: {
        characteristics: [
          'Responsible for team productivity and quality',
          'Focuses on process and standardization',
          'Evaluates tools for team adoption',
          'Balances innovation with stability'
        ],
        goals: [
          'Evaluate tool suitability for team use',
          'Understand governance and quality features',
          'Plan team training and adoption strategy',
          'Ensure consistent development practices'
        ],
        painPoints: [
          'Unclear governance and permission models',
          'Difficulty assessing team readiness',
          'Limited visibility into team usage patterns',
          'Concerns about tool dependency'
        ],
        preferredWorkflows: [
          'Team-oriented documentation',
          'Policy and governance configuration',
          'Usage analytics and reporting',
          'Training and onboarding materials'
        ],
        behaviorPatterns: {
          setupTime: { min: 120, max: 300 }, // 2-5 minutes
          documentationTime: { min: 600, max: 1800 }, // 10-30 minutes
          errorsBeforeSuccess: { min: 1, max: 5 },
          helpSeeking: 'medium',
          commandsPerSession: { min: 2, max: 6 }
        }
      }
    };
  }

  _calculatePersonaScore(userBehavior, persona) {
    let score = 0;
    const patterns = persona.behaviorPatterns;
    
    // Score based on setup time
    if (this._isInRange(userBehavior.setupTime, patterns.setupTime)) {
      score += 25;
    } else {
      // Partial score based on how close it is
      score += this._calculateProximityScore(userBehavior.setupTime, patterns.setupTime, 25);
    }
    
    // Score based on documentation time
    if (userBehavior.timeSpentReading && patterns.documentationTime) {
      if (this._isInRange(userBehavior.timeSpentReading, patterns.documentationTime)) {
        score += 25;
      } else {
        score += this._calculateProximityScore(userBehavior.timeSpentReading, patterns.documentationTime, 25);
      }
    }
    
    // Score based on errors encountered
    if (userBehavior.errorsEncountered !== undefined && patterns.errorsBeforeSuccess) {
      if (this._isInRange(userBehavior.errorsEncountered, patterns.errorsBeforeSuccess)) {
        score += 20;
      } else {
        score += this._calculateProximityScore(userBehavior.errorsEncountered, patterns.errorsBeforeSuccess, 20);
      }
    }
    
    // Score based on help seeking behavior
    if (userBehavior.askedForHelp !== undefined) {
      const helpMatch = this._matchesHelpSeeking(userBehavior.askedForHelp, patterns.helpSeeking);
      score += helpMatch ? 15 : 5;
    }
    
    // Score based on commands used
    if (userBehavior.commandsUsed && patterns.commandsPerSession) {
      const commandCount = userBehavior.commandsUsed.length;
      if (this._isInRange(commandCount, patterns.commandsPerSession)) {
        score += 15;
      } else {
        score += this._calculateProximityScore(commandCount, patterns.commandsPerSession, 15);
      }
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  _isInRange(value, range) {
    return value >= range.min && value <= range.max;
  }

  _calculateProximityScore(value, range, maxScore) {
    const center = (range.min + range.max) / 2;
    const tolerance = (range.max - range.min) / 2;
    const distance = Math.abs(value - center);
    const normalizedDistance = Math.min(distance / tolerance, 2); // Cap at 2x tolerance
    return Math.max(0, maxScore * (1 - normalizedDistance / 2));
  }

  _matchesHelpSeeking(askedForHelp, pattern) {
    switch (pattern) {
      case 'high': return askedForHelp === true;
      case 'medium': return true; // Medium matches both
      case 'low': return askedForHelp === false;
      default: return false;
    }
  }

  _generateReasoning(userBehavior, primaryPersona) {
    const persona = this.personas[primaryPersona];
    const reasons = [];
    
    if (userBehavior.setupTime) {
      const timeRange = persona.behaviorPatterns.setupTime;
      if (this._isInRange(userBehavior.setupTime, timeRange)) {
        reasons.push(`Setup time (${userBehavior.setupTime}s) matches ${primaryPersona} pattern`);
      }
    }
    
    if (userBehavior.timeSpentReading) {
      const docRange = persona.behaviorPatterns.documentationTime;
      if (this._isInRange(userBehavior.timeSpentReading, docRange)) {
        reasons.push(`Documentation reading time matches ${primaryPersona} behavior`);
      }
    }
    
    if (userBehavior.errorsEncountered !== undefined) {
      const errorRange = persona.behaviorPatterns.errorsBeforeSuccess;
      if (this._isInRange(userBehavior.errorsEncountered, errorRange)) {
        reasons.push(`Error frequency typical of ${primaryPersona}`);
      }
    }
    
    if (userBehavior.askedForHelp !== undefined) {
      const helpPattern = persona.behaviorPatterns.helpSeeking;
      if (this._matchesHelpSeeking(userBehavior.askedForHelp, helpPattern)) {
        reasons.push(`Help-seeking behavior matches ${primaryPersona} pattern`);
      }
    }
    
    return reasons.length > 0 ? reasons.join('; ') : `Classified as ${primaryPersona} based on overall behavior pattern`;
  }

  _updatePersonaPainPoints(userType, painPoints) {
    if (!this.personas[userType]) return;
    
    const newPainPoints = painPoints.map(p => ({
      category: p.category,
      description: p.description,
      frequency: p.frequency,
      severity: p.severity,
      source: 'research_data'
    }));
    
    // Add unique pain points to the persona
    for (const newPain of newPainPoints) {
      const exists = this.personas[userType].painPoints.some(existing => 
        existing.category === newPain.category && 
        existing.description === newPain.description
      );
      
      if (!exists) {
        this.personas[userType].painPoints.push(newPain);
      }
    }
  }

  _updatePersonaWorkflows(userType, workflows) {
    if (!this.personas[userType]) return;
    
    // Analyze workflow patterns to update behavior patterns
    const successfulWorkflows = workflows.filter(w => w.successfulCompletion);
    const avgSteps = workflows.reduce((sum, w) => sum + w.steps.length, 0) / workflows.length;
    
    // Update command usage patterns based on workflows
    if (avgSteps) {
      this.personas[userType].behaviorPatterns.commandsPerSession = {
        min: Math.max(1, Math.floor(avgSteps * 0.7)),
        max: Math.ceil(avgSteps * 1.3)
      };
    }
    
    // Update common workflow preferences
    const commonSteps = workflows
      .flatMap(w => w.steps)
      .reduce((acc, step) => {
        acc[step] = (acc[step] || 0) + 1;
        return acc;
      }, {});
    
    const topSteps = Object.keys(commonSteps)
      .sort((a, b) => commonSteps[b] - commonSteps[a])
      .slice(0, 3);
    
    if (topSteps.length > 0) {
      this.personas[userType].commonWorkflowSteps = topSteps;
    }
  }
}

module.exports = UserPersonaClassifier;