import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock firebase auth
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  deleteUser: (...args: any[]) => mockDeleteUser(...args),
  getAuth: vi.fn(() => ({ currentUser: { uid: 'test-uid' } })),
}));

vi.mock('../../lib/firebase', () => ({
  auth: { currentUser: { uid: 'test-uid' } },
  db: 'mock-db',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function TestConsumer() {
  const { user, login, register, logout, deleteAccount } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.uid : 'null'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button onClick={() => register('a@b.com', 'pass')}>Register</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => deleteAccount()}>Delete</button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('renders children after loading completes', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
      cb(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  // Might be worthless to test if mocking mocks the thing that needs to be mocked, but I like it
  it('provides user from onAuthStateChanged', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
      cb({ uid: 'user-abc' });
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('user-abc');
    });
  });

  it('does not render children while loading', () => {
    // Never call the callback => loading stays true
    mockOnAuthStateChanged.mockReturnValue(vi.fn());

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.queryByTestId('user')).toBeNull();
  });

  it('login calls signInWithEmailAndPassword', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
      cb(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText('Login'));
    screen.getByText('Login').click();

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'a@b.com',
      'pass',
    );
  });

  it('register calls createUserWithEmailAndPassword', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
      cb(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText('Register'));
    screen.getByText('Register').click();

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'a@b.com',
      'pass',
    );
  });

  it('logout calls signOut', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
      cb(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText('Logout'));
    screen.getByText('Logout').click();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('deleteAccount calls deleteUser', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
      cb(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText('Delete'));
    screen.getByText('Delete').click();

    expect(mockDeleteUser).toHaveBeenCalled();
  });

  it('unsubscribes from auth on unmount', () => {
    const unsub = vi.fn();
    mockOnAuthStateChanged.mockReturnValue(unsub);

    const { unmount } = render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>,
    );

    unmount();
    expect(unsub).toHaveBeenCalled();
  });
});
