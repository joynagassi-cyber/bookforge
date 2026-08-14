import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createParty, getParty, addMember, addTurn, getHistory, endParty, listParties } from '../../runtime/party/orchestrator.js';

const TEST_PROJECT = join(process.cwd(), 'test-project-party');

describe('Party Mode', () => {
  before(() => { mkdirSync(TEST_PROJECT, { recursive: true }); });
  after(() => { rmSync(TEST_PROJECT, { recursive: true, force: true }); });

  it('should create a party', () => {
    const party = createParty(TEST_PROJECT, 'test-party', {
      members: [{ name: 'Alice', role: 'developer' }, { name: 'Bob', role: 'designer' }]
    });
    assert.ok(party.party_id);
    assert.equal(party.members_count, 2);
  });

  it('should list parties', () => {
    const parties = listParties(TEST_PROJECT);
    assert.ok(parties.length >= 1);
  });

  it('should get a party', () => {
    const party = getParty(TEST_PROJECT, 'test-party');
    assert.ok(party);
    assert.equal(party.party_id, 'test-party');
  });

  it('should add a member', () => {
    const result = addMember(TEST_PROJECT, 'test-party', { name: 'Charlie', role: 'writer' });
    assert.equal(result.members_count, 3);
  });

  it('should add a turn', () => {
    const result = addTurn(TEST_PROJECT, 'test-party', {
      speaker: 'Alice',
      content: 'I think we should use a simpler architecture.'
    });
    assert.ok(result.turn_id);
  });

  it('should get history', () => {
    const history = getHistory(TEST_PROJECT, 'test-party');
    assert.ok(history);
    assert.ok(history.members);
  });

  it('should end a party', () => {
    const result = endParty(TEST_PROJECT, 'test-party');
    assert.equal(result.status, 'ended');
  });
});
