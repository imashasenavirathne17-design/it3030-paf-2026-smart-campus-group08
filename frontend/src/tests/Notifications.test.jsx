import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Notifications from '../pages/Notifications';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../api/notifications';
import { MemoryRouter } from 'react-router-dom';

// Mock Dependencies
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../api/notifications', () => ({
  notificationsAPI: {
    getAll: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    delete: vi.fn(),
    deleteAll: vi.fn(),
    broadcast: vi.fn(),
    updateBroadcast: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Notifications Component', () => {
  const mockUser = { id: 1, name: 'Test User', role: 'STUDENT' };
  const mockAdmin = { id: 2, name: 'Admin User', role: 'ADMIN' };
  const mockNotifications = [
    {
      id: 'n1',
      type: 'BOOKING_APPROVED',
      message: 'Your booking for A101 has been approved.',
      read: false,
      createdAt: new Date().toISOString(),
      referenceId: 'b1',
    },
    {
      id: 'n2',
      type: 'TICKET_RESOLVED',
      message: 'Your ticket "Broken Light" has been resolved.',
      read: true,
      createdAt: new Date().toISOString(),
      referenceId: 't1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    notificationsAPI.getAll.mockResolvedValue(mockNotifications);
    notificationsAPI.markRead.mockResolvedValue({});
    notificationsAPI.markAllRead.mockResolvedValue({});
    notificationsAPI.delete.mockResolvedValue({});
    notificationsAPI.deleteAll.mockResolvedValue({});
  });

  it('renders the Notifications title and message', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(await screen.findByText(/1 unread update/i)).toBeInTheDocument();
    expect(await screen.findByText('Your booking for A101 has been approved.')).toBeInTheDocument();
  });

  it('filters notifications by search text', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    const searchInput = await screen.findByPlaceholderText('Search activity...');
    fireEvent.change(searchInput, { target: { value: 'booking' } });

    expect(await screen.findByText('Your booking for A101 has been approved.')).toBeInTheDocument();
    expect(screen.queryByText('Your ticket "Broken Light" has been resolved.')).not.toBeInTheDocument();
  });

  it('marks a notification as read when clicked', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    const unreadNotif = await screen.findByText('Your booking for A101 has been approved.');
    fireEvent.click(unreadNotif);

    expect(notificationsAPI.markRead).toHaveBeenCalledWith('n1');
    expect(mockNavigate).toHaveBeenCalledWith('/bookings');
  });

  it('marks all notifications as read', async () => {
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    const markAllBtn = await screen.findByText('Mark All Read');
    fireEvent.click(markAllBtn);

    expect(notificationsAPI.markAllRead).toHaveBeenCalled();
  });

  it('deletes a notification', async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    
    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    const deleteBtns = await screen.findAllByTitle('Delete');
    fireEvent.click(deleteBtns[0]);

    expect(notificationsAPI.delete).toHaveBeenCalledWith('n1');
  });

  it('shows Send Broadcast button for Admin', async () => {
    useAuth.mockReturnValue({ user: mockAdmin });

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    expect(await screen.findByText('Send Broadcast')).toBeInTheDocument();
  });

  it('opens Broadcast modal and sends a broadcast', async () => {
    useAuth.mockReturnValue({ user: mockAdmin });
    notificationsAPI.broadcast.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    // Click the trigger button
    const openModalBtn = await screen.findByText('Send Broadcast');
    fireEvent.click(openModalBtn);

    // Fill the modal
    const textarea = await screen.findByPlaceholderText(/Enter the message/i);
    fireEvent.change(textarea, { target: { value: 'Global Announcement' } });

    // Click the send button (in the modal footer)
    const sendBtn = screen.getAllByText('Send Broadcast').find(el => el.closest('.modal-footer'));
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(notificationsAPI.broadcast).toHaveBeenCalledWith({ message: 'Global Announcement' });
    });
  });
});
