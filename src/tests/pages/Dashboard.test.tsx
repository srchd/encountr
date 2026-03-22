import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../pages/Dashboard';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockDeleteAccount = vi.fn();
const mockAddPlayer = vi.fn();
const mockDeletePlayer = vi.fn();

let mockPlayers: any[] = [];

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    user: { uid: 'test-uid' },
    deleteAccount: mockDeleteAccount,
  }),
}));

vi.mock('../../hooks/usePlayers', () => ({
  usePlayers: () => ({
    players: mockPlayers,
    addPlayer: mockAddPlayer,
    deletePlayer: mockDeletePlayer,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockPlayers = [];
});

describe('Dashboard page', () => {
  it('renders dashboard heading', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders connect section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Connect to 5etools DM Screen')).toBeInTheDocument();
    expect(screen.getByLabelText('Token')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('renders add player section', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: 'Add Player' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Avatar URL')).toBeInTheDocument();
  });

  it('renders empty players message when no players', () => {
    render(<Dashboard />);
    expect(screen.getByText('No players added yet.')).toBeInTheDocument();
  });

  it('renders player list when players exist', () => {
    mockPlayers = [
      { id: 'p1', name: 'Gandalf', avatarUrl: 'http://img/gandalf.png' },
      { id: 'p2', name: 'Frodo', avatarUrl: 'http://img/frodo.png' },
    ];
    render(<Dashboard />);
    expect(screen.getByText('Gandalf')).toBeInTheDocument();
    expect(screen.getByText('Frodo')).toBeInTheDocument();
  });

  it('calls logout when Logout button clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('calls addPlayer when Add Player button clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.type(screen.getByLabelText('Name'), 'Legolas');
    await user.type(screen.getByLabelText('Avatar URL'), 'http://img/legolas.png');

    // Click the "Add Player" button (which is not the h3)
    const addButtons = screen.getAllByText('Add Player');
    const addButton = addButtons.find((el) => el.tagName === 'BUTTON');
    await user.click(addButton!);

    expect(mockAddPlayer).toHaveBeenCalledWith('Legolas', 'http://img/legolas.png');
  });

  it('calls deletePlayer when Remove button clicked', async () => {
    mockPlayers = [
      { id: 'p1', name: 'Gandalf', avatarUrl: 'http://img/gandalf.png' },
    ];
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText('Remove'));
    expect(mockDeletePlayer).toHaveBeenCalledWith('p1');
  });

  it('navigates to /board with token and players on Connect', async () => {
    mockPlayers = [{ id: 'p1', name: 'Gandalf', avatarUrl: 'http://img/gandalf.png' }];
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.type(screen.getByLabelText('Token'), 'my-token');
    await user.click(screen.getByText('Connect'));

    expect(mockNavigate).toHaveBeenCalledWith('/board', {
      state: { players: mockPlayers, token: 'my-token' },
    });
  });

  it('does not navigate when token is empty', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText('Connect'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when token is whitespace only', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.type(screen.getByLabelText('Token'), '   ');
    await user.click(screen.getByText('Connect'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('calls deleteAccount and navigates to / on Delete Account', async () => {
    mockDeleteAccount.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText('Delete Account'));

    expect(mockDeleteAccount).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders player avatars with alt text', () => {
    mockPlayers = [
      { id: 'p1', name: 'Gandalf', avatarUrl: 'http://img/gandalf.png' },
    ];
    render(<Dashboard />);

    const img = screen.getByAltText("Gandalf's avatar") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('http://img/gandalf.png');
  });

  it('renders multiple remove buttons for multiple players', () => {
    mockPlayers = [
      { id: 'p1', name: 'A', avatarUrl: 'http://img/a.png' },
      { id: 'p2', name: 'B', avatarUrl: 'http://img/b.png' },
    ];
    render(<Dashboard />);

    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons).toHaveLength(2);
  });
});
