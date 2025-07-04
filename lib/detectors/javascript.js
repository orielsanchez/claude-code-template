/**
 * JavaScript/TypeScript Project Detection
 * 
 * Specialized detector for JavaScript and TypeScript projects
 */

const path = require('path');
const { safeReadJson, fileExists } = require('./shared-utils');

// JavaScript/TypeScript specific patterns
const JS_PATTERNS = {
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

/**
 * Detect language (JavaScript/TypeScript)
 * @param {Object} dependencies - Combined dependencies from package.json
 * @param {Object} result - Detection result object to modify
 */
function detectLanguage(dependencies, result) {
  result.languages.push('javascript');
  
  const hasTypeScript = JS_PATTERNS.typeScriptIndicators.some(indicator => 
    dependencies[indicator]
  );
  
  if (hasTypeScript) {
    result.languages.push('typescript');
  }
}

/**
 * Detect package manager tools
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectTools(projectPath, result) {
  if (fileExists(path.join(projectPath, 'yarn.lock'))) {
    result.tools.push('yarn');
  } else if (fileExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
    result.tools.push('pnpm');
  } else {
    result.tools.push('npm');
  }
}

/**
 * Detect JavaScript frameworks
 * @param {Object} dependencies - Combined dependencies from package.json
 * @param {Object} result - Detection result object to modify
 * @returns {string|null} Primary framework detected
 */
function detectFrameworks(dependencies, result) {
  let primaryFramework = null;
  
  Object.entries(JS_PATTERNS.dependencies).forEach(([dep, config]) => {
    if (dependencies[dep]) {
      // Check if requirements are met
      if (!config.requires || config.requires.every(req => dependencies[req])) {
        result.frameworks.push(config.framework);
        if (config.primary && !primaryFramework) {
          primaryFramework = config.framework;
        }
      }
    }
  });
  
  return primaryFramework;
}

/**
 * Detect test frameworks
 * @param {Object} dependencies - Combined dependencies from package.json
 * @param {Object} result - Detection result object to modify
 */
function detectTestFrameworks(dependencies, result) {
  Object.entries(JS_PATTERNS.testFrameworks).forEach(([dep, framework]) => {
    if (dependencies[dep] && !result.testFrameworks.includes(framework)) {
      result.testFrameworks.push(framework);
    }
  });
}

/**
 * Detect bundlers
 * @param {Object} dependencies - Combined dependencies from package.json
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectBundlers(dependencies, projectPath, result) {
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
 * @param {Object} dependencies - Combined dependencies from package.json
 * @param {Object} result - Detection result object to modify
 * @param {string|null} primaryFramework - Detected primary framework
 */
function resolvePrimaryFramework(dependencies, result, primaryFramework) {
  // Set primary framework - prioritize meta-frameworks
  if (dependencies['next'] && dependencies['react']) {
    result.primary = 'nextjs';
  } else if (primaryFramework) {
    result.primary = primaryFramework;
  } else if (result.frameworks.length > 0) {
    result.primary = result.frameworks[0];
  } else {
    result.primary = 'javascript';
  }
}

/**
 * Detect JavaScript/TypeScript projects
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectJavaScriptProject(projectPath, result) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fileExists(packageJsonPath)) return;
  
  const packageJson = safeReadJson(packageJsonPath);
  if (!packageJson) return;
  
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Run all detection phases
  detectLanguage(dependencies, result);
  detectTools(projectPath, result);
  const primaryFramework = detectFrameworks(dependencies, result);
  detectTestFrameworks(dependencies, result);
  detectBundlers(dependencies, projectPath, result);
  resolvePrimaryFramework(dependencies, result, primaryFramework);
}

module.exports = {
  detectJavaScriptProject,
  // Export individual functions for testing
  detectLanguage,
  detectTools,
  detectFrameworks,
  detectTestFrameworks,
  detectBundlers,
  resolvePrimaryFramework
};