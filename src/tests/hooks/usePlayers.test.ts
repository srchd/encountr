import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlayers } from '../../hooks/usePlayers';

// Mock firebase modules
const mockAddDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn((...args: any[]) => args.join('/'));
const mockDoc = vi.fn((...args: any[]) => args.join('/'));

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  getFirestore: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  db: 'mock-db',
}));

// Mock AuthContext
const mockUser = { uid: 'user-123' };
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Default: onSnapshot calls back with empty docs, returns unsubscribe fn
  mockOnSnapshot.mockImplementation((_ref: any, cb: any) => {
    cb({ docs: [] });
    return vi.fn();
  });
});

describe('usePlayers', () => {
  it('returns empty players initially', () => {
    const { result } = renderHook(() => usePlayers());
    expect(result.current.players).toEqual([]);
  });

  it('subscribes to firestore on mount', () => {
    renderHook(() => usePlayers());
    expect(mockCollection).toHaveBeenCalledWith('mock-db', 'users', 'user-123', 'players');
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('updates players when snapshot changes', async () => {
    mockOnSnapshot.mockImplementation((_ref: any, cb: any) => {
      cb({
        docs: [
          { id: 'p1', data: () => ({ name: 'Gandalf', avatarUrl: 'http://img/gandalf.png' }) },
          { id: 'p2', data: () => ({ name: 'Frodo', avatarUrl: 'http://img/frodo.png' }) },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => usePlayers());

    await waitFor(() => {
      expect(result.current.players).toHaveLength(2);
    });
    expect(result.current.players[0]).toEqual({
      id: 'p1',
      name: 'Gandalf',
      avatarUrl: 'http://img/gandalf.png',
    });
  });

  it('unsubscribes on unmount', () => {
    const unsub = vi.fn();
    mockOnSnapshot.mockReturnValue(unsub);

    const { unmount } = renderHook(() => usePlayers());
    unmount();

    expect(unsub).toHaveBeenCalled();
  });

  it('addPlayer calls addDoc with correct args', async () => {
    const { result } = renderHook(() => usePlayers());

    await act(async () => {
      await result.current.addPlayer('Gimli', 'http://img/gimli.png');
    });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      { name: 'Gimli', avatarUrl: 'http://img/gimli.png' },
    );
  });

  it('deletePlayer calls deleteDoc with correct args', async () => {
    const { result } = renderHook(() => usePlayers());

    await act(async () => {
      await result.current.deletePlayer('p1');
    });

    expect(mockDeleteDoc).toHaveBeenCalled();
    expect(mockDoc).toHaveBeenCalledWith('mock-db', 'users', 'user-123', 'players', 'p1');
  });
});

describe('usePlayers with no user', () => {
  beforeEach(() => {
    vi.doMock('../../context/AuthContext', () => ({
      useAuth: () => ({ user: null }),
    }));
  });

  // This just validates the guard clauses don't throw
  it('does not subscribe when user is null', async () => {
    // Re-import with fresh mock
    vi.resetModules();
    vi.doMock('../../context/AuthContext', () => ({
      useAuth: () => ({ user: null }),
    }));
    vi.doMock('../../lib/firebase', () => ({ db: 'mock-db' }));
    vi.doMock('firebase/firestore', () => ({
      collection: mockCollection,
      addDoc: mockAddDoc,
      deleteDoc: mockDeleteDoc,
      doc: mockDoc,
      onSnapshot: mockOnSnapshot,
      getFirestore: vi.fn(),
    }));

    const { usePlayers: usePlayersNoUser } = await import('../../hooks/usePlayers');
    const { result } = renderHook(() => usePlayersNoUser());

    expect(mockOnSnapshot).not.toHaveBeenCalled();
    expect(result.current.players).toEqual([]);
  });
});
