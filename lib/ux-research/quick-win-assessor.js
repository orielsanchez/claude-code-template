/**
 * Quick Win Assessor
 * Evaluates improvement opportunities for implementation effort vs impact
 */

class QuickWinAssessor {
  constructor() {
    this.effortMatrix = this._initializeEffortMatrix();
    this.impactWeights = this._initializeImpactWeights();
  }

  /**
   * Assess an improvement opportunity for effort vs impact
   */
  assessOpportunity(opportunity) {
    const impactScore = this._calculateImpactScore(opportunity);
    const effortEstimate = this._calculateEffortEstimate(opportunity);
    const quickWinScore = this._calculateQuickWinScore(impactScore, effortEstimate);
    const recommendedPriority = this._determinePriority(quickWinScore, impactScore, effortEstimate);
    
    return {
      impactScore,
      effortEstimate,
      quickWinScore,
      recommendedPriority,
      reasoning: this._generateReasoning(opportunity, impactScore, effortEstimate)
    };
  }

  /**
   * Rank multiple opportunities by quick win potential
   */
  rankQuickWins(opportunities) {
    const assessedOpportunities = opportunities.map(opp => {
      const assessment = this.assessOpportunity(opp);
      return {
        ...opp,
        ...assessment
      };
    });
    
    // Sort by quick win score (highest first)
    return assessedOpportunities.sort((a, b) => b.quickWinScore - a.quickWinScore);
  }

  /**
   * Generate actionable recommendations for an opportunity
   */
  generateRecommendations(opportunity) {
    const assessment = this.assessOpportunity(opportunity);
    const actionItems = this._generateActionItems(opportunity, assessment);
    const successMetrics = this._generateSuccessMetrics(opportunity);
    const estimatedTimeline = this._estimateTimeline(opportunity, assessment.effortEstimate);
    const riskFactors = this._identifyRiskFactors(opportunity);
    
    return {
      actionItems,
      successMetrics,
      estimatedTimeline,
      riskFactors,
      implementation: {
        priority: assessment.recommendedPriority,
        complexity: this._determineComplexity(assessment.effortEstimate),
        dependencies: this._identifyDependencies(opportunity),
        resourceRequirements: this._estimateResources(opportunity, assessment.effortEstimate)
      }
    };
  }

  // Private methods

  _initializeEffortMatrix() {
    return {
      category: {
        'documentation': 2, // Low effort - mostly text changes
        'setup': 4,         // Medium effort - script modifications
        'onboarding': 5,    // Medium-high effort - UX changes
        'command_discovery': 6, // High effort - new features
        'architecture': 9,  // Very high effort - major changes
        'performance': 7,   // High effort - optimization work
        'accessibility': 5, // Medium-high effort - compliance work
        'analytics': 6      // High effort - new tracking system
      },
      complexity: {
        'simple_text_change': 1,
        'configuration_update': 2,
        'script_enhancement': 3,
        'new_component': 5,
        'integration_work': 7,
        'system_redesign': 10
      }
    };
  }

  _initializeImpactWeights() {
    return {
      severity: {
        'low': 1,
        'medium': 3,
        'high': 7,
        'critical': 10
      },
      frequency: {
        'rare': 1,
        'uncommon': 2,
        'common': 5,
        'very_common': 8
      },
      userScope: {
        'specific_use_case': 1,
        'experienced_users': 3,
        'new_users': 7,
        'all_users': 10
      }
    };
  }

  _calculateImpactScore(opportunity) {
    let score = 0;
    
    // Pain point impact
    if (opportunity.painPoints) {
      const painPointScore = opportunity.painPoints.reduce((sum, painPoint) => {
        const severityScore = this.impactWeights.severity[painPoint.severity] || 1;
        const frequencyScore = this.impactWeights.frequency[painPoint.frequency] || 1;
        return sum + (severityScore * frequencyScore);
      }, 0);
      score += painPointScore;
    } else if (opportunity.severity && opportunity.frequency) {
      // Direct severity and frequency on opportunity
      const severityScore = this.impactWeights.severity[opportunity.severity] || 1;
      const frequencyScore = this.impactWeights.frequency[opportunity.frequency] || 1;
      score += severityScore * frequencyScore;
    }
    
    // User scope impact
    if (opportunity.affectedUsers) {
      const userScopeScore = opportunity.affectedUsers.reduce((sum, userType) => {
        return sum + (this._getUserScopeWeight(userType) || 1);
      }, 0);
      score += userScopeScore;
    }
    
    // Category-specific impact multipliers
    const categoryMultiplier = this._getCategoryImpactMultiplier(opportunity.category);
    score *= categoryMultiplier;
    
    return Math.min(score, 100); // Cap at 100
  }

