/**
 * Phase 4.4: CLI Theme Manager
 * Handles dynamic color schemes, semantic output, and accessibility validation
 */

const fs = require('fs');
const path = require('path');

class ThemeManager {
  constructor(sharedData = {}) {
    this.userId = sharedData.userId || 'default-user';
    this.preferences = sharedData.preferences || {};
    this.dataDir = path.join(__dirname, '../../data/accessibility-personalization');
    this.predefinedThemes = this.loadPredefinedThemes();
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

  loadPredefinedThemes() {
    return {
      'default': {
        name: 'default',
        colors: {
          success: '#00aa00',
          error: '#cc0000',
          warning: '#ff8800',
          info: '#0088cc'
        },
        semantics: {
          success: '✓ Success:',
          error: '✗ Error:',
          warning: '⚠ Warning:',
          info: 'ℹ Info:'
        },
        accessibility: {
          contrastValidated: false,
          wcagCompliance: 'A'
        }
      },
      'dark': {
        name: 'dark',
        colors: {
          success: '#00dd00',
          error: '#ff4444',
          warning: '#ffaa00',
          info: '#44aaff'
        },
        semantics: {
          success: '✓ Success:',
          error: '✗ Error:',
          warning: '⚠ Warning:',
          info: 'ℹ Info:'
        },
        accessibility: {
          contrastValidated: true,
          wcagCompliance: 'AA'
        }
      },
      'high-contrast': {
        name: 'high-contrast',
        colors: {
          success: '#00ff00',
          error: '#ff0000',
          warning: '#ffff00',
          info: '#00ffff'
        },
        semantics: {
          success: '✓ Success:',
          error: '✗ Error:',
          warning: '⚠ Warning:',
          info: 'ℹ Info:'
        },
        accessibility: {
          contrastValidated: true,
          wcagCompliance: 'AA'
        }
      },
      'colorblind-friendly': {
        name: 'colorblind-friendly',
        colors: {
          success: '#0077bb',
          error: '#cc3311',
          warning: '#ee7733',
          info: '#33bbee'
        },
        semantics: {
          success: '✓ Success:',
          error: '✗ Error:',
          warning: '⚠ Warning:',
          info: 'ℹ Info:'
        },
        accessibility: {
          contrastValidated: true,
          wcagCompliance: 'AA'
        }
      }
    };
  }

  async loadTheme(themeName) {
    if (this.predefinedThemes[themeName]) {
      return this.predefinedThemes[themeName];
    }
    
    // Try to load custom theme
    try {
      const customThemePath = path.join(this.dataDir, `theme-${themeName}.json`);
      if (fs.existsSync(customThemePath)) {
        return JSON.parse(fs.readFileSync(customThemePath, 'utf8'));
      }
    } catch (error) {
      console.warn(`Failed to load custom theme ${themeName}:`, error.message);
    }
    
    // Fallback to default theme
    return this.predefinedThemes.default;
  }

  renderMessage(message) {
    const { type, content } = message;
    const semantic = this.getSemanticPrefix(type);
    
    return {
      text: `${semantic} ${content}`,
      semantic: `${semantic} ${content}`,
      accessible: `${semantic} ${content}`, // No ANSI codes for accessibility
      structured: {
        type,
        message: content,
        prefix: semantic,
        timestamp: new Date().toISOString()
      }
    };
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

  generateAlternatives(element) {
    const { type, data } = element;
    
    switch (type) {
      case 'progress-indicator':
        return this.generateProgressAlternatives(data);
      case 'status-grid':
        return this.generateStatusGridAlternatives(data);
      case 'file-tree':
        return this.generateFileTreeAlternatives(data);
      default:
        return this.generateGenericAlternatives(element);
    }
  }

  generateProgressAlternatives(data) {
    const { current, total, label } = data;
    const percentage = Math.round((current / total) * 100);
    
    return {
      visual: `${label}: [${'█'.repeat(Math.floor(percentage/10))}${' '.repeat(10-Math.floor(percentage/10))}] ${percentage}%`,
      accessible: `${label}: ${current}/${total} (${percentage}%)`,
      screenReader: `${label}: ${current} of ${total} completed, ${percentage} percent progress`,
      structured: { label, current, total, percentage },
      description: `Progress bar showing ${percentage}% completion for ${label}`
    };
  }

  generateStatusGridAlternatives(data) {
    const { items } = data;
    
    const visual = items.map(item => 
      `${item.name}: ${item.status === 'running' ? '🟢' : '🔴'} ${item.status}`
    ).join('\n');
    
    const accessible = items.map(item => 
      `${item.name}: ${item.status}`
    ).join('\n');
    
    const screenReader = `Status grid with ${items.length} services. ` +
      items.map(item => `${item.name} is ${item.status}`).join('. ');
    
    return {
      visual,
      accessible,
      screenReader,
      structured: { type: 'status-grid', items },
      description: `Status grid showing ${items.length} services`
    };
  }

  generateFileTreeAlternatives(data) {
    const { root, structure } = data;
    
    const visual = this.formatFileTreeVisual(root, structure);
    const accessible = this.formatFileTreeAccessible(root, structure);
    const screenReader = this.formatFileTreeScreenReader(root, structure);
    
    return {
      visual,
      accessible,
      screenReader,
      structured: { type: 'file-tree', root, structure },
      description: `File tree structure for ${root} project`
    };
  }

  formatFileTreeVisual(root, structure) {
    let result = `${root}/\n`;
    Object.entries(structure).forEach(([dir, files]) => {
      result += `├── ${dir}\n`;
      files.forEach((file, index) => {
        const isLast = index === files.length - 1;
        result += `${isLast ? '└──' : '├──'} ${file}\n`;
      });
    });
    return result.trim();
  }

  formatFileTreeAccessible(root, structure) {
    let result = `${root}/\n`;
    Object.entries(structure).forEach(([dir, files]) => {
      result += `  ${dir}\n`;
      files.forEach(file => {
        result += `    ${file}\n`;
      });
    });
    return result.trim();
  }

  formatFileTreeScreenReader(root, structure) {
    let result = `File tree for ${root}. `;
    Object.entries(structure).forEach(([dir, files]) => {
      result += `Directory ${dir} contains ${files.length} files: ${files.join(', ')}. `;
    });
    return result.trim();
  }

  generateGenericAlternatives(element) {
    const { type, data } = element;
    
    return {
      visual: `${type}: ${JSON.stringify(data)}`,
      accessible: `${type}: ${JSON.stringify(data)}`,
      screenReader: `${type} element with data: ${JSON.stringify(data)}`,
      structured: element,
      description: `${type} element`
    };
  }

  validateThemeAccessibility(themeName) {
    const theme = this.predefinedThemes[themeName];
    if (!theme) {
      return {
        theme: themeName,
        overallCompliance: 'Unknown',
        colorTests: [],
        recommendations: ['Theme not found']
      };
    }
    
    const colorTests = [];
    const backgroundColor = '#000000'; // Assume dark background for testing
    
    Object.entries(theme.colors).forEach(([element, color]) => {
      const contrast = this.calculateContrast(color, backgroundColor);
      colorTests.push({
        element,
        foreground: color,
        background: backgroundColor,
        ratio: contrast.ratio,
        wcagAA: contrast.wcagAA,
        wcagAAA: contrast.wcagAAA
      });
    });
    
    // Determine overall compliance
    const allMeetAA = colorTests.every(test => test.wcagAA);
    const allMeetAAA = colorTests.every(test => test.wcagAAA);
    
    const overallCompliance = allMeetAAA ? 'AAA' : allMeetAA ? 'AA' : 'A';
    
    const recommendations = [];
    colorTests.forEach(test => {
      if (!test.wcagAA) {
        recommendations.push(`Improve contrast for ${test.element} (current: ${test.ratio}:1, need: 4.5:1)`);
      }
    });
    
    return {
      theme: themeName,
      overallCompliance,
      colorTests,
      recommendations
    };
  }

  calculateContrast(foreground, background) {
    const fgLum = this.getLuminance(foreground);
    const bgLum = this.getLuminance(background);
    
    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7
    };
  }

  getLuminance(hex) {
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
}

module.exports = ThemeManager;