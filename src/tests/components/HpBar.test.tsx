import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HpBar } from '../../components/HpBar';

function getInnerBar(container: HTMLElement) {
  return container.querySelector('div > div > div') as HTMLElement;
}

function getBarColor(container: HTMLElement) {
  return getInnerBar(container).style.background;
}

describe('HpBar', () => {
  it('renders at correct width percentage', () => {
    const { container } = render(<HpBar current={75} max={100} />);
    expect(getInnerBar(container).style.width).toBe('75%');
  });

  it('renders green color when healthy (>=75%)', () => {
    const { container } = render(<HpBar current={80} max={100} />);
    expect(getBarColor(container)).toBe('rgb(22, 163, 74)');
  });

  it('renders yellow when moderately hurt (40-74%)', () => {
    const { container } = render(<HpBar current={50} max={100} />);
    expect(getBarColor(container)).toBe('rgb(234, 179, 8)');
  });

  it('renders orange when hurt (15-39%)', () => {
    const { container } = render(<HpBar current={20} max={100} />);
    expect(getBarColor(container)).toBe('rgb(234, 88, 12)');
  });

  it('renders red when critical (<15%)', () => {
    const { container } = render(<HpBar current={10} max={100} />);
    expect(getBarColor(container)).toBe('rgb(185, 28, 28)');
  });

  it('renders grey when dead (0 HP)', () => {
    const { container } = render(<HpBar current={0} max={100} />);
    expect(getBarColor(container)).toBe('rgb(85, 85, 85)');
  });

  it('handles max of 0 gracefully', () => {
    const { container } = render(<HpBar current={0} max={0} />);
    expect(getInnerBar(container).style.width).toBe('0%');
    expect(getBarColor(container)).toBe('rgb(85, 85, 85)');
  });

  it('renders full width at 100%', () => {
    const { container } = render(<HpBar current={100} max={100} />);
    expect(getInnerBar(container).style.width).toBe('100%');
  });

  it('renders at exact boundary values', () => {
    const { container: c15 } = render(<HpBar current={15} max={100} />);
    expect(getBarColor(c15)).toBe('rgb(234, 88, 12)');

    const { container: c40 } = render(<HpBar current={40} max={100} />);
    expect(getBarColor(c40)).toBe('rgb(234, 179, 8)');

    const { container: c75 } = render(<HpBar current={75} max={100} />);
    expect(getBarColor(c75)).toBe('rgb(22, 163, 74)');
  });
});
