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
      type: 'state',
      payload: {
        round,
        rows,
      },
    },
  };
}

function makeShowImagePayload(imageHref: any) {
  return {
    data: {
      type: 'showImage',
      payload: { imageHref },
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

  it('ignores payloads that are neither state nor showImage', async () => {
    const client = new FiveToolsClient(makePlayers([]), 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!({ data: { type: 'somethingElse', payload: {} } });

    expect(listener).not.toHaveBeenCalled();
  });

  it('updates monster image when DM shows an internal image', async () => {
    const client = new FiveToolsClient(makePlayers([]), 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([
        { name: 'Splugoth the Returned', initiative: 10, hpCurrent: 10, hpMax: 10, isActive: false },
        { name: 'Goblin', initiative: 5, hpCurrent: 7, hpMax: 7, isActive: false },
      ]),
    );
    capturedDataHandler!(
      makeShowImagePayload({ type: 'internal', path: 'bestiary/AI/Splugoth the Returned.webp' }),
    );

    expect(listener).toHaveBeenCalledTimes(2);
    const state: EncounterState = listener.mock.calls[1][0];
    expect(state.combatants[0].imageUrl).toBe(
      'https://5e.tools/img/bestiary/AI/Splugoth the Returned.webp',
    );
    expect(state.combatants[1].imageUrl).toBe(
      'https://5e.tools/img/bestiary/tokens/XMM/Goblin.webp',
    );
  });

  it('keeps shown image across subsequent state payloads', async () => {
    const client = new FiveToolsClient(makePlayers([]), 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makeShowImagePayload({ type: 'internal', path: 'bestiary/AI/Splugoth the Returned.webp' }),
    );
    expect(listener).not.toHaveBeenCalled();

    capturedDataHandler!(
      makePayload([
        { name: 'Splugoth the Returned', initiative: 10, hpCurrent: 10, hpMax: 10, isActive: false },
      ]),
    );

    const state: EncounterState = listener.mock.calls[0][0];
    expect(state.combatants[0].imageUrl).toBe(
      'https://5e.tools/img/bestiary/AI/Splugoth the Returned.webp',
    );
  });

  it('supports external shown images', async () => {
    const client = new FiveToolsClient(makePlayers([]), 'tok');
    const listener = vi.fn();
    client.onStateUpdate(listener);

    await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

    capturedDataHandler!(
      makePayload([{ name: 'Beholder', initiative: 10, hpCurrent: 10, hpMax: 10, isActive: false }]),
    );
    capturedDataHandler!(
      makeShowImagePayload({ type: 'external', url: 'https://example.com/img/Beholder.png' }),
    );

    const state: EncounterState = listener.mock.calls[1][0];
    expect(state.combatants[0].imageUrl).toBe('https://example.com/img/Beholder.png');
  });

  it('fills the only monster without a working picture even when a player is active', async () => {
    const OriginalImage = globalThis.Image;
    // Fake Image: default XMM tokens load, except for the homebrew monster
    (globalThis as any).Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(url: string) {
        if (url.includes('Homebrew Horror')) this.onerror?.();
        else this.onload?.();
      }
    };

    try {
      const players = makePlayers([{ name: 'Gimli', avatarUrl: 'http://img/gimli.png' }]);
      const client = new FiveToolsClient(players, 'tok');
      const listener = vi.fn();
      client.onStateUpdate(listener);

      await vi.waitFor(() => expect(capturedDataHandler).not.toBeNull());

      capturedDataHandler!(
        makePayload([
          { name: 'Gimli', initiative: 20, hpCurrent: 30, hpMax: 30, isActive: true },
          { name: 'Goblin', initiative: 12, hpCurrent: 7, hpMax: 7, isActive: false },
          { name: 'Homebrew Horror', initiative: 8, hpCurrent: 40, hpMax: 40, isActive: false },
        ]),
      );
      capturedDataHandler!(
        makeShowImagePayload({ type: 'external', url: 'https://example.com/avatars/123/abc.png' }),
      );

      expect(listener).toHaveBeenCalledTimes(2);
      const state: EncounterState = listener.mock.calls[1][0];
      expect(state.combatants[0].imageUrl).toBe('http://img/gimli.png');
      expect(state.combatants[1].imageUrl).toBe('https://5e.tools/img/bestiary/tokens/XMM/Goblin.webp');
      expect(state.combatants[2].imageUrl).toBe('https://example.com/avatars/123/abc.png');
    } finally {
      globalThis.Image = OriginalImage;
    }
  });
});
