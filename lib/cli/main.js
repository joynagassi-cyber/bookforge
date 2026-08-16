import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initProject, status, validate, doctor, interactiveInstall } from '../installer/installer.js';
import { listPlugins, enable as enablePlugin, remove as removePlugin, installPluginPackage, activatePlugins, route as routeContext, contextPackV05, planWorkflow, startWorkflow, transitionWorkflow, syncGraphV05, generateHost } from '../../runtime/cli-runtime.js';
import { runPipeline, getPipelineStatus, resetPipelineProgress } from '../../runtime/workflow/pipeline.js';
import { quickInit } from './quick-init.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const projectDir = (args) => {
  // First check for --directory flag
  const dirIndex = args.indexOf('--directory');
  if (dirIndex >= 0 && args[dirIndex + 1]) {
    return path.resolve(args[dirIndex + 1]);
  }
  // Then look for positional args that look like paths
  const pathArgs = args.filter(x => !x.startsWith('--') && (x.match(/^\./) || x.match(/^\//) || x === '.' || x === '..'));
  return pathArgs.length > 0 ? path.resolve(pathArgs[0]) : process.cwd();
};
function positionals(args) {
  const out = [];
  const flags = new Set(['--directory', '--id', '--source', '--mode', '--host', '--graph', '--template', '--agent', '--workflow', '--genre', '--book-type', '--audience', '--budget', '--yes', '--topic', '--book-title', '--author', '--language', '--length', '--quick']);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      if (flags.has(args[i])) i++;
      continue;
    }
    out.push(args[i]);
  }
  return out;
}
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
function arg(args, name, fallback = null) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? fallback : fallback;
}
function has(args, name) { return args.includes(name); }

