import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Board from '../../pages/Board';
import type { EncounterState } from '../../types/encounter';

// Track the FiveToolsClient instance
let capturedOnStateUpdate: ((state: EncounterState) => void) | null = null;

vi.mock('../../services/fiveToolsClient', () => ({
  FiveToolsClient: class {
    constructor() {}
    onStateUpdate(cb: (state: EncounterState) => void) {
      capturedOnStateUpdate = cb;
    }
  },
}));

const mockLocationState = { players: [{ name: 'Hero', avatarUrl: 'http://img/hero.png' }], token: 'tok-123' };

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: mockLocationState }),
}));

beforeEach(() => {
  capturedOnStateUpdate = null;
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
});
