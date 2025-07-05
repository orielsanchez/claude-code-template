/**
 * Python Configuration Generator
 * 
 * Generates configuration for Python projects
 */

const BaseConfigGenerator = require('./BaseConfigGenerator');

class PythonConfigGenerator extends BaseConfigGenerator {
  /**
   * Generate Python specific configuration
   * @returns {Object} Complete configuration object
   */
  generate() {
    // Start with base configuration
    this.generateBase();

    // Python specific hooks
    const hooks = ['black --check .', 'flake8 .'];
    this.addHooks(hooks);

    // Python specific gitignore
    this.addGitignore(['__pycache__/', '*.pyc', '*.pyo', '*.pyd', 'venv/', '.venv/']);

    // Framework-specific configurations
    this.generateFrameworkConfig();

    return this.config;
  }

  /**
   * Generate framework-specific configurations
   */
  generateFrameworkConfig() {
    if (this.detected.primary === 'django') {
      this.addClaudeMdAdditions('\n## Django Development Standards\n\n- Follow Django coding style guidelines\n- Use proper model relationships\n- Implement security best practices\n');
      this.addCommands({
        dev: 'python manage.py runserver',
        test: 'python manage.py test'
      });
    }

    if (this.detected.primary === 'flask') {
      this.addClaudeMdAdditions('\n## Flask Development Standards\n\n- Use blueprints for modular applications\n- Implement proper error handling\n- Follow Flask security guidelines\n');
      this.addCommands({
        dev: 'flask run',
        test: 'python -m pytest'
      });
    }
  }
}

module.exports = PythonConfigGenerator;