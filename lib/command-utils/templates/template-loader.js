const fs = require('fs');
const path = require('path');

/**
 * Load and process template files with variable substitution
 */
function loadTemplate(templateName, variables = {}) {
  const templatePath = path.join(__dirname, `${templateName}.md`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  let content = fs.readFileSync(templatePath, 'utf8');
  
  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    if (Array.isArray(value)) {
      // Format array as numbered list for steps
      if (key === 'phaseSteps') {
        const numberedSteps = value.map((step, index) => `${index + 1}. ${step}`).join('\n');
        content = content.replace(regex, numberedSteps);
      } else if (value.length === 0) {
        // For empty arrays, remove the entire line to avoid extra whitespace
        content = content.replace(new RegExp(`\\n?{{${key}}}\\n?`, 'g'), '');
      } else {
        content = content.replace(regex, value.join(','));
      }
    } else if (value === '' || value === null || value === undefined) {
      // For empty values, remove the entire line to avoid extra whitespace
      content = content.replace(new RegExp(`\\n?{{${key}}}\\n?`, 'g'), '');
    } else {
      content = content.replace(regex, value);
    }
  });
  
  return content;
}

module.exports = {
  loadTemplate
};