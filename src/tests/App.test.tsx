import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

const mockUser = { uid: 'test-user' };
let authUser: any = null;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: authUser }),
}));

vi.mock('../pages/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('../pages/Board', () => ({
  default: () => <div data-testid="board-page">Board Page</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  };
});

import { MemoryRouter } from 'react-router-dom';

describe('App', () => {
  it('shows Login page when user is not authenticated', () => {
    authUser = null;
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('shows Dashboard when user is authenticated and at /', () => {
    authUser = mockUser;
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('shows Board when user is authenticated and at /board', () => {
    authUser = mockUser;
    render(
      <MemoryRouter initialEntries={['/board']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('board-page')).toBeInTheDocument();
  });

  it('redirects unknown routes to / when authenticated', () => {
    authUser = mockUser;
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('navigate')).toHaveTextContent('/');
  });
});
