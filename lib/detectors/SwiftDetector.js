/**
 * Swift Project Detector
 * 
 * Specialized detector for Swift projects and frameworks
 */

const path = require('path');
const { safeReadText, fileExists } = require('./shared-utils');
const AbstractDetector = require('./AbstractDetector');

// Modern Swift patterns (2025+)
const SWIFT_PATTERNS = {
  configFiles: ['Package.swift', '*.xcodeproj', '*.xcworkspace'],
  dependencies: {
    // Modern web frameworks
    'vapor': { framework: 'vapor', type: 'web', tier: 'server-side' },
    'perfect': { framework: 'perfect', type: 'web', tier: 'alternative' },
    'kitura': { framework: 'kitura', type: 'web', tier: 'ibm' },
    
    // UI frameworks
    'swiftui': { framework: 'swiftui', type: 'ui', tier: 'modern' },
    'uikit': { framework: 'uikit', type: 'ui', tier: 'traditional' },
    'appkit': { framework: 'appkit', type: 'ui', tier: 'macos' },
    'watchkit': { framework: 'watchkit', type: 'ui', tier: 'watchos' },
    
    // Reactive/Async frameworks
    'combine': { framework: 'combine', type: 'reactive', tier: 'standard' },
    'reactive-swift': { framework: 'reactive-swift', type: 'reactive', tier: 'community' },
    'rxswift': { framework: 'rxswift', type: 'reactive', tier: 'legacy' },
    
    // Modern testing frameworks
    'swift-testing': { framework: 'swift-testing', type: 'testing', tier: 'modern' },
    'xctest': { framework: 'xctest', type: 'testing', tier: 'traditional' },
    'quick': { framework: 'quick', type: 'testing', tier: 'bdd' },
    'nimble': { framework: 'nimble', type: 'testing', tier: 'matcher' },
    
    // Networking
    'alamofire': { framework: 'alamofire', type: 'networking', tier: 'http' },
    'swift-nio': { framework: 'swift-nio', type: 'networking', tier: 'async-io' },
    
    // Database
    'sqlite.swift': { framework: 'sqlite.swift', type: 'database', tier: 'sqlite' },
    'fluent': { framework: 'fluent', type: 'database', tier: 'orm' },
    'realm-swift': { framework: 'realm-swift', type: 'database', tier: 'mobile' },
    
    // Core frameworks
    'foundation': { framework: 'foundation', type: 'core', tier: 'standard' },
    'core-data': { framework: 'core-data', type: 'persistence', tier: 'apple' },
    'core-graphics': { framework: 'core-graphics', type: 'graphics', tier: 'system' },
    
    // Modern concurrency
    'swift-concurrency': { framework: 'swift-concurrency', type: 'concurrency', tier: 'async-await' },
    'swift-async-algorithms': { framework: 'swift-async-algorithms', type: 'concurrency', tier: 'algorithms' },
    
    // Utility libraries
    'swift-argument-parser': { framework: 'swift-argument-parser', type: 'cli', tier: 'official' },
    'swift-log': { framework: 'swift-log', type: 'logging', tier: 'official' },
    'swift-metrics': { framework: 'swift-metrics', type: 'observability', tier: 'official' },
    'swift-distributed-tracing': { framework: 'swift-distributed-tracing', type: 'observability', tier: 'official' }
  },
  version: '6.0' // Latest stable version (2025)
};

class SwiftDetector extends AbstractDetector {
  constructor() {
    super(SWIFT_PATTERNS);
  }

  /**
   * Detect and add Swift language
   * @param {Object} result - Detection result object to modify
   */
  detectLanguage(result) {
    result.languages.push('swift');
  }

