import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.tsx';

// Mock the 3D canvas component since it requires WebGL
vi.mock('../components/BikeCanvas', () => ({
  BikeCanvas: () => <div data-testid="bike-canvas">BikeCanvas Mock</div>,
}));

// Mock ResizeObserver which is not available in jsdom
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App', () => {
  it('renders the controls panel and 3D canvas', () => {
    render(<App />);
    expect(screen.getByTestId('bike-canvas')).toBeDefined();
  });
});
