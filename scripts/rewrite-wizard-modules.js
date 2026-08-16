const fs = require('fs');
let content = fs.readFileSync('lib/installer/wizard.js', 'utf8');

// Replace stepAgents + stepSkills + stepWorkflows with stepModules
const newStepModules = `
async function stepModules() {
  currentStep++;
  printProgress();
  printStep('Module Selection', 'Choose which modules to include in your project.');

  printCoaching('Modules are curated bundles of agents, skills, and workflows. Each module handles a specific part of book production. Required modules are always included.');

  // Show required modules first
  const required = Object.values(MODULES).filter(m => m.required);
  const optional = Object.values(MODULES).filter(m => !m.required);

  // Required modules (auto-selected)
  config.selected_modules = new Set(required.map(m => m.id));
  for (const mod of required) {
    log('  ' + mod.icon + ' ' + C.brightGreen + mod.name + C.reset + ' ' + C.dim + '(required) - includes ' + mod.agents.length + ' agents, ' + mod.skills.length + ' skills, ' + mod.workflows.length + ' workflows' + C.reset);
  }

  // Optional modules
  log('');
  log('  ' + C.bold + 'Optional Modules (select what you need):' + C.reset + '\n');

  const options = optional.map(m => ({
    value: m.id,
    label: m.icon + ' ' + m.name,
    hint: m.desc + ' [' + m.agents.length + 'A/' + m.skills.length + 'S/' + m.workflows.length + 'W]'
  }));

  const result = await multiSelect(
    'Select optional modules (Space=toggle, Enter=confirm)',
    options,
    []
  );

  result.forEach(id => config.selected_modules.add(id));

  // Expand to include all agents, skills, workflows from selected modules
  expandModuleSelection();

  const totalAgents = [...new Set(Object.values(MODULES)
    .filter(m => config.selected_modules.has(m.id))
    .flatMap(m => m.agents))].length;
  const totalSkills = [...new Set(Object.values(MODULES)
    .filter(m => config.selected_modules.has(m.id))
    .flatMap(m => m.skills))].length;
  const totalWorkflows = [...new Set(Object.values(MODULES)
    .filter(m => config.selected_modules.has(m.id))
    .flatMap(m => m.workflows))].length;

  printCoaching('Module setup complete: ' + totalAgents + ' agents, ' + totalSkills + ' skills, ' + totalWorkflows + ' workflows from ' + config.selected_modules.size + ' modules.');
}

function expandModuleSelection() {
  config.selected_agents = [];
  config.selected_skills = [];
  config.selected_workflows = [];
  config.selected_validators = [];

  for (const modId of config.selected_modules) {
    const mod = MODULES[modId];
    if (!mod) continue;
    config.selected_agents.push(...mod.agents);
    config.selected_skills.push(...mod.skills);
    config.selected_workflows.push(...mod.workflows);
    config.selected_validators.push(...mod.validators);
  }

  // Deduplicate
  config.selected_agents = [...new Set(config.selected_agents)];
  config.selected_skills = [...new Set(config.selected_skills)];
  config.selected_workflows = [...new Set(config.selected_workflows)];
  config.selected_validators = [...new Set(config.selected_validators)];
}
`;

// Replace stepAgents, stepSkills, stepWorkflows with stepModules
const stepAgentsStart = content.indexOf('async function stepAgents()');
const stepSkillsEnd = content.indexOf('async function stepHosts()');

if (stepAgentsStart !== -1 && stepSkillsEnd !== -1) {
  const before = content.substring(0, stepAgentsStart);
  const after = content.substring(stepSkillsEnd);
  content = before + newStepModules + after;
  console.log('Replaced stepAgents + stepSkills + stepWorkflows with stepModules');
} else {
  console.log('Could not find step boundaries');
  console.log('stepAgentsStart:', stepAgentsStart);
  console.log('stepSkillsEnd:', stepSkillsEnd);
  process.exit(1);
}

fs.writeFileSync('lib/installer/wizard.js', content);
console.log('Done');
