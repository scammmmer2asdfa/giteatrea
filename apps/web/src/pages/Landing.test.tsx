import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Landing } from '../pages/Landing.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function renderWithProviders(children: React.ReactNode) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Landing', () => {
  it('renders the repository input and open button', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByPlaceholderText(/github.com\/owner\/repository/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^open$/i })).toBeInTheDocument();
  });

  it('shows a validation error for invalid input', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    renderWithProviders(<Landing />);
    const input = screen.getByPlaceholderText(/github.com\/owner\/repository/i);
    await userEvent.type(input, 'not a valid repo!!');
    await userEvent.click(screen.getByRole('button', { name: /^open$/i }));
    expect(await screen.findByText(/enter a valid github url/i)).toBeInTheDocument();
  });
});
