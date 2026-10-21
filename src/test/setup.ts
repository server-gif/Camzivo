import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// The suite must never reach out to Google Ad Manager: with the switch forced
// off the GPT script is not loaded, the slots render nothing, and the Continue
// / Connect / clip buttons navigate straight away, exactly as before ads.
vi.stubEnv('VITE_GAM_ENABLED', '');

// jsdom does not implement scrolling.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = vi.fn();

// jsdom has no canvas. lottie-web probes one while it is still loading, and a
// null context throws before a single test runs. Tests never animate, so a
// recording stub is enough to keep the module importable.
const canvasContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
  font: '',
  textAlign: '',
  textBaseline: '',
  canvas: null,
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: () => ({ width: 0 }),
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  putImageData: vi.fn(),
  createLinearGradient: () => ({ addColorStop: vi.fn() }),
  createRadialGradient: () => ({ addColorStop: vi.fn() }),
  createPattern: () => null,
};
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  writable: true,
  value: vi.fn(() => canvasContext),
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
