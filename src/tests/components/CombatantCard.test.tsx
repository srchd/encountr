import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CombatantCard } from '../../components/CombatantCard';
import type { Combatant } from '../../types/encounter';

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

describe('CombatantCard', () => {
  it('renders combatant name', () => {
    render(<CombatantCard combatant={makeCombatant()} isActive={false} />);
    expect(screen.getByText('Goblin')).toBeInTheDocument();
  });

  it('renders combatant image', () => {
    render(<CombatantCard combatant={makeCombatant()} isActive={false} />);
    const img = screen.getByAltText('Goblin') as HTMLImageElement;
    expect(img.src).toBe('http://img/goblin.png');
  });

  it('returns null when combatant is not visible', () => {
    const { container } = render(
      <CombatantCard combatant={makeCombatant({ isVisible: false })} isActive={false} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('applies active styling when isActive is true', () => {
    const { container } = render(
      <CombatantCard combatant={makeCombatant()} isActive={true} />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-yellow-400');
  });

  it('applies inactive styling when isActive is false', () => {
    const { container } = render(
      <CombatantCard combatant={makeCombatant()} isActive={false} />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-slate-700');
  });

  it('applies dead styling when HP is 0', () => {
    const { container } = render(
      <CombatantCard combatant={makeCombatant({ currentHp: 0 })} isActive={false} />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('opacity-50');
  });

  it('does not apply dead styling when HP > 0', () => {
    const { container } = render(
      <CombatantCard combatant={makeCombatant({ currentHp: 5 })} isActive={false} />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('opacity-50');
  });

  it('renders HpBar component', () => {
    const { container } = render(
      <CombatantCard combatant={makeCombatant({ currentHp: 5, maxHp: 10 })} isActive={false} />,
    );
    // HpBar renders a div with inner div for the bar
    const bars = container.querySelectorAll('div[style*="background"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('uses lazy loading for the image', () => {
    render(<CombatantCard combatant={makeCombatant()} isActive={false} />);
    const img = screen.getByAltText('Goblin');
    expect(img.getAttribute('loading')).toBe('lazy');
  });
});
