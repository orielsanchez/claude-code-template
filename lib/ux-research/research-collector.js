/**
 * UX Research Data Collector
 * Collects user pain points, workflows, and generates insights for UX improvements
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const BaseManager = require('../shared/base-manager');

class UXResearchCollector extends BaseManager {
  constructor(options = {}) {
    // Convert to BaseManager options pattern
    const baseOptions = {
      userId: options.userId || 'default-user',
      configManager: options.configManager,
      subDir: 'ux-research',
      pluginName: 'ux-research'
    };
    
    super(baseOptions);
    
    // UX Research specific properties
    this.painPoints = [];
    this.workflows = [];
  }

  /**
   * Add a user pain point with structured data
   */
  addPainPoint(painPoint) {
    const enrichedPainPoint = {
      ...painPoint,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    
    this.painPoints.push(enrichedPainPoint);
    return enrichedPainPoint;
  }

  /**
   * Get all collected pain points
   */
  getPainPoints() {
    return this.painPoints;
  }

  /**
   * Record a user workflow pattern
   */
  recordWorkflow(workflow) {
    const enrichedWorkflow = {
      ...workflow,
      sessionId: uuidv4(),
      timestamp: new Date().toISOString()
    };
    
    this.workflows.push(enrichedWorkflow);
    return enrichedWorkflow;
  }

  /**
   * Get all recorded workflows
   */
  getWorkflows() {
    return this.workflows;
  }

  /**
   * Generate user journey map for a specific persona
   */
  generateJourneyMap(userType) {
    const userPainPoints = this.painPoints.filter(p => p.userType === userType);
    const userWorkflows = this.workflows.filter(w => w.userType === userType);
    
    // Extract stages from workflows
    const allSteps = userWorkflows.flatMap(w => w.steps);
    const uniqueSteps = [...new Set(allSteps)];
    
    // Identify common drop-off points
    const dropOffPoints = userWorkflows
      .filter(w => !w.successfulCompletion && w.dropOffPoint)
      .map(w => w.dropOffPoint);
    
    // Generate opportunities from pain points and drop-offs
    const opportunities = userPainPoints.map(p => ({
      stage: this._inferStageFromPainPoint(p),
      opportunity: `Address: ${p.description}`,
      impact: this._calculateImpact(p)
    }));
    
    return {
      persona: userType,
      stages: uniqueSteps.map(step => ({
        name: step,
        description: this._generateStageDescription(step),
        painPoints: userPainPoints.filter(p => this._isPainPointRelevantToStage(p, step))
      })),
      painPoints: userPainPoints,
      opportunities: opportunities,
      commonDropOffs: dropOffPoints
    };
  }

  /**
   * Get top improvement opportunities ranked by impact
   */
  getTopOpportunities(limit = 3) {
    const opportunities = this.painPoints.map(painPoint => {
      const impactScore = this._calculateImpactScore(painPoint);
      
      return {
        id: painPoint.id,
        category: painPoint.category,
        description: painPoint.description,
        severity: painPoint.severity,
        frequency: painPoint.frequency,
        impactScore,
        userType: painPoint.userType
      };
    });
    
    // Sort by impact score (highest first) and return top N
    return opportunities
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, limit);
  }

  /**
   * Save all research data to file system
   */
  saveData() {
    try {
      const data = {
        painPoints: this.painPoints,
        workflows: this.workflows,
        savedAt: new Date().toISOString()
      };
      
      const filePath = path.join(this.dataDir, 'research-data.json');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      return filePath;
    } catch (error) {
      this.logError(error, { action: 'saveData', userId: this.userId });
      throw error;
    }
  }

  /**
   * Load research data from file system
   */
  loadData() {
    try {
      const filePath = path.join(this.dataDir, 'research-data.json');
      
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.painPoints = data.painPoints || [];
        this.workflows = data.workflows || [];
        return true;
      }
      
      return false;
    } catch (error) {
      this.logError(error, { action: 'loadData', userId: this.userId });
      return false;
    }
  }

  // Private helper methods
  
  _calculateImpactScore(painPoint) {
    const severityWeights = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    
    const frequencyWeights = {
      'rare': 1,
      'uncommon': 2,
      'common': 3,
      'very_common': 4
    };
    
    const severityScore = severityWeights[painPoint.severity] || 1;
    const frequencyScore = frequencyWeights[painPoint.frequency] || 1;
    
    return severityScore * frequencyScore * 10; // Scale up for better differentiation
  }

  _inferStageFromPainPoint(painPoint) {
    const categoryStageMap = {
      'onboarding': 'discovery',
      'setup': 'installation',
      'command_discovery': 'exploration',
      'documentation': 'learning',
      'error_handling': 'troubleshooting'
    };
    
    return categoryStageMap[painPoint.category] || 'general';
  }

  _calculateImpact(painPoint) {
    const score = this._calculateImpactScore(painPoint);
    if (score >= 30) return 'high';
    if (score >= 15) return 'medium';
    return 'low';
  }

  _generateStageDescription(step) {
    const descriptions = {
      'visit_readme': 'User visits the README to understand the project',
      'clone_repo': 'User clones the repository to their local machine',
      'read_claude_md': 'User reads the CLAUDE.md instructions',
      'run_dev_command': 'User executes their first /dev command',
      'confused_by_options': 'User is overwhelmed by multiple setup options',
      'abandon': 'User leaves without completing setup'
    };
    
    return descriptions[step] || `User performs: ${step}`;
  }

  _isPainPointRelevantToStage(painPoint, stage) {
    const relevanceMap = {
      'onboarding': ['visit_readme', 'confused_by_options'],
      'setup': ['clone_repo', 'run_setup'],
      'command_discovery': ['run_dev_command', 'explore_commands']
    };
    
    const relevantStages = relevanceMap[painPoint.category] || [];
    return relevantStages.includes(stage);
  }
}

module.exports = UXResearchCollector;