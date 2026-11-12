import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { askForLessMotion } from '#lib/motion/preference.mock.ts';
import SilentFilm from './silent-film.svelte';

/** A screen large enough for a whole film at its own size, 720 by 1280, and its button. */
const ROOMY = { width: 1280, height: 1600 };
const props = {
	lang: 'es',
	video: '/video/taller-1.mp4',
	poster: '/video/taller-1.jpg',
	label: 'Video sin sonido: una pieza redonda en el taller.'
} as const;

describe('silent-film.svelte', () => {
	afterEach(() => vi.restoreAllMocks());

	it('shows the film it is handed, described in words, with its still', async () => {
		const { container } = render(SilentFilm, props);
		const film = container.querySelector('video');
		expect(film?.getAttribute('aria-label')).toBe(props.label);
		expect(film?.getAttribute('poster')).toBe(props.poster);
		expect(film?.querySelector('source')?.getAttribute('src')).toBe(props.video);
	});

	it('runs silent and in a loop, in its place, and downloads nothing until it is needed', async () => {
		const { container } = render(SilentFilm, props);
		const film = container.querySelector('video');
		expect(film?.muted).toBe(true);
		expect(film?.loop).toBe(true);
		expect(film?.playsInline).toBe(true);
		expect(film?.getAttribute('preload')).toBe('none');
		// No controls of the browser over it: it hangs like a photo, with one small button.
		expect(film?.controls).toBe(false);
	});

	it('starts by itself on screen, and gives the visitor a button to stop it and start it again', async () => {
		// The styles are not loaded here, so the film takes its full size with the button under
		// it. A screen that fits both keeps the click from scrolling the film out of view,
		// which stops it by itself.
		await page.viewport(ROOMY.width, ROOMY.height);
		const { container } = render(SilentFilm, props);
		const film = container.querySelector('video');
		const button = page.getByRole('button');
		await expect.poll(() => film?.paused).toBe(false);
		await expect.element(button).toHaveAccessibleName('Pausar el video');
		await button.click();
		await expect.poll(() => film?.paused).toBe(true);
		await expect.element(button).toHaveAccessibleName('Reproducir el video');
		await button.click();
		await expect.poll(() => film?.paused).toBe(false);
	});

	it('stays still for a visitor who asks for less motion, until they press play', async () => {
		askForLessMotion();
		await page.viewport(ROOMY.width, ROOMY.height);
		const { container } = render(SilentFilm, props);
		const film = container.querySelector('video');
		const button = page.getByRole('button', { name: 'Reproducir el video' });
		await expect.element(button).toBeVisible();
		// Two frames are more than the film would need to start by itself.
		await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
		expect(film?.paused).toBe(true);
		await button.click();
		await expect.poll(() => film?.paused).toBe(false);
	});

	it('accepts extra classes', async () => {
		const { container } = render(SilentFilm, { ...props, class: 'lg:col-span-4' });
		expect(container.firstElementChild?.classList.contains('lg:col-span-4')).toBe(true);
	});
});
