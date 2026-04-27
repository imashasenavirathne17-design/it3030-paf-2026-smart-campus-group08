import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Tickets from '../pages/tickets/Tickets';
import { useAuth } from '../context/AuthContext';
import { ticketsAPI } from '../api/tickets';
import { resourcesAPI } from '../api/resources';
import { MemoryRouter } from 'react-router-dom';

// Mock Dependencies
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../api/tickets', () => ({
  ticketsAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../api/resources', () => ({
  resourcesAPI: {
    getAll: vi.fn(),
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

describe('Tickets Component', () => {
  const mockUser = { id: 1, name: 'Test User', role: 'STUDENT' };
  const mockAdmin = { id: 2, name: 'Admin User', role: 'ADMIN' };
  const mockTickets = [
    {
      id: 't1',
      title: 'Broken Light in A101',
      description: 'The light in the back of the room is flickering.',
      category: 'ELECTRICAL',
      priority: 'MEDIUM',
      status: 'OPEN',
      submittedByName: 'Test User',
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 86400000).toISOString(), // 1 day later
    },
    {
      id: 't2',
      title: 'Leaking Pipe in Lab B',
      description: 'Water is dripping from the ceiling.',
      category: 'PLUMBING',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      submittedByName: 'Admin User',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    ticketsAPI.getAll.mockResolvedValue(mockTickets);
    resourcesAPI.getAll.mockResolvedValue([{ location: '1st Floor' }, { location: '2nd Floor' }]);
  });

  it('renders the Maintenance & Tickets title', async () => {
    render(
      <MemoryRouter>
        <Tickets />
      </MemoryRouter>
    );

    expect(await screen.findByText('Maintenance & Tickets')).toBeInTheDocument();
    expect(await screen.findByText('Broken Light in A101')).toBeInTheDocument();
  });

  it('switches between Kanban and List views', async () => {
    render(
      <MemoryRouter>
        <Tickets />
      </MemoryRouter>
    );

    const listTab = await screen.findByText('List');
    fireEvent.click(listTab);

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(await screen.findByText('Title')).toBeInTheDocument();
  });

  it('filters tickets by search text', async () => {
    render(
      <MemoryRouter>
        <Tickets />
      </MemoryRouter>
    );

    const searchInput = await screen.findByPlaceholderText('Search tickets...');
    fireEvent.change(searchInput, { target: { value: 'Light' } });

    expect(await screen.findByText('Broken Light in A101')).toBeInTheDocument();
    expect(screen.queryByText('Leaking Pipe in Lab B')).not.toBeInTheDocument();
  });

  it('opens the New Ticket modal when clicking "New Ticket"', async () => {
    render(
      <MemoryRouter>
        <Tickets />
      </MemoryRouter>
    );

    const newTicketBtn = await screen.findByText('New Ticket');
    fireEvent.click(newTicketBtn);

    expect(await screen.findByText('Report New Issue')).toBeInTheDocument();
  });

  it('shows workload summary for Admin user', async () => {
    useAuth.mockReturnValue({ user: mockAdmin });
    // Add an assigned technician to see them in summary
    ticketsAPI.getAll.mockResolvedValue([
      ...mockTickets,
      { id: 't3', title: 'Test', status: 'OPEN', assignedToName: 'John Tech' }
    ]);

    render(
      <MemoryRouter>
        <Tickets />
      </MemoryRouter>
    );

    expect(await screen.findByText(/John Tech/i)).toBeInTheDocument();
    expect(await screen.findByText(/Unassigned/i)).toBeInTheDocument();
  });

  it('navigates to ticket details when clicking a card in Kanban', async () => {
    render(
      <MemoryRouter>
        <Tickets />
      </MemoryRouter>
    );

    const ticketCard = await screen.findByText('Broken Light in A101');
    fireEvent.click(ticketCard.closest('.kanban-card'));

    expect(mockNavigate).toHaveBeenCalledWith('/tickets/t1');
  });
});
