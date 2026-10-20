import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Board from '../../pages/Board';
import type { EncounterState } from '../../types/encounter';

// Track the FiveToolsClient instance
let capturedOnStateUpdate: ((state: EncounterState) => void) | null = null;

vi.mock('../../services/fiveToolsClient', () => ({
  FiveToolsClient: class {
    constructor(...args: any[]) {
      capturedClientArgs = args;
    }
    onStateUpdate(cb: (state: EncounterState) => void) {
      capturedOnStateUpdate = cb;
    }
  },
}));

// Captured args passed to the FiveToolsClient constructor.
let capturedClientArgs: any[] | null = null;

// Configurable per-test: navigation state, and the Firebase-backed fallbacks.
let mockLocationState: any = { players: [{ name: 'Hero', avatarUrl: 'http://img/hero.png' }], token: 'tok-123' };
let mockSavedPlayers: any[] = [];
let mockSavedToken = '';

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: mockLocationState }),
}));

// Board falls back to these when navigation state is lost (e.g. a hard refresh).
vi.mock('../../hooks/usePlayers', () => ({
  usePlayers: () => ({ players: mockSavedPlayers, addPlayer: vi.fn(), deletePlayer: vi.fn() }),
}));

vi.mock('../../hooks/useToken', () => ({
  useToken: () => ({ token: mockSavedToken, setToken: vi.fn(), saveToken: vi.fn() }),
}));

beforeEach(() => {
  capturedOnStateUpdate = null;
  capturedClientArgs = null;
  mockLocationState = { players: [{ name: 'Hero', avatarUrl: 'http://img/hero.png' }], token: 'tok-123' };
  mockSavedPlayers = [];
  mockSavedToken = '';
});

describe('Board page', () => {
  it('renders with initial empty encounter state', () => {
    render(<Board />);
    expect(screen.getByText('Round 0')).toBeInTheDocument();
  });

  it('updates when encounter state is emitted', async () => {
    render(<Board />);

    // Wait a tick for useEffect to run
    await vi.waitFor(() => expect(capturedOnStateUpdate).not.toBeNull());

    const { act } = await import('@testing-library/react');
    act(() => {
      capturedOnStateUpdate!({
        round: 3,
        currentTurnId: '1',
        combatants: [
          {
            id: '0',
            name: 'Hero',
            type: 'player',
            currentHp: 50,
            maxHp: 100,
            initiative: 18,
            imageUrl: 'http://img/hero.png',
            conditions: [],
            isVisible: true,
            isActive: true,
          },
        ],
      });
    });

    expect(screen.getByText('Round 3')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
  });

  it('renders InitiativeBoard component', () => {
    const { container } = render(<Board />);
    // The board should have the grid layout
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('connects using navigation state when present', async () => {
    render(<Board />);
    await vi.waitFor(() => expect(capturedClientArgs).not.toBeNull());
    expect(capturedClientArgs).toEqual([mockLocationState.players, 'tok-123']);
  });

  it('falls back to Firebase values when navigation state is missing (refresh)', async () => {
    mockLocationState = null;
    mockSavedPlayers = [{ name: 'Saved', avatarUrl: 'http://img/saved.png' }];
    mockSavedToken = 'saved-tok';

    render(<Board />);

    await vi.waitFor(() => expect(capturedClientArgs).not.toBeNull());
    expect(capturedClientArgs).toEqual([mockSavedPlayers, 'saved-tok']);
  });

  it('does not connect until a token is available', () => {
    mockLocationState = null;
    mockSavedPlayers = [];
    mockSavedToken = ''; // token still loading

    render(<Board />);

    expect(capturedClientArgs).toBeNull();
  });
});
