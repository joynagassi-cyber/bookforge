#!/usr/bin/env node
import { createParty, getParty, listParties, addMember, addTurn, getHistory, endParty } from '../runtime/party/orchestrator.js';
import { bfPath, exists, readJson } from '../runtime/core/io.js';

function main(args) {
  const project = args.project || process.cwd();
  const command = args[0];
  const partyId = args[1];
  if (!command) {
    console.log('BookForge Party Mode — Multi-agent conversation orchestrator');
    console.log('');
    console.log('Usage:');
    console.log('  bookforge party list');
    console.log('  bookforge party create <id> --members <json>');
    console.log('  bookforge party add <id> --member <json>');
    console.log('  bookforge party turn <id> --speaker <name> --content <text>');
    console.log('  bookforge party history <id>');
    console.log('  bookforge party end <id>');
    return;
  }
  switch (command) {
    case 'list': {
      const parties = listParties(project);
      console.log(JSON.stringify(parties, null, 2));
      break;
    }
    case 'create': {
      const membersArg = args.find(a => a.startsWith('--members='));
      const members = membersArg ? JSON.parse(membersArg.split('=')[1]) : [];
      const party = createParty(project, partyId, { members });
      console.log(JSON.stringify(party, null, 2));
      break;
    }
    case 'add': {
      const memberArg = args.find(a => a.startsWith('--member='));
      const member = memberArg ? JSON.parse(memberArg.split('=')[1]) : null;
      if (!member) { console.error('Member JSON required'); process.exit(1); }
      const result = addMember(project, partyId, member);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'turn': {
      const speaker = args.find(a => a.startsWith('--speaker='))?.split('=')[1];
      const content = args.find(a => a.startsWith('--content='))?.split('=').slice(1).join('=');
      if (!speaker || !content) { console.error('Speaker and content required'); process.exit(1); }
      const result = addTurn(project, partyId, { speaker, content });
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'history': {
      const history = getHistory(project, partyId);
      console.log(JSON.stringify(history, null, 2));
      break;
    }
    case 'end': {
      const result = endParty(project, partyId);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main(process.argv.slice(2));
