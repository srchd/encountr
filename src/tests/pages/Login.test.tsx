import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../pages/Login';

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login page', () => {
  it('renders login form by default', () => {
    render(<Login />);
    expect(screen.getByText('Encountr')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm Password')).toBeNull();
  });

  it('renders Login button and switch button', () => {
    render(<Login />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Switch to Register')).toBeInTheDocument();
  });

  it('switches to register mode', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByText('Switch to Register'));

    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Switch to Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('clears fields when switching modes', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText('E-mail'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByText('Switch to Register'));

    expect(screen.getByLabelText('E-mail')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('calls login on submit in login mode', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.click(screen.getByText('Login'));

    expect(mockLogin).toHaveBeenCalledWith('a@b.com', 'pass123');
  });

  it('calls register on submit in register mode with matching passwords', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByText('Switch to Register'));
    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.type(screen.getByLabelText('Confirm Password'), 'pass123');
    await user.click(screen.getByText('Register'));

    expect(mockRegister).toHaveBeenCalledWith('a@b.com', 'pass123');
  });

  it('shows error when passwords do not match in register mode', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByText('Switch to Register'));
    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.type(screen.getByLabelText('Confirm Password'), 'different');
    await user.click(screen.getByText('Register'));

    expect(screen.getByText('Passwords do not match!')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error message from login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByText('Login'));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('clears error when switching modes', async () => {
    mockLogin.mockRejectedValue(new Error('Bad login'));
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByText('Login'));
    expect(await screen.findByText('Bad login')).toBeInTheDocument();

    await user.click(screen.getByText('Switch to Register'));
    expect(screen.queryByText('Bad login')).toBeNull();
  });

  it('submits on Enter key in email field', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    // Focus email and press Enter
    screen.getByLabelText('E-mail').focus();
    await user.keyboard('{Enter}');

    expect(mockLogin).toHaveBeenCalled();
  });

  it('submits on Enter key in password field', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pass123');
    await user.keyboard('{Enter}');

    expect(mockLogin).toHaveBeenCalled();
  });

  it('renders privacy policy link', () => {
    render(<Login />);
    const link = screen.getByText('Privacy Policy') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('privacy.html');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