  _calculateEffortEstimate(opportunity) {
    let effort = 0;
    
    // Base effort from category
    const categoryEffort = this.effortMatrix.category[opportunity.category] || 5;
    effort += categoryEffort;
    
    // Adjust based on description complexity
    const complexityAdjustment = this._inferComplexityFromDescription(opportunity.description);
    effort += complexityAdjustment;
    
    // Adjust based on user scope (more users = more testing/validation needed)
    if (opportunity.affectedUsers) {
      const scopeEffort = opportunity.affectedUsers.length * 0.5;
      effort += scopeEffort;
    }
    
    return Math.min(effort, 10); // Cap at 10
  }

  _calculateQuickWinScore(impactScore, effortEstimate) {
    // Quick win score = Impact / Effort ratio, normalized to 0-100
    if (effortEstimate === 0) return 0;
    
    const ratio = impactScore / effortEstimate;
    return Math.min(ratio * 10, 100); // Scale and cap at 100
  }

  _determinePriority(quickWinScore, impactScore, effortEstimate) {
    if (quickWinScore >= 80 && effortEstimate <= 3) return 'critical'; // High impact, low effort
    if (quickWinScore >= 60) return 'high';
    if (quickWinScore >= 40 || impactScore >= 70) return 'medium';
    if (quickWinScore >= 20) return 'low';
    return 'backlog';
  }

  _generateReasoning(opportunity, impactScore, effortEstimate) {
    const reasons = [];
    
    if (impactScore >= 70) {
      reasons.push('High impact on user experience');
    } else if (impactScore >= 40) {
      reasons.push('Moderate impact on user experience');
    } else {
      reasons.push('Limited impact on user experience');
    }
    
    if (effortEstimate <= 3) {
      reasons.push('low implementation effort required');
    } else if (effortEstimate <= 6) {
      reasons.push('moderate implementation effort required');
    } else {
      reasons.push('significant implementation effort required');
    }
    
    if (opportunity.category === 'onboarding') {
      reasons.push('affects critical first impression');
    }
    
    if (opportunity.affectedUsers && opportunity.affectedUsers.includes('new_user')) {
      reasons.push('impacts user acquisition and retention');
    }
    
    return reasons.join(', ');
  }

  _generateActionItems(opportunity, assessment) {
    const items = [];
    
    switch (opportunity.category) {
      case 'documentation':
        items.push('Review and simplify documentation structure');
        items.push('Add progressive disclosure for complex topics');
        items.push('Create quick reference guides');
        break;
        
      case 'setup':
        items.push('Enhance setup script with progress indicators');
        items.push('Improve error messages with actionable suggestions');
        items.push('Add validation and confirmation steps');
        break;
        
      case 'onboarding':
        items.push('Create guided first-time user experience');
        items.push('Implement progressive feature disclosure');
        items.push('Add success confirmation and next steps');
        break;
        
      case 'command_discovery':
        items.push('Implement interactive help command');
        items.push('Add contextual command suggestions');
        items.push('Create command exploration interface');
        break;
        
      default:
        items.push(`Address: ${opportunity.description}`);
        items.push('Plan implementation approach');
        items.push('Define success criteria');
    }
    
    return items;
  }

