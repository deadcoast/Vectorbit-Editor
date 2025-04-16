
/**
 * Jest Setup Tests
 * Initializes global utilities, mock configurations, and quality-of-life features for VectorBit.
 */

// Extend Jest matchers with @testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

// Mock console to ensure clean test output and track warnings/errors
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn((message) => {
    console.warn(`Warning: ${message}`);
    throw new Error(`Warning: ${message}`);
  }),
  error: jest.fn((message) => {
    console.error(`Error: ${message}`);
    throw new Error(`Error: ${message}`);
  }),
};

// Polyfill for window.matchMedia (used by libraries like Material-UI, TailwindCSS, or styled-components)
if (!window.matchMedia) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
}

// Mock localStorage and sessionStorage for tests
class StorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
}
global.localStorage = new StorageMock();
global.sessionStorage = new StorageMock();

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

// Mock environment variables for consistent testing behavior
process.env.REACT_APP_API_URL = "http://localhost:5000";
process.env.REACT_APP_DEFAULT_GRID_SIZE = "16";
process.env.REACT_APP_DEFAULT_COLOR = "#ffffff";

// Utility for mocking dates
const RealDate = Date;
global.mockDate = (isoDate) => {
  const mockDate = new Date(isoDate);
  global.Date = class extends RealDate {
    constructor() {
      super();
      return mockDate;
    }
  };
};
global.resetDateMock = () => {
  global.Date = RealDate;
};

// Mock canvas API (commonly used in drawing apps)
if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: [] })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    setTransform: jest.fn(),
    resetTransform: jest.fn(),
  }));
}

// Mock file handling APIs for tests
global.File = class {
  constructor(name, options = {}) {
    this.name = name;
    this.lastModified = new Date();
    this.size = options.size || 0;
    this.type = options.type || "text/plain";
  }
};

global.Blob = class {
  constructor(parts, options = {}) {
    this.parts = parts;
    this.type = options.type || "text/plain";
  }
};

// Utility for resetting all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

console.log("Global test setup completed.");