  /**
   * Detect and add Swift tools
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectTools(projectPath, result) {
    // Swift Package Manager is the primary tool
    if (fileExists(path.join(projectPath, 'Package.swift'))) {
      result.tools.push('swift-package-manager');
    }
    
    // Xcode detection
    if (this.hasXcodeProject(projectPath)) {
      result.tools.push('xcode');
    }
    
    // Modern Swift tooling
    result.tools.push('swift-compiler');
    
    // Additional tools that might be present
    const additionalTools = [
      { name: 'swiftlint', indicator: '.swiftlint.yml' },
      { name: 'swiftformat', indicator: '.swiftformat' },
      { name: 'carthage', indicator: 'Cartfile' },
      { name: 'cocoapods', indicator: 'Podfile' }
    ];
    
    additionalTools.forEach(tool => {
      if (fileExists(path.join(projectPath, tool.indicator))) {
        result.tools.push(tool.name);
      }
    });
  }

  /**
   * Detect Swift frameworks from Package.swift or Xcode project
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectFrameworks(projectPath, result) {
    // Check Package.swift first (Swift Package Manager)
    const packageSwiftPath = path.join(projectPath, 'Package.swift');
    if (fileExists(packageSwiftPath)) {
      const packageContent = safeReadText(packageSwiftPath);
      if (packageContent) {
        this.parsePackageSwiftDependencies(packageContent, result);
      }
    }
    
    // Check for Xcode project files
    if (this.hasXcodeProject(projectPath)) {
      this.detectXcodeFrameworks(projectPath, result);
    }
    
    // Check for Swift source files for import analysis
    this.detectFrameworksFromSourceFiles(projectPath, result);
  }

  /**
   * Check if project has Xcode project files
   * @param {string} projectPath - Path to project directory
   * @returns {boolean} True if Xcode project files exist
   */
  hasXcodeProject(projectPath) {
    const fs = require('fs');
    try {
      const files = fs.readdirSync(projectPath);
      return files.some(file => file.endsWith('.xcodeproj') || file.endsWith('.xcworkspace'));
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse Package.swift for dependencies
   * @param {string} packageContent - Content of Package.swift file
   * @param {Object} result - Detection result object to modify
   */
  parsePackageSwiftDependencies(packageContent, result) {
    // Parse dependencies from Package.swift
    Object.entries(SWIFT_PATTERNS.dependencies).forEach(([dep, config]) => {
      // Check for package URL patterns (GitHub, GitLab, etc.)
      const depPatterns = [
        new RegExp(`"[^"]*${dep}[^"]*"`, 'i'),
        new RegExp(`url:\\s*"[^"]*${dep}[^"]*"`, 'i'),
        new RegExp(`\\.package\\([^)]*${dep}[^)]*\\)`, 'i')
      ];
      
      if (depPatterns.some(pattern => pattern.test(packageContent))) {
        if (!result.frameworks.includes(config.framework)) {
          result.frameworks.push(config.framework);
        }
      }
    });
    
    // Special handling for target dependencies
    const targetMatch = packageContent.match(/\.target\s*\([^)]*dependencies:\s*\[[^\]]*\]/gs);
    if (targetMatch) {
      targetMatch.forEach(target => {
        Object.entries(SWIFT_PATTERNS.dependencies).forEach(([dep, config]) => {
          if (target.toLowerCase().includes(dep.toLowerCase())) {
            if (!result.frameworks.includes(config.framework)) {
              result.frameworks.push(config.framework);
            }
          }
        });
      });
    }
  }

  /**
   * Detect frameworks from Xcode project
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectXcodeFrameworks(projectPath, result) {
    // For Xcode projects, we'll look for common framework indicators
    const fs = require('fs');
    
    try {
      const files = fs.readdirSync(projectPath);
      const xcodeProject = files.find(file => file.endsWith('.xcodeproj'));
      
      if (xcodeProject) {
        // Check for common Apple frameworks by examining source files
        const commonAppleFrameworks = [
          'swiftui', 'uikit', 'appkit', 'foundation', 'combine',
          'core-data', 'core-graphics', 'watchkit'
        ];
        
        commonAppleFrameworks.forEach(framework => {
          if (SWIFT_PATTERNS.dependencies[framework]) {
            // We'll add these as potential frameworks
            // Real detection would require parsing .xcodeproj files (complex binary format)
            result.frameworks.push(SWIFT_PATTERNS.dependencies[framework].framework);
          }
        });
      }
    } catch (error) {
      // Silently handle errors in Xcode project detection
    }
  }

  /**
   * Detect frameworks from Swift source file imports
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectFrameworksFromSourceFiles(projectPath, result) {
    const fs = require('fs');
    
    try {
      // Find Swift source files
      const findSwiftFiles = (dir) => {
        const files = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            files.push(...findSwiftFiles(fullPath));
          } else if (entry.isFile() && entry.name.endsWith('.swift')) {
            files.push(fullPath);
          }
        }
        return files;
      };
      
      const swiftFiles = findSwiftFiles(projectPath).slice(0, 10); // Limit for performance
      
      swiftFiles.forEach(filePath => {
        const content = safeReadText(filePath);
        if (content) {
          this.parseSwiftImports(content, result);
        }
      });
    } catch (error) {
      // Silently handle errors in source file analysis
    }
  }

  /**
   * Parse Swift import statements
   * @param {string} content - Swift source file content
   * @param {Object} result - Detection result object to modify
   */
  parseSwiftImports(content, result) {
    const importRegex = /import\s+(\w+)/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importName = match[1].toLowerCase();
      
      // Check if this import matches any of our known frameworks
      Object.entries(SWIFT_PATTERNS.dependencies).forEach(([dep, config]) => {
        if (importName === dep.toLowerCase() || 
            importName.includes(dep.toLowerCase()) ||
            dep.toLowerCase().includes(importName)) {
          if (!result.frameworks.includes(config.framework)) {
            result.frameworks.push(config.framework);
          }
        }
      });
    }
  }

  /**
   * Resolve Swift primary framework
   * @param {Object} result - Detection result object to modify
   */
  resolvePrimary(result) {
    if (result.primary === 'generic') {
      result.primary = 'swift';  // Language takes priority for Swift projects
    }
  }

  /**
   * Check if this is a Package.swift project specifically
   * @param {string} projectPath - Path to project directory
   * @returns {boolean} True if Package.swift exists
   */
  hasPackageSwift(projectPath) {
    return fileExists(path.join(projectPath, 'Package.swift'));
  }

  /**
   * Override hasConfigFiles to handle glob patterns for Xcode projects
   * @param {string} projectPath - Path to project directory
   * @returns {boolean} True if config files found
   */
  hasConfigFiles(projectPath) {
    // Check for Package.swift
    if (fileExists(path.join(projectPath, 'Package.swift'))) {
      return true;
    }
    
    // Check for Xcode project files
    return this.hasXcodeProject(projectPath);
  }
}

// Create singleton instance
const swiftDetector = new SwiftDetector();

/**
 * Detect Swift projects - maintains backward compatibility
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectSwiftProject(projectPath, result) {
  swiftDetector.detect(projectPath, result);
}

module.exports = {
  detectSwiftProject,
  SwiftDetector
};