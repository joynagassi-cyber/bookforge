#!/usr/bin/env node
import { main } from '../lib/cli/main.js';
main(process.argv.slice(2)).catch(err => { console.error(`BookForge error: ${err.message}`); process.exitCode = 1; });
