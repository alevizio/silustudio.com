import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WorkshopReel from './workshop-reel.svelte';

/** A screen large enough for a whole film at its own size, 720 by 1280, and its button. */
const ROOMY = { width: 1280, height: 1600 };

describe('workshop-reel.svelte', () => {
	it('shows one film of the workshop, described in words', async () => {
		const { container } = render(WorkshopReel, { lang: 'es', film: 1 });
		const film = container.querySelector('video');
		expect(film?.getAttribute('aria-label')).toMatch(/^Video sin sonido: .+\.$/);
		expect(film?.getAttribute('poster')).toMatch(/taller-1\.jpg$/);
		expect(film?.querySelector('source')?.getAttribute('src')).toMatch(/taller-1\.mp4$/);
	});

	it('shows the film it is asked for', async () => {
		const { container } = render(WorkshopReel, { lang: 'en', film: 3 });
		const film = container.querySelector('video');
		expect(film?.getAttribute('aria-label')).toMatch(/^Silent film: from sanding/);
		expect(film?.querySelector('source')?.getAttribute('src')).toMatch(/taller-3\.mp4$/);
	});

	it('runs silent and in a loop, in its place, and downloads nothing until it is needed', async () => {
		const { container } = render(WorkshopReel, { lang: 'es', film: 2 });
		const film = container.querySelector('video');
		expect(film?.muted).toBe(true);
		expect(film?.loop).toBe(true);
		expect(film?.playsInline).toBe(true);
		expect(film?.getAttribute('preload')).toBe('none');
		// No controls of the browser over it: it hangs like a photo, with one small button.
		expect(film?.controls).toBe(false);
	});

	it('gives the visitor a button to stop it and to start it again', async () => {
		// The styles are not loaded here, so the film takes its full size with the button under
		// it. A screen that fits both keeps the click from scrolling the film out of view,
		// which stops it by itself.
		await page.viewport(ROOMY.width, ROOMY.height);
		const { container } = render(WorkshopReel, { lang: 'es', film: 1 });
		const film = container.querySelector('video');
		const button = page.getByRole('button');
		await expect.element(button).toBeVisible();
		// On screen in the test page, it starts by itself.
		await expect.poll(() => film?.paused).toBe(false);
		await expect.element(button).toHaveAccessibleName('Pausar el video');
		await button.click();
		await expect.poll(() => film?.paused).toBe(true);
		await expect.element(button).toHaveAccessibleName('Reproducir el video');
		await button.click();
		await expect.poll(() => film?.paused).toBe(false);
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkshopReel, { lang: 'es', film: 1, class: 'lg:col-span-4' });
		expect(container.firstElementChild?.classList.contains('lg:col-span-4')).toBe(true);
	});
});
