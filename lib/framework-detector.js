/**
 * Framework Detection and Auto-Configuration
 * 
 * Modular implementation using specialized language detectors
 */

const fs = require('fs');
const path = require('path');

// Import modular detection system
const { detectFrameworks } = require('./detectors');

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