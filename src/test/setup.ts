import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn()

// Mock TensorFlow to use CPU backend
vi.mock('@tensorflow/tfjs', () => ({
  setBackend: vi.fn().mockResolvedValue(true),
  ready: vi.fn().mockResolvedValue(true),
  sequential: vi.fn().mockReturnValue({
    add: vi.fn(),
    compile: vi.fn(),
    fit: vi.fn().mockResolvedValue({}),
    predict: vi.fn().mockReturnValue([]),
    layers: [],
  }),
  layers: {
    dense: vi.fn().mockReturnValue({}),
  },
  train: {
    adam: vi.fn().mockReturnValue({}),
  },
  losses: {
    meanSquaredError: vi.fn(),
  },
  metrics: {
    meanAbsoluteError: vi.fn(),
  },
  tensor2d: vi.fn().mockReturnValue({
    dispose: vi.fn(),
  }),
  dispose: vi.fn(),
}))