import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Providers } from '@/app/providers';
import { girlImages } from '@/data/girlImages';
import ClipsPage from './ClipsPage';

/**
 * The CRM note below the grid has its own list items, so the cards are read off
 * the grid's list rather than by role — otherwise the note's steps count as
 * pictures that are not there. The site footer now renders below the panel on
 * this screen, and its nav `<ul>` would be picked up by a container-wide query,
 * so we scope the selector to `<main>` — the panel's own content landmark.
 */
function setup() {
  const view = render(
    <Providers initialOnboarding={{ ageConfirmed: true, genderCompleted: true }}>
      <MemoryRouter initialEntries={['/clips']}>
        <ClipsPage />
      </MemoryRouter>
    </Providers>,
  );
  const cards = () => {
    const main = view.container.querySelector('main');
    return main ? Array.from(main.querySelectorAll('ul > li')) : [];
  };
  return { cards };
}

describe('live grid', () => {
  it('shows one card per picture in public/Video_Girl_image', () => {
    expect(girlImages.length).toBeGreaterThan(0);
    const { cards } = setup();
    expect(cards()).toHaveLength(girlImages.length);
  });

  it('renders the picture itself on the card, not a video element', () => {
    const { cards } = setup();
    const pictures = cards();
    expect(pictures.map((card) => card.querySelector('img')?.getAttribute('src'))).toEqual(
      girlImages.map((image) => image.src),
    );
    expect(pictures.some((card) => card.querySelector('video'))).toBe(false);
  });

  it('names each card, in the order the pictures sort into', () => {
    const { cards } = setup();
    expect(cards().map((card) => card.textContent?.replace('Live', '').trim())).toEqual(
      girlImages.map((image) => image.name),
    );
  });

  it('keeps every card a way into the call', () => {
    const { cards } = setup();
    for (const card of cards()) {
      expect(card.querySelector('a')).toHaveAttribute('href', '/girl-find');
      expect(card).toHaveTextContent('Live');
    }
    expect(screen.getByRole('heading', { name: /live video call/i })).toBeInTheDocument();
  });
});
