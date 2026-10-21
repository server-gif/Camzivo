import { describe, expect, it } from 'vitest';
import { girlImages } from './girlImages';

/** The number a file ends with — `stroke bg-12.png` is 12, `stroke bg.png` none. */
function trailingNumber(file: string): number {
  return Number(file.replace(/\.[^.]+$/, '').match(/(\d+)\s*$/)?.[1] ?? NaN);
}

describe('girlImages', () => {
  it('gives every picture in the folder a url and a name', () => {
    expect(girlImages.length).toBeGreaterThan(0);
    for (const image of girlImages) {
      expect(image.src).toMatch(/\.(png|jpe?g|webp|gif|avif)(\?|$)/i);
      expect(image.name).toBeTruthy();
    }
  });

  it('sorts by the number in the file name, so bg-10 follows bg-9', () => {
    const numbers = girlImages.map((image) => trailingNumber(image.file)).filter(Number.isFinite);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    expect(numbers).toContain(10);
    // A string sort would have put 10 second, right after 1.
    expect(numbers.indexOf(10)).toBeGreaterThan(numbers.indexOf(2));
  });

  it('puts a picture with no number last', () => {
    const unnumbered = girlImages.filter((image) => !Number.isFinite(trailingNumber(image.file)));
    if (unnumbered.length > 0) {
      expect(girlImages.slice(-unnumbered.length).map((image) => image.file)).toEqual(
        unnumbered.map((image) => image.file),
      );
    }
  });

  it('names the pictures distinctly', () => {
    expect(new Set(girlImages.map((image) => image.name)).size).toBe(girlImages.length);
  });
});
