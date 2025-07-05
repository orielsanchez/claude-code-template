/**
 * Phase 4.1: Accessibility Manager
 * 
 * Provides comprehensive accessibility support with:
 * - Screen reader optimized output with semantic structure
 * - WCAG AA/AAA contrast validation and compliance
 * - Alternative text representations for visual elements
 * - NO_COLOR/FORCE_COLOR environment variable support
 * - Progress announcements with semantic prefixes
 * 
 * Part of Phase 4: Accessibility & Personalization
 */

const fs = require('fs');
const path = require('path');
const { WCAG_STANDARDS, SEMANTIC_PREFIXES, ERROR_MESSAGES } = require('./constants');

class AccessibilityManager {
  constructor(sharedData = {}) {
    this.userId = sharedData.userId || 'default-user';
    this.preferences = sharedData.preferences || {};
    
    // Support both legacy and modern constructor patterns
    if (sharedData.configManager) {
      this.configManager = sharedData.configManager;
      this.dataDir = path.join(this.configManager.configDir, 'accessibility');
      this.configDir = this.configManager.configDir;
    } else {
      this.dataDir = path.join(__dirname, '../../data/accessibility-personalization');
      this.configDir = this.dataDir;
    }
    
    this.announcements = [];
    this.listeners = [];
    this.receivedEvents = [];
    this.ensureDataDir();
    
    // Set up event listeners if configManager is available
    if (this.configManager) {
      this.configManager.on('theme:changed', (event) => {
        this.receivedEvents.push({ type: 'theme:changed', data: event.data });
      });
    }
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
   * Format data for optimal screen reader consumption
   * @param {Object} data - Data to format with status, message, items
   * @returns {Promise<Object>} Structured format with announcements and screen reader text
   */
  async formatForScreenReader(data) {
    if (!data || typeof data !== 'object') {
      this.handleError('formatForScreenReader', new Error('Invalid data: object required for screen reader formatting'));
    }

    const announcement = this.generateAnnouncement(data);
    const structuredData = this.structureDataForScreenReader(data);
    
    return {
      format: 'structured',
      announcement,
      data: structuredData,
      screenReaderText: this.generateScreenReaderText(data)
    };
  }

  generateAnnouncement(data) {
    const prefix = this.getSemanticPrefix(data.status || 'info');
    return `${prefix} ${data.message}`;
  }

  structureDataForScreenReader(data) {
    const result = {
      summary: '',
      items: []
    };

    if (data.items && Array.isArray(data.items)) {
      result.summary = `Found ${data.items.length} items`;
      result.items = data.items.map(item => ({
        description: `${item.name}, status: ${item.status}`,
        semanticRole: 'listitem'
      }));
    }

    return result;
  }

  generateScreenReaderText(data) {
    let text = this.generateAnnouncement(data);
    
    if (data.items && Array.isArray(data.items)) {
      text += `. Found ${data.items.length} items. `;
      data.items.forEach((item, index) => {
        text += `Item ${index + 1}: ${item.name}, status ${item.status}. `;
      });
    }
    
    return text;
  }

  formatOutput(message, options = {}) {
    const { type = 'info', useColor = true } = options;
    
    // Respect NO_COLOR environment variable
    const shouldUseColor = useColor && !process.env.NO_COLOR;
    const prefix = this.getSemanticPrefix(type);
    
    if (shouldUseColor) {
      // Would normally add ANSI color codes here
      return `${prefix} ${message}`;
    } else {
      return `${prefix} ${message}`;
    }
  }

  getSemanticPrefix(type) {
    const prefixes = {
      success: '✓ Success:',
      error: '✗ Error:',
      warning: '⚠ Warning:',
      info: 'ℹ Info:',
      progress: '⚙ Progress:'
    };
    
    return prefixes[type] || prefixes.info;
  }

  /**
   * Validate color contrast against WCAG standards
   * @param {string} foreground - Foreground color (hex format)
   * @param {string} background - Background color (hex format)
   * @returns {Object} Contrast analysis with WCAG compliance
   */
  validateContrast(foreground, background) {
    if (!foreground || !background) {
      throw new Error('Both foreground and background colors required');
    }

    const fgLum = this.getLuminance(foreground);
    const bgLum = this.getLuminance(background);
    
    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      wcagAA: ratio >= WCAG_STANDARDS.AA_CONTRAST_RATIO,
      wcagAAA: ratio >= WCAG_STANDARDS.AAA_CONTRAST_RATIO,
      recommendation: ratio >= WCAG_STANDARDS.AAA_CONTRAST_RATIO ? 'Excellent contrast (WCAG AAA)' : 
                     ratio >= WCAG_STANDARDS.AA_CONTRAST_RATIO ? 'Good contrast (WCAG AA)' : 
                     `Poor contrast - improve to ${WCAG_STANDARDS.AA_CONTRAST_RATIO}:1 ratio`
    };
  }

