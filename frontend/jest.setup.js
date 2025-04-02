// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';
import 'jest-canvas-mock';
import 'jest-axe/extend-expect';

// Mock GSAP to avoid issues with requestAnimationFrame and DOM manipulation
jest.mock('gsap', () => {
  return {
    to: jest.fn(() => ({
      pause: jest.fn(),
      invalidate: jest.fn(),
      restart: jest.fn(),
      kill: jest.fn(),
    })),
    from: jest.fn(() => ({
      pause: jest.fn(),
      invalidate: jest.fn(),
      restart: jest.fn(),
      kill: jest.fn(),
    })),
    set: jest.fn(),
    timeline: jest.fn(() => ({
      pause: jest.fn(),
      play: jest.fn(),
      to: jest.fn(() => ({
        pause: jest.fn(),
        invalidate: jest.fn(),
        restart: jest.fn(),
        kill: jest.fn(),
      })),
      from: jest.fn(() => ({
        pause: jest.fn(),
        invalidate: jest.fn(),
        restart: jest.fn(),
        kill: jest.fn(),
      })),
      add: jest.fn(),
      kill: jest.fn(),
    })),
    registerPlugin: jest.fn(),
    config: jest.fn(),
    defaults: {},
    core: {
      Tween: {
        selector: jest.fn(),
      },
    },
  };
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Start msw server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
