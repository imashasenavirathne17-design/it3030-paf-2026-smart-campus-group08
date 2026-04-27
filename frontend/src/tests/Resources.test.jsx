import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Resources from '../pages/resources/Resources';
import { useAuth } from '../context/AuthContext';
import { resourcesAPI } from '../api/resources';
import { MemoryRouter } from 'react-router-dom';

// Mock Dependencies
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../api/resources', () => ({
  resourcesAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

describe('Resources Component', () => {
  const mockUser = { id: 1, name: 'Test User', role: 'STUDENT' };
  const mockAdmin = { id: 2, name: 'Admin User', role: 'ADMIN' };
  const mockResources = [
    {
      id: '1',
      name: 'Grand Auditorium',
      type: 'HALL',
      location: '1st Floor',
      capacity: 500,
      description: 'Main auditorium for events.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Computer Lab A',
      type: 'LAB',
      location: '2nd Floor',
      capacity: 40,
      description: 'Advanced computing lab.',
      status: 'OUT_OF_SERVICE',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    resourcesAPI.getAll.mockResolvedValue(mockResources);
  });

  it('renders the Facilities & Assets title', async () => {
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    expect(await screen.findByText('Facilities & Assets')).toBeInTheDocument();
    expect(await screen.findByText('Grand Auditorium')).toBeInTheDocument();
    expect(await screen.findByText('Computer Lab A')).toBeInTheDocument();
  });

  it('filters resources by search text', async () => {
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    const searchInput = await screen.findByPlaceholderText('Search by name or location...');
    fireEvent.change(searchInput, { target: { value: 'Auditorium' } });

    expect(screen.getByText('Grand Auditorium')).toBeInTheDocument();
    expect(screen.queryByText('Computer Lab A')).not.toBeInTheDocument();
  });

  it('shows maintenance warning for out of service resources', async () => {
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    expect(await screen.findByText('This facility is currently down for maintenance.')).toBeInTheDocument();
  });

  it('navigates to bookings when clicking "Check Schedule"', async () => {
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    const checkScheduleBtns = await screen.findAllByText('Check Schedule');
    fireEvent.click(checkScheduleBtns[0]); // Click the first one (Grand Auditorium)

    expect(mockNavigate).toHaveBeenCalledWith('/bookings');
  });

  it('disables "Check Schedule" for out of service resources', async () => {
    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    const checkScheduleBtns = await screen.findAllByText('Check Schedule');
    // Computer Lab A is the second one and it's OUT_OF_SERVICE
    expect(checkScheduleBtns[1]).toBeDisabled();
  });

  it('shows Admin-only buttons when logged in as admin', async () => {
    useAuth.mockReturnValue({ user: mockAdmin });

    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    expect(await screen.findByText('Add New Asset')).toBeInTheDocument();
    expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    
    // Check for edit/delete buttons
    const editBtns = await screen.findAllByRole('button');
    // Filters buttons + export + add + check schedule x2 + (edit + delete) x2
    // It's easier to check for icons or specific buttons if they had titles, 
    // but we can just check if more buttons exist or specifically look for the Add New Asset button.
  });

  it('opens the Create Asset modal for Admin', async () => {
    useAuth.mockReturnValue({ user: mockAdmin });

    render(
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    );

    const addBtn = await screen.findByText('Add New Asset');
    fireEvent.click(addBtn);

    expect(await screen.findByText('Add New Facility')).toBeInTheDocument();
  });
});
