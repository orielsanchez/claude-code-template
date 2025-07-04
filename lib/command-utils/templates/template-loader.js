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
      } else {
        content = content.replace(regex, value.join(','));
      }
    } else {
      content = content.replace(regex, value);
    }
  });
  
  return content;
}

module.exports = {
  loadTemplate
};