  _generateSuccessMetrics(opportunity) {
    const metrics = [];
    
    switch (opportunity.category) {
      case 'setup':
        metrics.push('Setup success rate > 95%');
        metrics.push('Average setup time < 2 minutes');
        metrics.push('Setup error rate < 5%');
        break;
        
      case 'onboarding':
        metrics.push('Time to first success < 5 minutes');
        metrics.push('New user completion rate > 80%');
        metrics.push('User satisfaction score > 8/10');
        break;
        
      case 'documentation':
        metrics.push('Documentation bounce rate < 30%');
        metrics.push('Average reading time increase by 25%');
        metrics.push('Help request reduction by 40%');
        break;
        
      case 'command_discovery':
        metrics.push('Command usage diversity increase by 50%');
        metrics.push('Help command usage increase by 60%');
        metrics.push('User session length increase by 30%');
        break;
        
      default:
        metrics.push('User satisfaction improvement');
        metrics.push('Task completion rate improvement');
        metrics.push('Error rate reduction');
    }
    
    return metrics;
  }

  _estimateTimeline(opportunity, effortEstimate) {
    const baseDays = effortEstimate * 2; // Rough estimate: effort * 2 days
    
    return {
      planning: Math.ceil(baseDays * 0.2),
      implementation: Math.ceil(baseDays * 0.6),
      testing: Math.ceil(baseDays * 0.2),
      total: baseDays
    };
  }

  _identifyRiskFactors(opportunity) {
    const risks = [];
    
    if (opportunity.affectedUsers && opportunity.affectedUsers.length > 2) {
      risks.push('Changes may impact multiple user types differently');
    }
    
    if (opportunity.category === 'setup') {
      risks.push('Setup changes could break existing workflows');
    }
    
    if (opportunity.category === 'architecture') {
      risks.push('Major changes may introduce unexpected issues');
    }
    
    if (opportunity.painPoints && opportunity.painPoints.some(p => p.severity === 'critical')) {
      risks.push('High user expectation for immediate improvement');
    }
    
    return risks;
  }

  _determineComplexity(effortEstimate) {
    if (effortEstimate <= 2) return 'simple';
    if (effortEstimate <= 5) return 'moderate';
    if (effortEstimate <= 8) return 'complex';
    return 'very_complex';
  }

  _identifyDependencies(opportunity) {
    const dependencies = [];
    
    if (opportunity.category === 'command_discovery') {
      dependencies.push('Command system architecture understanding');
      dependencies.push('UI/UX design decisions');
    }
    
    if (opportunity.category === 'analytics') {
      dependencies.push('Data collection infrastructure');
      dependencies.push('Privacy and compliance considerations');
    }
    
    if (opportunity.category === 'onboarding') {
      dependencies.push('User persona research completion');
      dependencies.push('Setup process stabilization');
    }
    
    return dependencies;
  }

  _estimateResources(opportunity, effortEstimate) {
    return {
      developer: effortEstimate <= 5 ? '1 developer' : '1-2 developers',
      designer: opportunity.category === 'onboarding' || opportunity.category === 'command_discovery' ? '1 UX designer' : 'none',
      tester: effortEstimate >= 7 ? '1 QA tester' : 'developer testing',
      duration: `${Math.ceil(effortEstimate * 2)} days`
    };
  }

  _getUserScopeWeight(userType) {
    const weights = {
      'new_user': 7,
      'experienced_developer': 3,
      'team_lead': 5,
      'all_users': 10
    };
    return weights[userType] || 1;
  }

  _getCategoryImpactMultiplier(category) {
    const multipliers = {
      'onboarding': 1.5,    // Critical for first impressions
      'setup': 1.3,        // Important for initial success
      'documentation': 1.2, // Affects ongoing experience
      'command_discovery': 1.4, // Important for feature adoption
      'performance': 1.1,   // Generally important
      'accessibility': 1.3, // Important for inclusivity
      'analytics': 1.0      // Supporting feature
    };
    return multipliers[category] || 1.0;
  }

  _inferComplexityFromDescription(description) {
    const lowComplexityTerms = ['typo', 'text', 'wording', 'link'];
    const mediumComplexityTerms = ['add', 'enhance', 'improve', 'update'];
    const highComplexityTerms = ['redesign', 'refactor', 'implement', 'create'];
    
    const lowerDesc = description.toLowerCase();
    
    if (lowComplexityTerms.some(term => lowerDesc.includes(term))) return -1;
    if (highComplexityTerms.some(term => lowerDesc.includes(term))) return 2;
    if (mediumComplexityTerms.some(term => lowerDesc.includes(term))) return 1;
    
    return 0; // Default adjustment
  }
}

module.exports = QuickWinAssessor;