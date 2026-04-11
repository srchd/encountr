import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InitiativeBoard } from '../../components/InitiativeBoard';
import type { EncounterState, Combatant } from '../../types/encounter';

function makeCombatant(overrides: Partial<Combatant> = {}): Combatant {
  return {
    id: '1',
    name: 'Goblin',
    type: 'monster',
    currentHp: 10,
    maxHp: 10,
    initiative: 15,
    imageUrl: 'http://img/goblin.png',
    conditions: [],
    isVisible: true,
    isActive: false,
    ...overrides,
  };
}

describe('InitiativeBoard', () => {
  it('renders round number', () => {
    const encounter: EncounterState = {
      round: 3,
      currentTurnId: null,
      combatants: [],
    };
    render(<InitiativeBoard encounter={encounter} />);
    expect(screen.getByText('Round 3')).toBeInTheDocument();
  });

  it('renders all combatants', () => {
    const encounter: EncounterState = {
      round: 1,
      currentTurnId: null,
      combatants: [
        makeCombatant({ id: '1', name: 'Goblin', initiative: 10 }),
        makeCombatant({ id: '2', name: 'Dragon', initiative: 20 }),
        makeCombatant({ id: '3', name: 'Wizard', initiative: 15 }),
      ],
    };
    render(<InitiativeBoard encounter={encounter} />);
    expect(screen.getByText('Goblin')).toBeInTheDocument();
    expect(screen.getByText('Dragon')).toBeInTheDocument();
    expect(screen.getByText('Wizard')).toBeInTheDocument();
  });

  it('sorts combatants by initiative descending', () => {
    const encounter: EncounterState = {
      round: 1,
      currentTurnId: null,
      combatants: [
        makeCombatant({ id: '1', name: 'Low', initiative: 5 }),
        makeCombatant({ id: '2', name: 'High', initiative: 25 }),
        makeCombatant({ id: '3', name: 'Mid', initiative: 15 }),
      ],
    };
    const { container } = render(<InitiativeBoard encounter={encounter} />);

    // Get all combatant card name texts in order (skip the round display)
    const nameElements = container.querySelectorAll('.truncate');
    const names = Array.from(nameElements).map((el) => el.textContent);
    expect(names).toEqual(['High', 'Mid', 'Low']);
  });

  it('renders empty board with no combatants', () => {
    const encounter: EncounterState = {
      round: 1,
      currentTurnId: null,
      combatants: [],
    };
    render(<InitiativeBoard encounter={encounter} />);
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  it('does not render invisible combatants', () => {
    const encounter: EncounterState = {
      round: 1,
      currentTurnId: null,
      combatants: [
        makeCombatant({ id: '1', name: 'Visible', isVisible: true }),
        makeCombatant({ id: '2', name: 'Hidden', isVisible: false }),
      ],
    };
    render(<InitiativeBoard encounter={encounter} />);
    expect(screen.getByText('Visible')).toBeInTheDocument();
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('passes isActive correctly to CombatantCard', () => {
    const encounter: EncounterState = {
      round: 1,
      currentTurnId: null,
      combatants: [
        makeCombatant({ id: '1', name: 'Active', isActive: true, initiative: 20 }),
        makeCombatant({ id: '2', name: 'Inactive', isActive: false, initiative: 10 }),
      ],
    };
    const { container } = render(<InitiativeBoard encounter={encounter} />);

    // Active card should have yellow border class
    const cards = container.querySelectorAll('.rounded-2xl');
    const activeCard = Array.from(cards).find((c) =>
      c.querySelector('.font-bold')?.textContent === 'Active',
    );
    expect(activeCard?.className).toContain('border-yellow-400');
  });
});
