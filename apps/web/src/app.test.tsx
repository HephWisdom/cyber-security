import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PublicLayout } from '@/components/public-layout';

describe('application shell', () => {
  it('mounts the public layout with declarative router navigation', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<h1>Make security risk easier to see—and act on.</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', { name: /Make security risk easier to see/i, level: 1 }),
    ).toBeVisible();
    expect(screen.getByRole('main')).toBeVisible();
  });
});
