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

    // Handle null/undefined detected objects gracefully
    if (!this.detected) {
      return this.config;
    }

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
    if (!this.detected) return;

    if (this.detected.primary === 'django') {
      this.addClaudeMdAdditions('\n## Django Development Standards\n\n- Follow Django coding style guidelines\n- Use proper model relationships\n- Implement security best practices\n');
      this.addCommands({
        dev: 'python manage.py runserver',
        test: 'python manage.py test',
        migrate: 'python manage.py migrate',
        makemigrations: 'python manage.py makemigrations',
        shell: 'python manage.py shell'
      });
    }

    if (this.detected.primary === 'flask') {
      this.addClaudeMdAdditions('\n## Flask Development Standards\n\n- Use blueprints for modular applications\n- Implement proper error handling\n- Follow Flask security guidelines\n');
      this.addCommands({
        dev: 'flask run',
        test: 'python -m pytest'
      });
    }

    if (this.detected.primary === 'fastapi') {
      this.addClaudeMdAdditions('\n## FastAPI Development Standards\n\n- Use async/await for async operations\n- Implement proper dependency injection\n- Follow FastAPI security practices\n');
      this.addCommands({
        dev: 'uvicorn main:app --reload',
        test: 'python -m pytest'
      });
    }

    // Generic Python commands for common patterns
    if (this.detected.testFrameworks?.includes('pytest')) {
      this.addCommands({
        coverage: 'python -m pytest --cov'
      });
    }

    // Package manager specific commands
    if (this.detected.tools?.includes('poetry')) {
      this.addCommands({
        install: 'poetry install',
        shell: 'poetry shell'
      });
    }

    if (this.detected.tools?.includes('pipenv')) {
      this.addCommands({
        install: 'pipenv install',
        shell: 'pipenv shell'
      });
    }

    // Virtual environment detection
    if (this.detected.tools?.includes('venv') || this.detected.frameworks?.includes('venv') || this.detected.hasVirtualEnv) {
      this.addClaudeMdAdditions('\n## Virtual Environment\n\n- Use virtual environments for dependency isolation\n- Activate before development\n');
      this.addCommands({
        activate: 'source venv/bin/activate'
      });
    }

    // MyPy type checking
    if (this.detected.tools?.includes('mypy') || this.detected.hasMyPy) {
      this.addHooks(['mypy .']);
      this.addClaudeMdAdditions('\n## Type Checking\n\n- Use MyPy for static type checking\n- Add type annotations to all functions\n');
    }

    // Generic Python fallback
    if (!this.detected.primary || this.detected.primary === 'python') {
      this.addClaudeMdAdditions('\n## Python Development Standards\n\n- Follow PEP 8 style guidelines\n- Use type hints for better code quality\n- Write comprehensive tests\n');
      this.addCommands({
        test: 'python -m pytest'
      });
    }
  }
}

module.exports = PythonConfigGenerator;