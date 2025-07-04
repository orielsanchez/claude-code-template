/**
 * Generate YAML frontmatter for command files
 */
function generateHeader(config) {
  const { allowedTools, description, customFields = {} } = config;
  
  let toolsValue = allowedTools;
  if (Array.isArray(allowedTools)) {
    toolsValue = allowedTools.join(',');
  }
  
  let yaml = `---
allowed-tools: ${toolsValue}
description: ${description}`;

  // Add custom fields
  Object.entries(customFields).forEach(([key, value]) => {
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    yaml += `\n${kebabKey}: ${value}`;
  });

  yaml += '\n---\n';
  return yaml;
}

/**
 * Generate usage examples section
 */
function generateUsageExamples(examples) {
  let output = '**Usage:**\n';
  
  examples.forEach(example => {
    if (typeof example === 'string') {
      output += `- \`${example}\`\n`;
    } else {
      output += `- \`${example.command}\` - ${example.description}\n`;
    }
  });
  
  output += '\n**Examples:**\n';
  examples.forEach(example => {
    if (typeof example === 'string') {
      output += `- \`${example}\`\n`;
    } else {
      output += `- \`${example.command}\` - ${example.description}\n`;
    }
  });
  
  return output;
}

module.exports = {
  generateHeader,
  generateUsageExamples
};