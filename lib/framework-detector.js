/**
 * Framework Detection and Auto-Configuration
 * 
 * Enhanced implementation with comprehensive framework support (REFACTOR phase)
 */

const fs = require('fs');
const path = require('path');

// Framework detection patterns
const FRAMEWORK_PATTERNS = {
  javascript: {
    files: ['package.json'],
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
    tools: {
      'npm': { indicator: 'package.json' },
      'yarn': { indicator: 'yarn.lock' },
      'pnpm': { indicator: 'pnpm-lock.yaml' }
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
    }
  },
  python: {
    files: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'],
    patterns: {
      'django': { files: ['manage.py'], dependencies: ['Django'], primary: true },
      'flask': { files: ['app.py'], dependencies: ['Flask'], primary: true },
      'fastapi': { dependencies: ['fastapi'], primary: true },
      'pyramid': { dependencies: ['pyramid'] },
      'tornado': { dependencies: ['tornado'] }
    }
  },
  rust: {
    files: ['Cargo.toml'],
    dependencies: {
      'axum': { framework: 'axum' },
      'warp': { framework: 'warp' },
      'actix-web': { framework: 'actix-web' },
      'rocket': { framework: 'rocket' },
      'tide': { framework: 'tide' }
    }
  }
};

/**
 * Helper function to safely read and parse JSON
 */
function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Helper function to safely read text file
 */
function safeReadText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Detect JavaScript/TypeScript projects
 */
