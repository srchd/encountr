import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FiveToolsClient } from '../../services/fiveToolsClient';
import type { EncounterState } from '../../types/encounter';

// Mock PeerVeClient at global level
let capturedDataHandler: ((data: any) => void) | null = null;

beforeEach(() => {
  capturedDataHandler = null;
  (globalThis as any).PeerVeClient = class {
    async pConnectToServer(
      _token: string,
      dataHandler: (data: any) => void,
    ) {
      capturedDataHandler = dataHandler;
    }
  };
});

function makePlayers(names: { name: string; avatarUrl: string }[]) {
  return names.map((p, i) => ({ id: String(i), ...p }));
}

function makePayload(rows: any[], round = 1) {
  return {
    data: {
      payload: {
        round,
        rows,
      },
    },
  };
}

describe('FiveToolsClient', () => {
  it('calls listener when encounter data arrives', async () => {
    const players = makePlayers([
      { name: 'Gandalf', avatarUrl: 'http://img/gandalf.png' },
    ]);
    const client = new FiveToolsClient(players, 'test-token');

    const listener = vi.fn();
    client.onStateUpdate(listener);

    // Wait for async connect
    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([
        { name: 'Gandalf', initiative: 18, hpCurrent: 50, hpMax: 100, isActive: true },
      ]),
    );

    expect(listener).toHaveBeenCalledTimes(1);
    const state: EncounterState = listener.mock.calls[0][0];
    expect(state.round).toBe(1);
    expect(state.combatants).toHaveLength(1);
    expect(state.combatants[0].name).toBe('Gandalf');
  });

  it('identifies players vs monsters', async () => {
    const players = makePlayers([
      { name: 'Aragorn', avatarUrl: 'http://img/aragorn.png' },
    ]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([
        { name: 'Aragorn', initiative: 20, hpCurrent: 80, hpMax: 100, isActive: true },
        { name: 'Goblin', initiative: 10, hpCurrent: 15, hpMax: 15, isActive: false },
      ]),
    );

    const state: EncounterState = listener.mock.calls[0][0];
    expect(state.combatants[0].type).toBe('player');
    expect(state.combatants[1].type).toBe('monster');
  });

  it('uses player avatar URL for player characters', async () => {
    const players = makePlayers([
      { name: 'Legolas', avatarUrl: 'http://img/legolas.png' },
    ]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([
        { name: 'Legolas', initiative: 15, hpCurrent: 60, hpMax: 60, isActive: false },
      ]),
    );

    const state: EncounterState = listener.mock.calls[0][0];
    expect(state.combatants[0].imageUrl).toBe('http://img/legolas.png');
  });

  it('uses 5etools URL for monsters', async () => {
    const players = makePlayers([]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([
        { name: 'Dragon', initiative: 22, hpCurrent: 200, hpMax: 200, isActive: true },
      ]),
    );

    const state: EncounterState = listener.mock.calls[0][0];
    expect(state.combatants[0].imageUrl).toBe(
      'https://5e.tools/img/bestiary/tokens/XMM/Dragon.webp',
    );
  });

  it('handles hidden HP using wound levels', async () => {
    const players = makePlayers([]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    // hpCurrent null => hidden HP, hpWoundLevel 1 = Hurt
    capturedDataHandler!(
      makePayload([
        { name: 'Orc', initiative: 12, hpCurrent: null, hpMax: 30, hpWoundLevel: 1, isActive: false },
      ]),
    );

    const state: EncounterState = listener.mock.calls[0][0];
    // HP_WOUND_LEVEL_MAX(3) - woundLevel(1) = 2
    expect(state.combatants[0].currentHp).toBe(2);
    expect(state.combatants[0].maxHp).toBe(3);
  });

  it('handles hpCurrent of 0 as visible HP', async () => {
    const players = makePlayers([]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([
        { name: 'Zombie', initiative: 5, hpCurrent: 0, hpMax: 22, hpWoundLevel: 3, isActive: false },
      ]),
    );

    const state: EncounterState = listener.mock.calls[0][0];
    expect(state.combatants[0].currentHp).toBe(0);
    expect(state.combatants[0].maxHp).toBe(22);
  });

  it('supports multiple listeners', async () => {
    const players = makePlayers([]);
    const client = new FiveToolsClient(players, 'tok');
    const l1 = vi.fn();
    const l2 = vi.fn();
    client.onStateUpdate(l1);
    client.onStateUpdate(l2);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([{ name: 'Bat', initiative: 2, hpCurrent: 1, hpMax: 1, isActive: false }]),
    );

    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });

  it('sets round from payload', async () => {
    const players = makePlayers([]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([{ name: 'Rat', initiative: 1, hpCurrent: 1, hpMax: 1, isActive: false }], 5),
    );

    expect(listener.mock.calls[0][0].round).toBe(5);
  });

  it('sets isActive from combat data', async () => {
    const players = makePlayers([]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([
        { name: 'A', initiative: 10, hpCurrent: 10, hpMax: 10, isActive: true },
        { name: 'B', initiative: 5, hpCurrent: 10, hpMax: 10, isActive: false },
      ]),
    );

    const state: EncounterState = listener.mock.calls[0][0];
    expect(state.combatants[0].isActive).toBe(true);
    expect(state.combatants[1].isActive).toBe(false);
  });

  it('initializes conditions as empty array', async () => {
    const players = makePlayers([]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([{ name: 'X', initiative: 1, hpCurrent: 1, hpMax: 1, isActive: false }]),
    );

    expect(listener.mock.calls[0][0].combatants[0].conditions).toEqual([]);
  });

  it('sets isVisible to true for all combatants', async () => {
    const players = makePlayers([]);
    const client = new FiveToolsClient(players, 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([{ name: 'Y', initiative: 1, hpCurrent: 1, hpMax: 1, isActive: false }]),
    );

    expect(listener.mock.calls[0][0].combatants[0].isVisible).toBe(true);
  });
});
