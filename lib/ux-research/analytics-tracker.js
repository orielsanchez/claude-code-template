/**
 * Analytics Tracker for UX Metrics
 * Tracks setup success rates, command usage patterns, and documentation engagement
 */

const fs = require('fs');
const path = require('path');

class AnalyticsTracker {
  constructor() {
    this.setupAttempts = [];
    this.commandUsage = {};
    this.documentationAccess = {};
    this.dataDir = path.join(__dirname, '../../data/ux-research');
  }

  /**
   * Track a setup attempt with context and outcome
   */
  trackSetupAttempt(attempt) {
    const enrichedAttempt = {
      ...attempt,
      timestamp: new Date().toISOString(),
      id: this._generateId()
    };
    
    this.setupAttempts.push(enrichedAttempt);
    return enrichedAttempt;
  }

  /**
   * Get comprehensive setup metrics
   */
  getSetupMetrics() {
    const total = this.setupAttempts.length;
    const successful = this.setupAttempts.filter(a => a.success);
    const failed = this.setupAttempts.filter(a => !a.success);
    
    const successRate = total > 0 ? successful.length / total : 0;
    const averageSuccessDuration = successful.length > 0 
      ? successful.reduce((sum, a) => sum + a.duration, 0) / successful.length 
      : 0;
    
    const allErrors = failed.flatMap(a => a.errors || []);
    const errorCounts = allErrors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {});
    
    const commonErrors = Object.keys(errorCounts)
      .sort((a, b) => errorCounts[b] - errorCounts[a])
      .slice(0, 5);

