import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useToken } from '../../hooks/useToken';

// Mock firebase modules
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockDoc = vi.fn((...args: any[]) => args.join('/'));

vi.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
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
  // Default: no stored token
  mockGetDoc.mockResolvedValue({ data: () => ({}) });
});

describe('useToken', () => {
  it('returns empty token initially', () => {
    const { result } = renderHook(() => useToken());
    expect(result.current.token).toBe('');
  });

  it('reads the latest token from firestore on mount', () => {
    renderHook(() => useToken());
    expect(mockDoc).toHaveBeenCalledWith('mock-db', 'users', 'user-123');
    expect(mockGetDoc).toHaveBeenCalled();
  });

  it('pre-fills token when one is stored', async () => {
    mockGetDoc.mockResolvedValue({ data: () => ({ latestToken: 'abc-123' }) });

    const { result } = renderHook(() => useToken());

    await waitFor(() => {
      expect(result.current.token).toBe('abc-123');
    });
  });

  it('stays empty when no token is stored', async () => {
    mockGetDoc.mockResolvedValue({ data: () => ({}) });

    const { result } = renderHook(() => useToken());

    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalled();
    });
    expect(result.current.token).toBe('');
  });

  it('stays empty when the user document does not exist', async () => {
    mockGetDoc.mockResolvedValue({ data: () => undefined });

    const { result } = renderHook(() => useToken());

    await waitFor(() => {
      expect(mockGetDoc).toHaveBeenCalled();
    });
    expect(result.current.token).toBe('');
  });

  it('saveToken merges the token onto the user document', async () => {
    const { result } = renderHook(() => useToken());

    await act(async () => {
      await result.current.saveToken('xyz-789');
    });

    expect(mockDoc).toHaveBeenCalledWith('mock-db', 'users', 'user-123');
    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      { latestToken: 'xyz-789' },
      { merge: true },
    );
  });
});
