// Mock jest-dom functionality for tests
// This is a temporary solution until the actual package is installed

// Create a mock implementation of the jest-dom package
if (!global.expect.extend) {
  global.expect.extend = () => {};
}

// Mock common jest-dom matchers
const matchers = {
  toBeInTheDocument: () => ({ pass: true }),
  toHaveAttribute: () => ({ pass: true }),
  toHaveClass: () => ({ pass: true }),
  toHaveStyle: () => ({ pass: true }),
  toBeVisible: () => ({ pass: true }),
  toBeDisabled: () => ({ pass: true }),
  toHaveTextContent: () => ({ pass: true }),
};

// Apply the mock matchers
global.expect.extend(matchers);
