import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { girlImages } from '@/data/girlImages';
import { renderRoute } from '@/test/renderRoute';

const adult = { ageConfirmed: true };

describe('welcome step', () => {
  it('is the home screen and starts the flow from the Continue button', async () => {
    const { user, router } = renderRoute('/');
    expect(await screen.findByRole('heading', { level: 1, name: /Random video call/i })).toBeInTheDocument();

    await user.click(within(screen.getByRole('main')).getByRole('link', { name: /^continue$/i }));
    expect(router.state.location.pathname).toBe('/age');
    expect(await screen.findByRole('heading', { name: /how old are you/i })).toBeInTheDocument();
  });

  it('shows the four-step progress bar with Welcome active', async () => {
    renderRoute('/');
    const progress = await screen.findByRole('navigation', { name: 'Progress' });
    const items = within(progress).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    for (const label of ['Welcome', 'Age', 'Gender', 'Live Video']) {
      expect(within(progress).getByText(label)).toBeInTheDocument();
    }
    expect(items[0]).toHaveAttribute('aria-current', 'step');
  });

  it('footer links still point at the real info pages', async () => {
    const { user } = renderRoute('/about');
    const legal = await screen.findByRole('navigation', { name: 'Legal' });
    for (const [label, path] of [['About', '/about'], ['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms']]) {
      expect(within(legal).getByRole('link', { name: label })).toHaveAttribute('href', path);
    }
    await user.click(within(legal).getByRole('link', { name: 'Privacy Policy' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.queryByText(/draft — not yet reviewed/i)).not.toBeInTheDocument();
  });

  it('shows the legal line on every flow screen including the final Lottie page', async () => {
    // Welcome is step 0 of the flow. It does NOT get the full site `<footer>`
    // (that one is reserved for the standalone info pages); instead the panel
    // renders a thin “About · Privacy Policy · Terms & Conditions” line below
    // the existing content.
    const { router } = renderRoute('/');
    const legal = await screen.findByRole('navigation', { name: 'Legal' });
    expect(within(legal).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(within(legal).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    expect(within(legal).getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute('href', '/terms');
    // And the heavy site footer must not appear here.
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();

    // The last Lottie screen (“finding someone”) shows the same legal line as
    // the other flow screens now that the CRM note scrolls below it.
    await router.navigate('/girl-find');
    const findLegal = await screen.findByRole('navigation', { name: 'Legal' });
    expect(within(findLegal).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});

describe('age step', () => {
  it('requires an age range', async () => {
    const { user, router } = renderRoute('/age');
    await user.click(await screen.findByRole('button', { name: /continue/i }));
    expect(await screen.findByText(/select your age range/i)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/age');
  });

  it('offers the four adult ranges', async () => {
    renderRoute('/age');
    for (const name of ['18-24', '25-31', '32-39', '40+']) {
      expect(await screen.findByRole('radio', { name })).toBeInTheDocument();
    }
  });

  it('keeps the gate closed for a stored under-18 denial, and "Back to home" clears it', async () => {
    const { user, router } = renderRoute('/age', { ageDenied: true });
    expect(await screen.findByRole('heading', { name: /adults only/i })).toBeInTheDocument();

    // Trying to skip ahead redirects back to the closed gate.
    await router.navigate('/clips');
    await waitFor(() => expect(router.state.location.pathname).toBe('/age'));
    expect(await screen.findByRole('heading', { name: /adults only/i })).toBeInTheDocument();

    // Going home ends the denial; the age step is fresh again.
    await user.click(screen.getByRole('button', { name: /back to home/i }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    await router.navigate('/age');
    expect(await screen.findByRole('heading', { name: /how old are you/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /adults only/i })).not.toBeInTheDocument();
  });
});

describe('gender step', () => {
  it('cannot be reached without the age step', async () => {
    const { router } = renderRoute('/gender');
    expect(await screen.findByRole('heading', { name: /how old are you/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/age');
  });

  it('requires a choice and offers both options', async () => {
    const { user, router } = renderRoute('/gender', adult);
    for (const name of ['Male', 'Female']) {
      expect(await screen.findByRole('radio', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('radio', { name: /prefer not to say/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByText(/choose an option to continue/i)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/gender');
  });
});

describe('full onboarding flow', () => {
  it('goes welcome → age → gender → live video list', async () => {
    const { user, router } = renderRoute('/');
    await user.click(await screen.findByRole('link', { name: /^continue$/i }));

    await user.click(await screen.findByRole('radio', { name: '18-24' }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await user.click(await screen.findByRole('radio', { name: 'Male' }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // The grid lists every picture in public/Video_Girl_image.
    expect(router.state.location.pathname).toBe('/clips');
    const [firstCard] = girlImages;
    if (!firstCard) throw new Error('public/Video_Girl_image has no pictures to show');
    expect(await screen.findByText(firstCard.name)).toBeInTheDocument();
  });

  it('sends a half-finished visitor from /clips to the gender step', async () => {
    const { router } = renderRoute('/clips', adult);
    expect(await screen.findByRole('heading', { name: /what.s your gender/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/gender');
  });
});

describe('connect result', () => {
  it('apologises when no new user is found and offers to search again', async () => {
    const { user, router } = renderRoute('/connect');
    // The copy is revealed with a typewriter effect, so wait for the full
    // string to finish typing before asserting on it.
    expect(await screen.findByText(/try again to meet someone new/i, undefined, { timeout: 8000 })).toBeInTheDocument();
    // The “meet someone new!” tap plays the interstitial first (a no-op with
    // GAM off in tests), then routes to /age to restart the flow.
    await user.click(await screen.findByRole('link', { name: /meet someone new/i }));
    expect(router.state.location.pathname).toBe('/age');
  });
});

describe('unknown routes', () => {
  it('shows the custom 404 page with a way home', async () => {
    const { user, router } = renderRoute('/does-not-exist');
    expect(await screen.findByRole('heading', { name: /skipped to the next clip/i })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /back to home/i }));
    expect(router.state.location.pathname).toBe('/');
  });
});
