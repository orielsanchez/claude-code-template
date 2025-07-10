/**
 * JavaScript/TypeScript Configuration Generator
 * 
 * Generates configuration for JavaScript and TypeScript projects
 */

const BaseConfigGenerator = require('./BaseConfigGenerator');

class JavaScriptConfigGenerator extends BaseConfigGenerator {
  /**
   * Generate JavaScript/TypeScript specific configuration
   * @returns {Object} Complete configuration object
   */
  generate() {
    // Start with base configuration
    this.generateBase();

    // Handle null/undefined detected objects gracefully
    if (!this.detected) {
      return this.config;
    }

    // JavaScript/TypeScript specific hooks
    const hooks = ['eslint --ext .js,.jsx,.ts,.tsx src/', 'prettier --check src/'];
    
    // Add TypeScript checks if TypeScript is detected
    if (this.detected.languages && this.detected.languages.includes('typescript')) {
      hooks.push('tsc --noEmit');
    }
    
    // Add Next.js specific checks
    if (this.detected.frameworks && this.detected.frameworks.includes('nextjs')) {
      hooks.push('next lint');
    }
    
    this.addHooks(hooks);

    // JavaScript/TypeScript specific gitignore
    this.addGitignore(['node_modules/', 'dist/']);

    // JavaScript/TypeScript specific commands
    const commands = {
      dev: 'npm run dev',
      test: 'npm test',
      build: 'npm run build'
    };
    this.addCommands(commands);

    // Framework-specific Claude.md additions
    this.generateFrameworkAdditions();

    // Test framework specific configurations
    this.generateTestFrameworkConfig();

    return this.config;
  }

  /**
   * Generate framework-specific Claude.md additions
   */
  generateFrameworkAdditions() {
    if (!this.detected) return;

    if (this.detected.primary === 'react') {
      this.addClaudeMdAdditions('\n## React Development Standards\n\n- Use functional components with hooks\n- Follow React best practices for state management\n- Implement proper error boundaries\n');
    }

    if (this.detected.primary === 'nextjs') {
      this.addClaudeMdAdditions('\n## Next.js Development Standards\n\n- Use App Router for new features\n- Implement proper SEO practices\n- Follow Next.js performance guidelines\n');
    }

    if (this.detected.primary === 'vue') {
      this.addClaudeMdAdditions('\n## Vue.js Development Standards\n\n- Use Composition API for new components\n- Follow Vue 3 best practices\n- Implement proper reactivity patterns\n');
    }

    if (this.detected.primary === 'express') {
      this.addClaudeMdAdditions('\n## Express.js Development Standards\n\n- Use middleware for cross-cutting concerns\n- Implement proper error handling\n- Follow REST API best practices\n');
    }
  }

  /**
   * Generate test framework specific configurations
   */
  generateTestFrameworkConfig() {
    if (this.detected.testFrameworks && this.detected.testFrameworks.includes('cypress')) {
      this.addCommands({ e2e: 'cypress run' });
    }
  }
}

module.exports = JavaScriptConfigGenerator;