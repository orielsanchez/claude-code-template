/**
 * Framework Detection and Auto-Configuration
 * 
 * Modular implementation using specialized language detectors
 */

const fs = require('fs');
const path = require('path');

// Import modular detection system
const { detectFrameworks } = require('./detectors');
const ConfigGeneratorFactory = require('./config-generators/ConfigGeneratorFactory');

/**
 * Generate configuration based on detected frameworks
 * @param {Object} detected - Detection results from detectFrameworks
 * @returns {Object} Configuration object
 */
function generateConfiguration(detected) {
  const generator = ConfigGeneratorFactory.create(detected);
  return generator.generate();
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