    return {
      totalAttempts: total,
      successfulAttempts: successful.length,
      failedAttempts: failed.length,
      successRate,
      averageSuccessDuration,
      averageFailureDuration: failed.length > 0 
        ? failed.reduce((sum, a) => sum + a.duration, 0) / failed.length 
        : 0,
      commonErrors,
      errorCounts
    };
  }

  /**
   * Track command usage with context
   */
  trackCommandUsage(command, context) {
    if (!this.commandUsage[command]) {
      this.commandUsage[command] = {
        totalUses: 0,
        successful: 0,
        failed: 0,
        durations: [],
        contexts: []
      };
    }
    
    this.commandUsage[command].totalUses++;
    this.commandUsage[command].durations.push(context.duration);
    this.commandUsage[command].contexts.push({
      ...context,
      timestamp: new Date().toISOString()
    });
    
    if (context.success) {
      this.commandUsage[command].successful++;
    } else {
      this.commandUsage[command].failed++;
    }
  }

  /**
   * Get command usage statistics
   */
  getCommandUsage() {
    const result = {};
    
    for (const [command, data] of Object.entries(this.commandUsage)) {
      const avgDuration = data.durations.length > 0 
        ? data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length 
        : 0;
      
      result[command] = {
        totalUses: data.totalUses,
        successRate: data.totalUses > 0 ? data.successful / data.totalUses : 0,
        averageDuration: avgDuration,
        userTypes: this._extractUserTypes(data.contexts),
        commonContexts: this._extractCommonContexts(data.contexts)
      };
    }
    
    return result;
  }

  /**
   * Track documentation access and engagement
   */
  trackDocumentationAccess(document, metrics) {
    if (!this.documentationAccess[document]) {
      this.documentationAccess[document] = {
        totalAccesses: 0,
        timeSpents: [],
        scrollDepths: [],
        bounces: 0,
        accesses: []
      };
    }
    
    const docData = this.documentationAccess[document];
    docData.totalAccesses++;
    docData.timeSpents.push(metrics.timeSpent);
    docData.scrollDepths.push(metrics.scrollDepth);
    docData.accesses.push({
      ...metrics,
      timestamp: new Date().toISOString()
    });
    
    if (metrics.bounced) {
      docData.bounces++;
    }
  }

  /**
   * Get documentation engagement metrics
   */
  getDocumentationMetrics() {
    const result = {};
    
    for (const [document, data] of Object.entries(this.documentationAccess)) {
      const avgTimeSpent = data.timeSpents.length > 0 
        ? data.timeSpents.reduce((sum, t) => sum + t, 0) / data.timeSpents.length 
        : 0;
      
      const avgScrollDepth = data.scrollDepths.length > 0 
        ? data.scrollDepths.reduce((sum, d) => sum + d, 0) / data.scrollDepths.length 
        : 0;
      
      result[document] = {
        totalAccesses: data.totalAccesses,
        averageTimeSpent: avgTimeSpent,
        averageScrollDepth: avgScrollDepth,
        bounceRate: data.totalAccesses > 0 ? data.bounces / data.totalAccesses : 0,
        engagementScore: this._calculateEngagementScore(avgTimeSpent, avgScrollDepth)
      };
    }
    
    return result;
  }

  /**
   * Generate baseline metrics for future comparison
   */
  generateBaseline() {
    const setupMetrics = this.getSetupMetrics();
    const commandMetrics = this.getCommandUsage();
    const docMetrics = this.getDocumentationMetrics();
    
    // Calculate overall health scores
    const overallSetupHealth = setupMetrics.successRate * 100;
    const overallCommandHealth = this._calculateOverallCommandHealth(commandMetrics);
    const overallDocHealth = this._calculateOverallDocumentationHealth(docMetrics);
    
    return {
      generatedAt: new Date().toISOString(),
      setupSuccessRate: setupMetrics.successRate,
      averageSetupTime: setupMetrics.averageSuccessDuration,
      commandUsageDistribution: this._calculateCommandDistribution(commandMetrics),
      documentationEngagement: docMetrics,
      overallHealthScores: {
        setup: overallSetupHealth,
        commands: overallCommandHealth,
        documentation: overallDocHealth,
        overall: (overallSetupHealth + overallCommandHealth + overallDocHealth) / 3
      },
      topIssues: this._identifyTopIssues(setupMetrics, commandMetrics, docMetrics),
      sampleSize: {
        setupAttempts: setupMetrics.totalAttempts,
        commandUses: Object.values(commandMetrics).reduce((sum, cmd) => sum + cmd.totalUses, 0),
        documentationAccesses: Object.values(docMetrics).reduce((sum, doc) => sum + doc.totalAccesses, 0)
      }
    };
  }

  /**
   * Save analytics data to file system
   */
  saveData() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    const data = {
      setupAttempts: this.setupAttempts,
      commandUsage: this.commandUsage,
      documentationAccess: this.documentationAccess,
      savedAt: new Date().toISOString()
    };
    
    const filePath = path.join(this.dataDir, 'analytics-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return filePath;
  }

  // Private helper methods
  
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  _extractUserTypes(contexts) {
    const types = contexts.map(c => c.userType).filter(Boolean);
    return [...new Set(types)];
  }

  _extractCommonContexts(contexts) {
    const contextCounts = contexts.reduce((acc, c) => {
      acc[c.context] = (acc[c.context] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(contextCounts)
      .sort((a, b) => contextCounts[b] - contextCounts[a])
      .slice(0, 3);
  }

  _calculateEngagementScore(timeSpent, scrollDepth) {
    // Simple engagement score: time spent (up to 5 min) + scroll depth
    const timeScore = Math.min(timeSpent / 300, 1) * 50; // Max 50 points for 5 minutes
    const scrollScore = scrollDepth * 50; // Max 50 points for full scroll
    return timeScore + scrollScore;
  }

  _calculateOverallCommandHealth(commandMetrics) {
    const commands = Object.values(commandMetrics);
    if (commands.length === 0) return 0;
    
    const avgSuccessRate = commands.reduce((sum, cmd) => sum + cmd.successRate, 0) / commands.length;
    return avgSuccessRate * 100;
  }

  _calculateOverallDocumentationHealth(docMetrics) {
    const docs = Object.values(docMetrics);
    if (docs.length === 0) return 0;
    
    const avgEngagement = docs.reduce((sum, doc) => sum + doc.engagementScore, 0) / docs.length;
    return Math.min(avgEngagement, 100); // Cap at 100
  }

  _calculateCommandDistribution(commandMetrics) {
    const totalUses = Object.values(commandMetrics).reduce((sum, cmd) => sum + cmd.totalUses, 0);
    const distribution = {};
    
    for (const [command, data] of Object.entries(commandMetrics)) {
      distribution[command] = totalUses > 0 ? data.totalUses / totalUses : 0;
    }
    
    return distribution;
  }

  _identifyTopIssues(setupMetrics, commandMetrics, docMetrics) {
    const issues = [];
    
    if (setupMetrics.successRate < 0.8) {
      issues.push({
        type: 'setup',
        severity: 'high',
        description: `Low setup success rate: ${(setupMetrics.successRate * 100).toFixed(1)}%`
      });
    }
    
    for (const [command, data] of Object.entries(commandMetrics)) {
      if (data.successRate < 0.7) {
        issues.push({
          type: 'command',
          severity: 'medium',
          description: `${command} has low success rate: ${(data.successRate * 100).toFixed(1)}%`
        });
      }
    }
    
    for (const [doc, data] of Object.entries(docMetrics)) {
      if (data.bounceRate > 0.7) {
        issues.push({
          type: 'documentation',
          severity: 'medium',
          description: `${doc} has high bounce rate: ${(data.bounceRate * 100).toFixed(1)}%`
        });
      }
    }
    
    return issues.sort((a, b) => {
      const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
}

module.exports = AnalyticsTracker;