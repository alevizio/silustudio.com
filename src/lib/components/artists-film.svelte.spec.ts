import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { PHOTOGRAPHED_WORKS, fullSizePhotosOf } from '#lib/content/images.ts';
import { SITE } from '#lib/content/site.ts';
import { askForLessMotion } from '#lib/motion/preference.mock.ts';
import ArtistsFilm from './artists-film.svelte';

const poster = PHOTOGRAPHED_WORKS.flatMap(fullSizePhotosOf)[0];
// The tests never call Vimeo: the player they open is a file of the site itself, which can
// also be asked what the page told it.
const PLAYER = new URL('/robots.txt', location.href).href;
const OPTIONS = 'autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&dnt=1';
const props = { lang: 'es', poster, posterAlt: 'Los artistas en el taller', src: PLAYER } as const;

/** Collects what the page tells the player from now on, once the player has loaded. */
const ordersTo = async (player: HTMLIFrameElement | null): Promise<unknown[]> => {
	await expect.poll(() => player?.contentWindow?.location.pathname).toBe('/robots.txt');
	await expect.poll(() => player?.contentDocument?.readyState).toBe('complete');
	const orders: unknown[] = [];
	player?.contentWindow?.addEventListener('message', (event) => orders.push(event.data));
	return orders;
};

describe('artists-film.svelte', () => {
	afterEach(() => vi.restoreAllMocks());

	it('starts by itself, silent and in a loop, without the controls of the player', async () => {
		const { container } = render(ArtistsFilm, props);
		await expect.poll(() => container.querySelector('iframe')).not.toBeNull();
		const player = container.querySelector('iframe');
		expect(player?.getAttribute('src')).toBe(`${PLAYER}?${OPTIONS}`);
		expect(player?.getAttribute('title')).toBe('Video de los artistas, en Vimeo');
		// With no controls in it, the player is kept out of the keyboard's way.
		expect(player?.tabIndex).toBe(-1);
		expect(container.querySelector('button[class*="inset-0"]')).toBeNull();
	});

	it('keeps the still under the player, for the moment before the film arrives', async () => {
		const { container } = render(ArtistsFilm, props);
		await expect.poll(() => container.querySelector('iframe')).not.toBeNull();
		await expect
			.element(page.getByRole('img', { name: 'Los artistas en el taller' }))
			.toBeInTheDocument();
	});

	it('does not take the focus when it starts by itself', async () => {
		const { container } = render(ArtistsFilm, props);
		await expect.element(page.getByRole('button', { name: 'Pausar el video' })).toBeVisible();
		expect(container.contains(document.activeElement)).toBe(false);
	});

	it('gives the visitor a button that tells the player to stop and to go on', async () => {
		const { container } = render(ArtistsFilm, props);
		const stop = page.getByRole('button', { name: 'Pausar el video' });
		await expect.element(stop).toBeVisible();
		const orders = await ordersTo(container.querySelector('iframe'));
		await stop.click();
		await expect.poll(() => orders.at(-1)).toEqual({ method: 'pause' });
		await page.getByRole('button', { name: 'Reproducir el video' }).click();
		await expect.poll(() => orders.at(-1)).toEqual({ method: 'play' });
	});

	it('shows only the still to a visitor who asks for less motion, and loads no player', async () => {
		askForLessMotion();
		const { container } = render(ArtistsFilm, props);
		await expect.element(page.getByRole('button', { name: 'Ver el video' })).toBeVisible();
		await expect
			.element(page.getByRole('img', { name: 'Los artistas en el taller' }))
			.toBeInTheDocument();
		expect(container.querySelector('iframe')).toBeNull();
	});

	it('starts for that visitor when they press play, and hands the focus to the button that stops it', async () => {
		askForLessMotion();
		const { container } = render(ArtistsFilm, props);
		await page.getByRole('button', { name: 'Ver el video' }).click();
		expect(container.querySelector('iframe')?.getAttribute('src')).toBe(`${PLAYER}?${OPTIONS}`);
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Pausar el video');
	});

	it("plays the artists' own film unless told otherwise", () => {
		expect(SITE.filmUrl).toMatch(/^https:\/\/player\.vimeo\.com\/video\/\d+$/);
	});

	it('names the buttons and the player in English', async () => {
		askForLessMotion();
		const { container } = render(ArtistsFilm, { ...props, lang: 'en' });
		await page.getByRole('button', { name: 'Play the film' }).click();
		expect(container.querySelector('iframe')?.getAttribute('title')).toBe(
			'Film of the artists, on Vimeo'
		);
		await expect.element(page.getByRole('button', { name: 'Pause the film' })).toBeVisible();
	});

	it('accepts extra classes', async () => {
		const { container } = render(ArtistsFilm, { ...props, class: 'mt-8' });
		expect(container.firstElementChild?.classList.contains('mt-8')).toBe(true);
	});
});