export async function main(args) {
  const cmd = args[0] || 'help';
  switch (cmd) {
    case 'install':
    case 'init': {
      const pos = positionals(args).filter(x => x !== 'init' && x !== 'install');
      const dir = arg(args, '--directory', pos[0] || process.cwd());
      const yes = has(args, '--yes');
      const quick = has(args, '--quick');

      if (quick) {
        // Quick init mode
        return quickInit(path.resolve(dir), {
          topic: arg(args, '--topic'),
          audience: arg(args, '--audience'),
          genre: arg(args, '--genre') || arg(args, '--book-type'),
          yes: true
        });
      }

      if (yes) {
        return initProject(path.resolve(dir), {
          template: arg(args, '--template', 'book'),
          host: arg(args, '--host', 'auto'),
          graph: arg(args, '--graph', 'none'),
          bookType: arg(args, '--book-type', 'General Book'),
          genre: arg(args, '--genre'),
          audience: arg(args, '--audience'),
          author: arg(args, '--author'),
          bookTitle: arg(args, '--book-title'),
          yes: true
        });
      } else {
        return interactiveInstall(path.resolve(dir), {
          template: arg(args, '--template', 'book'),
          host: arg(args, '--host', 'auto'),
          graph: arg(args, '--graph', 'none'),
          bookType: arg(args, '--book-type', 'General Book'),
          genre: arg(args, '--genre'),
          audience: arg(args, '--audience'),
          author: arg(args, '--author'),
          bookTitle: arg(args, '--book-title'),
          communication_language: arg(args, '--language')
        }).then(installConfig => {
          if (!installConfig) return;
          return initProject(installConfig.project || path.resolve(dir), {
            template: 'book',
            host: installConfig.selected_hosts?.[0] || 'auto',
            graph: installConfig.graph_provider || 'none',
            bookType: installConfig.genre || 'General Book',
            genre: installConfig.genre,
            audience: installConfig.target_audience,
            author: installConfig.author_name,
            bookTitle: installConfig.book_title,
            knowledge: installConfig.knowledge,
            yes: true
          });
        });
      }
    }
    case 'wizard':
      return interactiveInstall(process.cwd(), {});
    case 'status': {
      const projectPath = projectDir(args);
      return status(projectPath);
    }
    case 'validate': {
      const validateProject = projectDir(args);
      return validate(validateProject);
    }
    case 'doctor': {
      const doctorProject = projectDir(args);
      return doctor(doctorProject);
    }
    case 'plugin': {
      const sub = args[1] || 'list';
      const project = projectDir(args);
      if (sub === 'list') return console.log(JSON.stringify(listPlugins(project), null, 2));
      if (sub === 'add') {
        const r = installPluginPackage(project, arg(args, '--source') || args[2], { enable: true });
        activatePlugins(project, { host: arg(args, '--host', 'generic') });
        return console.log(JSON.stringify(r, null, 2));
      }
      if (sub === 'enable') return console.log(JSON.stringify(enablePlugin(project, args[2], true), null, 2));
      if (sub === 'disable') return console.log(JSON.stringify(enablePlugin(project, args[2], false), null, 2));
      if (sub === 'remove') return console.log(JSON.stringify({ removed: removePlugin(project, args[2]) }, null, 2));
      return installPlugin(project, arg(args, '--id'), arg(args, '--source'));
    }
    case 'host':
      return console.log(JSON.stringify(generateHost(projectDir(args), arg(args, '--id', 'generic')), null, 2));
    case 'graph': {
      const sub = args[1] || 'status';
      const project = projectDir(args);
      if (sub === 'status') return console.log(fs.readFileSync(path.join(project, 'bookforge', 'graph', 'provider.json'), 'utf8'));
      if (sub === 'sync') return console.log(JSON.stringify(await syncGraphV05(project), null, 2));
      throw new Error('graph status|sync');
    }
    case 'graph-sync':
      return console.log(JSON.stringify(await syncGraphV05(projectDir(args)), null, 2));
    case 'route': {
      const q = positionals(args).filter(x => x !== 'route').join(' ');
      return console.log(JSON.stringify(routeContext(projectDir(args), {
        task: q,
        agent: arg(args, '--agent'),
        workflow: arg(args, '--workflow'),
        genre: arg(args, '--genre'),
        bookType: arg(args, '--book-type'),
        audience: arg(args, '--audience')
      }), null, 2));
    }
    case 'workflow': {
      const sub = args[1] || 'plan';
      const project = projectDir(args);
      if (sub === 'plan') {
        const workflowId = args[2];
        const task = args.slice(3).filter(x => !x.startsWith('--')).join(' ');
        return console.log(JSON.stringify(await planWorkflow(project, workflowId, {
          task,
          agent: arg(args, '--agent'),
          genre: arg(args, '--genre'),
          bookType: arg(args, '--book-type'),
          audience: arg(args, '--audience')
        }), null, 2));
      }
      if (sub === 'start') {
        const plan = JSON.parse(fs.readFileSync(args[2], 'utf8'));
        return console.log(JSON.stringify(startWorkflow(project, plan), null, 2));
      }
      if (sub === 'run') {
        const task = positionals(args).filter(x => x !== 'workflow' && x !== 'run' && x !== args[2]).join(' ');
        const p = await planWorkflow(project, args[2], {
          task,
          agent: arg(args, '--agent'),
          genre: arg(args, '--genre'),
          bookType: arg(args, '--book-type'),
          audience: arg(args, '--audience')
        });
        return console.log(JSON.stringify(startWorkflow(project, p), null, 2));
      }
      if (sub === 'transition') return console.log(JSON.stringify(transitionWorkflow(project, args[2], args[3]), null, 2));
      throw new Error('workflow plan|start|run|transition');
    }
    case 'context-pack': {
      const q = positionals(args).filter(x => x !== 'context-pack').join(' ');
      return console.log(JSON.stringify(await contextPackV05(projectDir(args), {
        task: q,
        agent: arg(args, '--agent'),
        workflow: arg(args, '--workflow'),
        genre: arg(args, '--genre'),
        bookType: arg(args, '--book-type'),
        audience: arg(args, '--audience'),
        budget: Number(arg(args, '--budget', '5000'))
      }), null, 2));
    }
    case 'catalog-search': {
      const q = positionals(args).filter(x => x !== 'catalog-search').join(' ');
      return console.log(JSON.stringify(await (await import('../../runtime/retrieval.js')).search(projectDir(args), q, { catalog: arg(args, '--catalog') }), null, 2));
    }
    case 'pipeline': {
      const sub = args[1] || 'status';
      const project = projectDir(args);
      if (sub === 'run') {
        const chapterStart = Number(arg(args, '--chapter-start', '1'));
        const chapterEnd = Number(arg(args, '--chapter-end', '10'));
        const parallel = has(args, '--parallel');
        const dryRun = has(args, '--dry-run');
        const result = await runPipeline(project, {
          chapterStart,
          chapterEnd,
          parallel,
          dryRun
        });
        return console.log(JSON.stringify(result, null, 2));
      }
      if (sub === 'status') {
        return console.log(JSON.stringify(getPipelineStatus(project), null, 2));
      }
      if (sub === 'reset') {
        return console.log(JSON.stringify(resetPipelineProgress(project), null, 2));
      }
      throw new Error('pipeline run|status|reset');
    }
    case 'quick-init': {
      const pos = positionals(args).filter(x => x !== 'quick-init');
      const dir = arg(args, '--directory', pos[0] || process.cwd());
      const topic = arg(args, '--topic');
      const audience = arg(args, '--audience');
      const genre = arg(args, '--genre');
      const bookType = arg(args, '--book-type');
      const yes = has(args, '--yes');
      return quickInit(path.resolve(dir), { topic, audience, genre, bookType, yes });
    }
    case 'watch':
      return (await import('../../runtime/watch.js')).watch(projectDir(args), { syncGraph: has(args, '--sync') });
    case 'help':
    default:
      console.log(`BookForge ${pkg.version}

Commands:
  bookforge install|init [path] [--quick] [--host auto|all|<host>] [--graph none|jsonl|neo4j]
    [--genre type] [--audience "readers"] [--book-title "My Book"] [--author "Name"] [--yes]
  bookforge wizard                     Start interactive setup wizard (full customization)
  bookforge quick-init --topic "..." [--audience "..."] [--genre type]
    Fast setup — creates project with smart defaults in seconds
  bookforge status
  bookforge validate
  bookforge doctor
  bookforge pipeline run [--chapter-start N] [--chapter-end N] [--parallel] [--dry-run]
  bookforge pipeline status
  bookforge pipeline reset
  bookforge plugin list|add|enable|disable|remove
  bookforge host --id <host-id>
  bookforge graph status|sync
  bookforge graph-sync
  bookforge watch [--sync]
  bookforge catalog-search <query> [--catalog id]
  bookforge route <task> [--agent id] [--workflow id]
  bookforge context-pack <task> [--agent id] [--workflow id] [--budget N]
  bookforge workflow plan <workflow-id> <task> [--agent id]
  bookforge workflow start <plan.json>
  bookforge workflow transition <run-id> <state>`);
  }
}
