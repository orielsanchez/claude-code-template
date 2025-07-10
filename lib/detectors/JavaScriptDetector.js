/**
 * JavaScript/TypeScript Project Detector
 * 
 * Specialized detector for JavaScript and TypeScript projects
 */

const path = require('path');
const { safeReadJson, fileExists } = require('./shared-utils');
const AbstractDetector = require('./AbstractDetector');

// JavaScript/TypeScript specific patterns
const JS_PATTERNS = {
  configFiles: ['package.json'],
  dependencies: {
    'react': { framework: 'react', primary: true },
    'vue': { framework: 'vue', primary: true },
    'angular': { framework: 'angular', primary: true },
    'svelte': { framework: 'svelte', primary: true },
    'next': { framework: 'nextjs', primary: true, requires: ['react'] },
    'nuxt': { framework: 'nuxtjs', primary: true, requires: ['vue'] },
    'express': { framework: 'express' },
    'fastify': { framework: 'fastify' },
    'koa': { framework: 'koa' },
    'nest': { framework: 'nestjs', primary: true },
    '@nestjs/core': { framework: 'nestjs', primary: true }
  },
  testFrameworks: {
    'jest': 'jest',
    'vitest': 'vitest', 
    'cypress': 'cypress',
    'playwright': 'playwright',
    '@testing-library/react': 'testing-library',
    '@testing-library/vue': 'testing-library',
    'mocha': 'mocha',
    'jasmine': 'jasmine'
  },
  bundlers: {
    'vite': 'vite',
    'webpack': 'webpack',
    'rollup': 'rollup',
    'parcel': 'parcel',
    'esbuild': 'esbuild'
  },
  typeScriptIndicators: ['typescript', '@types/node', '@types/react', '@types/vue']
};

class JavaScriptDetector extends AbstractDetector {
  constructor() {
    super(JS_PATTERNS);
    this.dependencies = null;
  }

  /**
   * Detect and add JavaScript/TypeScript languages
   * @param {Object} result - Detection result object to modify
   */
  detectLanguage(result) {
    result.languages.push('javascript');
    
    // TypeScript detection will be done in detectFrameworks after dependencies are loaded
  }

  /**
   * Detect and add package manager tools
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectTools(projectPath, result) {
    if (fileExists(path.join(projectPath, 'yarn.lock'))) {
      result.tools.push('yarn');
    } else if (fileExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
      result.tools.push('pnpm');
    } else {
      result.tools.push('npm');
    }
  }

  /**
   * Detect JavaScript/TypeScript frameworks and tools
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectFrameworks(projectPath, result) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = safeReadJson(packageJsonPath);
    if (!packageJson) return;
    
    this.dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for TypeScript now that dependencies are loaded
    const hasTypeScript = JS_PATTERNS.typeScriptIndicators.some(indicator => 
      this.dependencies[indicator]
    );
    
    if (hasTypeScript && !result.languages.includes('typescript')) {
      result.languages.push('typescript');
    }
    
    // Detect frameworks
    this.primaryFramework = this.detectFrameworksFromDependencies(
      this.dependencies, 
      result, 
      JS_PATTERNS.dependencies
    );
    
    // Detect test frameworks
    this.detectTestFrameworksFromDependencies(
      this.dependencies, 
      result, 
      JS_PATTERNS.testFrameworks
    );
    
    // Detect bundlers
    this.detectBundlers(this.dependencies, projectPath, result);
  }

  /**
   * Detect bundlers
   * @param {Object} dependencies - Combined dependencies from package.json
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectBundlers(dependencies, projectPath, result) {
    Object.entries(JS_PATTERNS.bundlers).forEach(([dep, bundler]) => {
      const hasDependency = dependencies[dep];
      const hasConfig = fileExists(path.join(projectPath, `${bundler}.config.js`));
      
      if ((hasDependency || hasConfig) && !result.bundlers.includes(bundler)) {
        result.bundlers.push(bundler);
      }
    });
  }

  /**
   * Resolve primary framework with special logic
   * @param {Object} result - Detection result object to modify
   */
  resolvePrimary(result) {
    // Set primary framework - prioritize meta-frameworks
    if (this.dependencies['next'] && this.dependencies['react']) {
      result.primary = 'nextjs';
    } else if (this.primaryFramework) {
      result.primary = this.primaryFramework;
    } else if (result.frameworks.length > 0) {
      result.primary = result.frameworks[0];
    } else {
      result.primary = 'javascript';
    }
  }
}

// Create singleton instance
const jsDetector = new JavaScriptDetector();

/**
 * Detect JavaScript/TypeScript projects - maintains backward compatibility
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectJavaScriptProject(projectPath, result) {
  jsDetector.detect(projectPath, result);
}

module.exports = {
  detectJavaScriptProject,
  JavaScriptDetector
};