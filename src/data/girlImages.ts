/**
 * The faces on the live-video grid, read from `public/Video_Girl_image/`.
 *
 * The folder *is* the list. Vite expands this glob while it works, so putting a
 * picture in the folder (or taking one out) changes the grid on the next reload
 * — no file name has to be written down in code, config or an env file, and
 * nothing is fetched at runtime.
 *
 * The files live in `public/`, so a production build also copies the folder
 * verbatim; the imported URLs are the hashed copies Vite emits for the grid.
 */
const found = import.meta.glob('/public/Video_Girl_image/*.{png,jpg,jpeg,webp,gif,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/**
 * The name shown under each picture. The file names (`stroke bg-3.png`) are
 * working labels from the export, not something to put in front of a visitor,
 * so the cards are named here in the order the pictures sort into. A folder
 * with more pictures than this list reuses the names from the top.
 */
const DEMO_NAMES = [
  'Nolan Mango',
  'Emerson Blake',
  'Hanna Dias',
  'Alena Philips',
  'Mia Ferrer',
  'Sofia Reyes',
  'Luna Whitfield',
  'Aria Koval',
  'Zoe Ardent',
  'Ivy Norwood',
  'Nora Sandoval',
  'Tessa Vanyu',
  'Rina Okafor',
  'Kelsey Marlow',
  'Dara Lindholm',
];

export type GirlImage = {
  /** File name as it sits in the folder, e.g. `stroke bg-10.png`. */
  file: string;
  /** URL the <img> can load. */
  src: string;
  /** Name shown on the card. */
  name: string;
};

/** Trailing number in a file name — `stroke bg-12` is 12, `stroke bg` has none. */
function numberOf(name: string): number | null {
  const match = name.replace(/\.[^.]+$/, '').match(/(\d+)\s*$/);
  return match ? Number(match[1]) : null;
}

function baseName(path: string): string {
  return path.split('/').pop() ?? path;
}

/**
 * Pictures in name order: 1, 2, … 14, then anything unnumbered. A plain string
 * sort would put `stroke bg-10` straight after `stroke bg-1`.
 */
export const girlImages: GirlImage[] = Object.entries(found)
  .map(([path, src]) => ({ file: baseName(path), src: String(src) }))
  .sort((a, b) => {
    const left = numberOf(a.file);
    const right = numberOf(b.file);
    if (left !== null && right !== null) return left - right;
    if (left !== null) return -1;
    if (right !== null) return 1;
    return a.file.localeCompare(b.file);
  })
  .map((image, index) => ({ ...image, name: DEMO_NAMES[index % DEMO_NAMES.length] ?? image.file }));