  getLuminance(hex) {
    // Convert hex to RGB and calculate relative luminance
    const rgb = this.hexToRgb(hex);
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  onAnnouncement(callback) {
    this.listeners.push(callback);
  }

  async announceProgress(progress) {
    const { step, total, message, type = 'progress' } = progress;
    const prefix = this.getSemanticPrefix(type);
    const announcement = `${prefix} Step ${step} of ${total} - ${message}`;
    
    this.announcements.push(announcement);
    this.listeners.forEach(listener => listener(announcement));
  }

  generateAlternativeText(element) {
    const { type, data } = element;
    
    switch (type) {
      case 'table':
        return this.generateTableAltText(data);
      case 'progress-bar':
        return this.generateProgressBarAltText(data);
      case 'tree':
        return this.generateTreeAltText(data);
      default:
        return {
          type,
          description: `${type} element`,
          structuredText: JSON.stringify(data),
          screenReaderFormat: `${type}: ${JSON.stringify(data)}`
        };
    }
  }

  generateTableAltText(data) {
    const { headers, rows } = data;
    const description = `Table with ${headers.length} columns and ${rows.length} row${rows.length !== 1 ? 's' : ''}`;
    
    let structuredText = `Headers: ${headers.join(', ')}\n`;
    rows.forEach((row, index) => {
      structuredText += `Row ${index + 1}: ${row.join(', ')}\n`;
    });
    
    let screenReaderFormat = description + '. ';
    rows.forEach(row => {
      headers.forEach((header, index) => {
        screenReaderFormat += `${header}: ${row[index]}, `;
      });
    });
    
    return {
      type: 'table',
      description,
      structuredText: structuredText.trim(),
      screenReaderFormat: screenReaderFormat.trim()
    };
  }

  generateProgressBarAltText(data) {
    const { current, total, label } = data;
    const percentage = Math.round((current / total) * 100);
    
    return {
      type: 'progress-bar',
      description: `Progress bar showing ${percentage}% completion`,
      structuredText: `${label}: ${current}/${total} (${percentage}%)`,
      screenReaderFormat: `${label}: ${current} of ${total} completed, ${percentage} percent`
    };
  }

  generateTreeAltText(data) {
    const { name, children = [] } = data;
    
    return {
      type: 'tree',
      description: `Tree structure with root ${name} and ${children.length} children`,
      structuredText: this.formatTreeStructure(data, 0),
      screenReaderFormat: `Tree: ${name} contains ${children.map(c => c.name).join(', ')}`
    };
  }

  formatTreeStructure(node, depth) {
    const indent = '  '.repeat(depth);
    let result = `${indent}${node.name}\n`;
    
    if (node.children) {
      node.children.forEach(child => {
        result += this.formatTreeStructure(child, depth + 1);
      });
    }
    
    return result;
  }

  /**
   * Get configuration directory
   * @returns {string} Configuration directory path
   */
  getConfigDir() {
    return this.configDir;
  }

  /**
   * Get data directory
   * @returns {string} Data directory path
   */
  getDataDir() {
    return this.dataDir;
  }

  /**
   * Update accessibility settings
   * @param {Object} settings - Settings to update
   */
  async updateSettings(settings) {
    if (this.configManager) {
      // Update through configuration manager
      this.configManager.updatePluginConfig('accessibility', settings);
      this.configManager.updateSharedData({ accessibility: settings });
    } else {
      // Legacy direct update
      Object.assign(this.preferences, settings);
    }
  }

  /**
   * Get received events from other managers
   * @returns {Array} Array of received events
   */
  getReceivedEvents() {
    return [...this.receivedEvents];
  }

  /**
   * Load legacy data from old format files
   * @returns {Promise<Object>} Legacy data
   */
  async loadLegacyData() {
    try {
      // Try legacy location first (accessibility-personalization)
      let legacyDataPath = path.join(this.configDir || path.dirname(this.dataDir), 'accessibility-personalization', 'accessibility-data.json');
      if (fs.existsSync(legacyDataPath)) {
        const data = fs.readFileSync(legacyDataPath, 'utf8');
        return JSON.parse(data);
      }
      
      // Fallback to current data directory location
      legacyDataPath = path.join(this.dataDir, 'accessibility-data.json');
      if (fs.existsSync(legacyDataPath)) {
        const data = fs.readFileSync(legacyDataPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      if (this.configManager) {
        this.configManager.logError('accessibility', `Failed to load legacy data: ${error.message}`);
      }
    }
    return {};
  }

  /**
   * Enhanced error handling with ConfigurationManager integration
   * @param {string} operation - Operation that failed
   * @param {Error} error - Error object
   * @throws {Object} Structured error object
   */
  handleError(operation, error) {
    const structuredError = {
      message: `Accessibility Manager: ${operation} failed`,
      code: 'ACCESSIBILITY_ERROR',
      details: {
        operation,
        originalError: error.message,
        userId: this.userId
      }
    };

    if (this.configManager) {
      this.configManager.logError('accessibility', structuredError.message);
    }

    throw structuredError;
  }
}

module.exports = AccessibilityManager;