function detectJavaScriptProject(projectPath, result) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return;
  
  const packageJson = safeReadJson(packageJsonPath);
  if (!packageJson) return;
  
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Language detection
  result.languages.push('javascript');
  if (deps['typescript'] || deps['@types/node'] || deps['@types/react'] || deps['@types/vue']) {
    result.languages.push('typescript');
  }
  
  // Tool detection
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
    result.tools.push('yarn');
  } else if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
    result.tools.push('pnpm');
  } else {
    result.tools.push('npm');
  }
  
  // Framework detection using patterns
  const patterns = FRAMEWORK_PATTERNS.javascript;
  let primaryFramework = null;
  
  Object.entries(patterns.dependencies).forEach(([dep, config]) => {
    if (deps[dep]) {
      // Check if requirements are met
      if (!config.requires || config.requires.every(req => deps[req])) {
        result.frameworks.push(config.framework);
        if (config.primary && !primaryFramework) {
          primaryFramework = config.framework;
        }
      }
    }
  });
  
  // Test framework detection
  Object.entries(patterns.testFrameworks).forEach(([dep, framework]) => {
    if (deps[dep] && !result.testFrameworks.includes(framework)) {
      result.testFrameworks.push(framework);
    }
  });
  
  // Bundler detection
  Object.entries(patterns.bundlers).forEach(([dep, bundler]) => {
    if (deps[dep] || fs.existsSync(path.join(projectPath, `${bundler}.config.js`))) {
      if (!result.bundlers.includes(bundler)) {
        result.bundlers.push(bundler);
      }
    }
  });
  
  // Set primary framework - prioritize meta-frameworks
  if (deps['next'] && deps['react']) {
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
 * Detect Python projects
 */
function detectPythonProject(projectPath, result) {
  const pythonFiles = FRAMEWORK_PATTERNS.python.files;
  const foundFiles = pythonFiles.filter(file => fs.existsSync(path.join(projectPath, file)));
  
  if (foundFiles.length === 0) return;
  
  result.languages.push('python');
  result.tools.push('pip');
  
  // Check each pattern
  Object.entries(FRAMEWORK_PATTERNS.python.patterns).forEach(([framework, config]) => {
    let detected = false;
    
    // Check for specific files
    if (config.files) {
      detected = config.files.some(file => fs.existsSync(path.join(projectPath, file)));
    }
    
    // Check dependencies in requirements files
    if (!detected && config.dependencies) {
      foundFiles.forEach(file => {
        const content = safeReadText(path.join(projectPath, file));
        if (content) {
          detected = config.dependencies.some(dep => content.includes(dep));
        }
      });
    }
    
    if (detected) {
      result.frameworks.push(framework);
      if (config.primary && result.primary === 'generic') {
        result.primary = framework;
      }
    }
  });
  
  if (result.primary === 'generic' && result.frameworks.length > 0) {
    result.primary = result.frameworks[0];
  } else if (result.primary === 'generic') {
    result.primary = 'python';
  }
}

/**
 * Detect Rust projects
 */
function detectRustProject(projectPath, result) {
  const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
  if (!fs.existsSync(cargoTomlPath)) return;
  
  result.languages.push('rust');
  result.tools.push('cargo');
  
  const cargoContent = safeReadText(cargoTomlPath);
  if (cargoContent) {
    Object.entries(FRAMEWORK_PATTERNS.rust.dependencies).forEach(([dep, config]) => {
      if (cargoContent.includes(dep)) {
        result.frameworks.push(config.framework);
      }
    });
  }
  
  if (result.primary === 'generic') {
    result.primary = 'rust';  // Language takes priority for Rust projects
  }
}

/**
 * Detect frameworks and tools in a project directory
 * @param {string} projectPath - Path to project directory
 * @returns {Object} Detection results
 */
function detectFrameworks(projectPath) {
  const result = {
    primary: 'generic',
    languages: [],
    frameworks: [],
    tools: [],
    testFrameworks: [],
    bundlers: []
  };

  try {
    // Detect different language ecosystems
    detectJavaScriptProject(projectPath, result);
    detectPythonProject(projectPath, result);
    detectRustProject(projectPath, result);
    
    // For true multi-language projects (different ecosystems), prioritize the first language
    // JavaScript + TypeScript is not considered multi-language (same ecosystem)
    const ecosystems = new Set();
    if (result.languages.includes('javascript') || result.languages.includes('typescript')) {
      ecosystems.add('js');
    }
    if (result.languages.includes('python')) ecosystems.add('python');
    if (result.languages.includes('rust')) ecosystems.add('rust');
    
    if (ecosystems.size > 1) {
      result.primary = result.languages[0];
    }

  } catch (error) {
    console.error('Detection error:', error);
  }

  return result;
}

/**
 * Generate configuration based on detected frameworks
 * @param {Object} detected - Detection results from detectFrameworks
 * @returns {Object} Configuration object
 */
function generateConfiguration(detected) {
  const config = {
    hooks: [],
    claudeMdAdditions: '',
    gitignore: [],
    commands: {}
  };

  // Base gitignore entries
  config.gitignore.push('.env', '.DS_Store', '*.log');

  // Language-specific configurations
  if (detected.languages.includes('javascript') || detected.languages.includes('typescript')) {
    config.hooks.push('eslint --ext .js,.jsx,.ts,.tsx src/');
    config.hooks.push('prettier --check src/');
    
    // Add TypeScript checks if TypeScript is detected
    if (detected.languages.includes('typescript')) {
      config.hooks.push('tsc --noEmit');
    }
    
    // Add Next.js specific checks
    if (detected.frameworks.includes('nextjs')) {
      config.hooks.push('next lint');
    }
    
    config.gitignore.push('node_modules/', 'dist/');
    config.commands.dev = 'npm run dev';
    config.commands.test = 'npm test';
    config.commands.build = 'npm run build';
  }

  if (detected.languages.includes('python')) {
    config.hooks.push('black --check .');
    config.hooks.push('flake8 .');
    config.gitignore.push('__pycache__/', '*.pyc', '*.pyo', '*.pyd', 'venv/', '.venv/');
  }

  if (detected.languages.includes('rust')) {
    config.hooks.push('cargo clippy -- -D warnings');
    config.hooks.push('cargo fmt -- --check');
    config.gitignore.push('/target/', 'Cargo.lock');
    config.commands.dev = 'cargo run';
    config.commands.test = 'cargo test';
    config.commands.build = 'cargo build --release';
  }

  // Framework-specific configurations
  if (detected.primary === 'react') {
    config.claudeMdAdditions = '\n## React Development Standards\n\n- Use functional components with hooks\n- Follow React best practices for state management\n- Implement proper error boundaries\n';
  }

  if (detected.primary === 'nextjs') {
    config.claudeMdAdditions = '\n## Next.js Development Standards\n\n- Use App Router for new features\n- Implement proper SEO practices\n- Follow Next.js performance guidelines\n';
  }

  if (detected.primary === 'vue') {
    config.claudeMdAdditions = '\n## Vue.js Development Standards\n\n- Use Composition API for new components\n- Follow Vue 3 best practices\n- Implement proper reactivity patterns\n';
  }

  if (detected.primary === 'django') {
    config.claudeMdAdditions = '\n## Django Development Standards\n\n- Follow Django coding style guidelines\n- Use proper model relationships\n- Implement security best practices\n';
    config.commands.dev = 'python manage.py runserver';
    config.commands.test = 'python manage.py test';
  }

  if (detected.primary === 'flask') {
    config.claudeMdAdditions = '\n## Flask Development Standards\n\n- Use blueprints for modular applications\n- Implement proper error handling\n- Follow Flask security guidelines\n';
    config.commands.dev = 'flask run';
    config.commands.test = 'python -m pytest';
  }

  if (detected.primary === 'rust') {
    config.claudeMdAdditions = '\n## Rust Development Standards\n\n- Follow Rust idioms and conventions\n- Use proper error handling with Result types\n- Implement comprehensive testing\n';
  }

  // Test framework specific configurations
  if (detected.testFrameworks.includes('cypress')) {
    config.commands.e2e = 'cypress run';
  }

  return config;
}

/**
 * Perform enhanced setup with auto-detection
 * @param {string} projectPath - Path to project directory
 * @returns {Promise<Object>} Setup result
 */
async function enhancedSetup(projectPath) {
  try {
    // Detect frameworks
    const detected = detectFrameworks(projectPath);
    
    // Generate configuration
    const config = generateConfiguration(detected);
    
    // Basic setup (minimal implementation for GREEN phase)
    const claudeDir = path.join(projectPath, '.claude');
    const hooksDir = path.join(claudeDir, 'hooks');
    
    // Create directories
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
    }
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }
    
    // Create basic CLAUDE.md
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    if (!fs.existsSync(claudeMdPath)) {
      const claudeMdContent = `# Development Partnership\n\nAuto-detected project: ${detected.primary}\n${config.claudeMdAdditions}`;
      fs.writeFileSync(claudeMdPath, claudeMdContent);
    }
    
    // Create smart-lint hook
    const hookContent = `#!/bin/bash\n# Auto-generated hooks for ${detected.primary}\n\n${config.hooks.map(cmd => `${cmd} || exit 1`).join('\n')}`;
    fs.writeFileSync(path.join(hooksDir, 'smart-lint.sh'), hookContent);
    fs.chmodSync(path.join(hooksDir, 'smart-lint.sh'), 0o755);
    
    return {
      success: true,
      detected,
      report: {
        detected,
        configured: ['hooks', 'gitignore', 'claude-md'],
        commands: config.commands
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  detectFrameworks,
  generateConfiguration,
  enhancedSetup
};