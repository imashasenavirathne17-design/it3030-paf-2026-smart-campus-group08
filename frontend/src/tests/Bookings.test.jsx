import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Bookings from '../pages/bookings/Bookings';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../api/bookings';
import { resourcesAPI } from '../api/resources';
import { MemoryRouter } from 'react-router-dom';

// Mock the modules
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../api/bookings', () => ({
  bookingsAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    cancel: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../api/resources', () => ({
  resourcesAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock Recharts to avoid issues in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Cell: () => <div />,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => <div />,
  Legend: () => <div />,
}));

describe('Bookings Component', () => {
  const mockUser = { id: 1, name: 'Test User', role: 'STUDENT', email: 'test@example.com' };
  const mockResources = [
    { id: '1', name: 'A101', type: 'Lecture Hall', location: '1st Floor', capacity: 100 },
    { id: '2', name: 'Projector 1', type: 'Projector', location: 'IT Store', capacity: 5 },
  ];
  const mockBookings = [
    {
      id: 'b1',
      resourceId: '1',
      resourceName: 'A101',
      userId: 1,
      userName: 'Test User',
      startTime: '2026-04-27T09:00:00Z',
      endTime: '2026-04-27T10:00:00Z',
      status: 'APPROVED',
      purpose: 'Study Session',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    bookingsAPI.getAll.mockResolvedValue(mockBookings);
    resourcesAPI.getAll.mockResolvedValue(mockResources);
  });

  it('renders the Booking System title', async () => {
    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    expect(await screen.findByText('Booking System')).toBeInTheDocument();
    expect(await screen.findByText('A101')).toBeInTheDocument();
  });

  it('opens the New Booking modal when clicking "New Booking"', async () => {
    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    const newBookingBtn = await screen.findByText('New Booking');
    fireEvent.click(newBookingBtn);

    expect(await screen.findByText('Select Booking Type')).toBeInTheDocument();
  });

  it('switches between categories (Halls & Labs / Equipment)', async () => {
    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    const equipmentTab = await screen.findByText('Equipment');
    fireEvent.click(equipmentTab);

    expect(await screen.findByText('Projector 1')).toBeInTheDocument();
  });

  it('displays correct tabs for Admin user', async () => {
    useAuth.mockReturnValue({ user: { ...mockUser, role: 'ADMIN' } });
    
    render(
      <MemoryRouter>
        <Bookings />
      </MemoryRouter>
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Analytics')).toBeInTheDocument();
  });
});
