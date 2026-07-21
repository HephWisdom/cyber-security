import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { Header } from './header';

afterEach(cleanup);

describe('accessible navigation', () => {
  it('opens and closes a mega menu with keyboard controls', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const services = screen.getByRole('button', { name: 'Services' });
    fireEvent.click(services);
    expect(services).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'services menu' })).toBeVisible();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(services).toHaveAttribute('aria-expanded', 'false');
  });

  it('exposes a labelled mobile navigation dialog', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }));
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
  });
});
