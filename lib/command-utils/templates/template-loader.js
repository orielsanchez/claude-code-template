const { templateManager } = require('./template-manager');

/**
 * Load and process template files with variable substitution
 * Enhanced with caching, better error handling, and validation
 */
function loadTemplate(templateName, variables = {}) {
  return templateManager.loadTemplate(templateName, variables);
}

/**
 * Validate a template exists and get its variables
 */
function validateTemplate(templateName) {
  return templateManager.loader.validateTemplate(templateName);
}

/**
 * Get all variables used in a template
 */
function getTemplateVariables(templateName) {
  return templateManager.getTemplateVariables(templateName);
}

/**
 * Clear template cache
 */
function clearTemplateCache() {
  templateManager.clearCache();
}

/**
 * Get cache statistics
 */
function getTemplateCacheStats() {
  return templateManager.getCacheStats();
}

module.exports = {
  loadTemplate,
  validateTemplate,
  getTemplateVariables,
  clearTemplateCache,
  getTemplateCacheStats
};