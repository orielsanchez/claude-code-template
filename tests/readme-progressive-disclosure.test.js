/**
 * TDD Tests for README Progressive Disclosure Implementation
 * 
 * Based on Phase 1 UX Research findings:
 * - Impact Score: 84/100 (high)
 * - Effort Estimate: 5/10 (moderate)
 * - Target: Time to first success < 5 minutes, completion rate > 80%
 * - Issue: README has 100% bounce rate, too overwhelming for new users
 */

const fs = require('fs');
const path = require('path');

describe('README Progressive Disclosure', () => {
  const readmePath = path.join(__dirname, '../README.md');
  let readmeContent;

  beforeEach(() => {
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  });

  describe('Summary Section Structure', () => {
    test('should have a concise summary section at the top', () => {
      const lines = readmeContent.split('\n');
      
      // Should find summary section within first 20 lines
      const summarySection = lines.slice(0, 20).find(line => 
        line.includes('## Summary') || line.includes('## TL;DR')
      );
      
      expect(summarySection).toBeDefined();
    });

    test('summary section should be under 100 words', () => {
      const summaryMatch = readmeContent.match(/## (?:Summary|TL;DR)(.*?)(?=\n## |---)/s);
      expect(summaryMatch).toBeTruthy();
      
      const summaryText = summaryMatch[1].trim();
      const wordCount = summaryText.split(/\s+/).filter(word => word.length > 0).length;
      
      expect(wordCount).toBeLessThanOrEqual(100);
    });

    test('summary should include core value proposition', () => {
      const summaryMatch = readmeContent.match(/## (?:Summary|TL;DR)(.*?)(?=\n## |---)/s);
      expect(summaryMatch).toBeTruthy();
      
      const summaryText = summaryMatch[1].toLowerCase();
      
      // Should mention key concepts
      expect(summaryText).toMatch(/test.driven|tdd|quality|claude.code|systematic/);
    });

    test('summary should include immediate call-to-action', () => {
      const summaryMatch = readmeContent.match(/## (?:Summary|TL;DR)(.*?)(?=\n## |---)/s);
      expect(summaryMatch).toBeTruthy();
      
      const summaryText = summaryMatch[1].toLowerCase();
      
      // Should have a clear next step
      expect(summaryText).toMatch(/quick start|get started|setup|install|try/);
    });
  });

  describe('Progressive Disclosure Structure', () => {
    test('should have clear information hierarchy', () => {
      const sections = readmeContent.match(/^##\s+(.+)$/gm);
      expect(sections).toBeTruthy();
      expect(sections.length).toBeGreaterThanOrEqual(4);
      
      // Check for logical progression
      const sectionTitles = sections.map(s => s.replace(/^##\s+/, '').toLowerCase());
      
      // Should start with summary/quick info
      expect(sectionTitles[0]).toMatch(/summary|tl;dr|quick/);
      
      // Should have getting started early
      const hasEarlyGettingStarted = sectionTitles.slice(0, 3).some(title => 
        title.includes('quick start') || title.includes('getting started')
      );
      expect(hasEarlyGettingStarted).toBe(true);
    });

    test('should use collapsible sections for detailed information', () => {
      // Check for HTML details/summary elements or clear sectioning
      const hasCollapsibleSections = 
        readmeContent.includes('<details>') && readmeContent.includes('<summary>') ||
        readmeContent.includes('---') || // Clear section breaks
        readmeContent.match(/#{3,}/); // Subsections with deeper headers
      
      expect(hasCollapsibleSections).toBe(true);
    });

    test('should have minimal content before first action', () => {
      const quickStartMatch = readmeContent.match(/## Quick Start(.*?)(?=\n##|$)/s);
      expect(quickStartMatch).toBeTruthy();
      
      const beforeQuickStart = readmeContent.substring(0, readmeContent.indexOf('## Quick Start'));
      const wordCount = beforeQuickStart.split(/\s+/).filter(word => word.length > 0).length;
      
      // Should have very minimal content before users can take action
      expect(wordCount).toBeLessThanOrEqual(150);
    });
  });

  describe('Quick Start Optimization', () => {
    test('should present one-line setup prominently', () => {
      const quickStartSection = readmeContent.match(/## Quick Start(.*?)(?=\n## )/s);
      expect(quickStartSection).toBeTruthy();
      
      const quickStartText = quickStartSection[1];
      
      // Should have curl one-liner early and prominent
      expect(quickStartText).toMatch(/curl.*bash/);
      
      // One-liner should appear before other options
      const curlIndex = quickStartText.indexOf('curl');
      const otherOptionsIndex = quickStartText.indexOf('Option 2:') || quickStartText.indexOf('### Option');
      
      if (otherOptionsIndex > -1) {
        expect(curlIndex).toBeLessThan(otherOptionsIndex);
      }
    });

    test('should provide immediate next steps after setup', () => {
      const quickStartSection = readmeContent.match(/## Quick Start(.*?)(?=\n##|$)/s);
      expect(quickStartSection).toBeTruthy();
      
      const quickStartText = quickStartSection[1].toLowerCase();
      
      // Should mention what to do after setup
      expect(quickStartText).toMatch(/claude|\/dev|start|begin|first/);
    });

    test('should minimize setup options presented initially', () => {
      const quickStartSection = readmeContent.match(/## Quick Start(.*?)(?=\n##|$)/s);
      expect(quickStartSection).toBeTruthy();
      
      const optionCount = (quickStartSection[1].match(/### Option|###.*Option/g) || []).length;
      
      // Should present limited options to avoid decision paralysis
      expect(optionCount).toBeLessThanOrEqual(3);
    });
  });

  describe('Content Organization for New Users', () => {
    test('should defer advanced topics', () => {
      const readmeLines = readmeContent.split('\n');
      const advancedTopicsLine = readmeLines.findIndex(line => 
        line.toLowerCase().includes('advanced') || 
        line.toLowerCase().includes('philosophy') ||
        line.toLowerCase().includes('configuration')
      );
      
      const quickStartLine = readmeLines.findIndex(line => 
        line.includes('## Quick Start')
      );
      
      // Advanced topics should come after quick start
      if (advancedTopicsLine > -1 && quickStartLine > -1) {
        expect(advancedTopicsLine).toBeGreaterThan(quickStartLine);
      }
    });

    test('should explain Claude Code context early for new users', () => {
      const beforeCommandsSection = readmeContent.substring(0, 
        readmeContent.indexOf('## Commands') > -1 ? 
        readmeContent.indexOf('## Commands') : 
        readmeContent.length
      );
      
      // Should explain what Claude Code is before diving into details
      expect(beforeCommandsSection.toLowerCase()).toMatch(/claude code.*ai|ai.*claude code|what is claude/);
    });

    test('should provide success indicators', () => {
      const quickStartSection = readmeContent.match(/## Quick Start(.*?)(?=\n## )/s);
      expect(quickStartSection).toBeTruthy();
      
      const quickStartText = quickStartSection[1].toLowerCase();
      
      // Should indicate what success looks like
      expect(quickStartText).toMatch(/success|working|ready|complete/);
    });
  });

  describe('Readability Metrics', () => {
    test('should have reasonable paragraph lengths', () => {
      const paragraphs = readmeContent.split('\n\n').filter(p => 
        p.trim().length > 0 && 
        !p.startsWith('#') && 
        !p.startsWith('```') &&
        !p.startsWith('|') // tables
      );
      
      const longParagraphs = paragraphs.filter(p => {
        const wordCount = p.split(/\s+/).filter(word => word.length > 0).length;
        return wordCount > 50;
      });
      
      // Most paragraphs should be digestible
      expect(longParagraphs.length).toBeLessThanOrEqual(paragraphs.length * 0.3);
    });

    test('should use clear headings for navigation', () => {
      const headings = readmeContent.match(/^#{2,4}\s+.+$/gm) || [];
      
      // Should have sufficient section breaks
      expect(headings.length).toBeGreaterThanOrEqual(6);
      
      // Headings should be descriptive
      const vagueHeadings = headings.filter(heading => {
        const title = heading.replace(/^#+\s+/, '').toLowerCase();
        return title.length < 5 || /misc|other|more/.test(title);
      });
      
      expect(vagueHeadings.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Phase 1 UX Research Requirements', () => {
    test('should address pain point: README too long and overwhelming', () => {
      // Should have progressive disclosure structure
      const hasSummary = readmeContent.includes('## Summary') || readmeContent.includes('## TL;DR');
      const hasGoodStructure = readmeContent.match(/^##\s+/gm).length >= 4;
      const hasQuickStart = readmeContent.includes('## Quick Start');
      
      expect(hasSummary).toBe(true);
      expect(hasGoodStructure).toBe(true);
      expect(hasQuickStart).toBe(true);
    });

    test('should target time to first success under 5 minutes', () => {
      const quickStartSection = readmeContent.match(/## Quick Start(.*?)(?=\n## )/s);
      expect(quickStartSection).toBeTruthy();
      
      const quickStartText = quickStartSection[1];
      
      // Should have one-liner that can be executed immediately
      expect(quickStartText).toMatch(/curl.*bash/);
      
      // Should indicate quick completion
      const wordCount = quickStartText.split(/\s+/).filter(word => word.length > 0).length;
      expect(wordCount).toBeLessThanOrEqual(200); // Should be quickly scannable
    });

    test('should improve completion rate potential', () => {
      // Should reduce decision paralysis
      const setupOptions = (readmeContent.match(/### Option/g) || []).length;
      expect(setupOptions).toBeLessThanOrEqual(3);
      
      // Should have clear primary path
      const hasRecommendedPath = readmeContent.toLowerCase().includes('recommended');
      expect(hasRecommendedPath).toBe(true);
      
      // Should provide immediate feedback/next steps
      const hasNextSteps = readmeContent.toLowerCase().match(/next|then|after|success/);
      expect(hasNextSteps).toBeTruthy();
    });
  });
});