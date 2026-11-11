import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { PHOTOGRAPHED_WORKS, fullSizePhotosOf } from '#lib/content/images.ts';
import { SITE } from '#lib/content/site.ts';
import ArtistsFilm from './artists-film.svelte';

const poster = PHOTOGRAPHED_WORKS.flatMap(fullSizePhotosOf)[0];
// The tests never call Vimeo: the player they open is an empty page.
const BLANK = 'about:blank';
const props = { lang: 'es', poster, posterAlt: 'Los artistas en el taller', src: BLANK } as const;

describe('artists-film.svelte', () => {
	it('shows a still and a play button, and loads nothing from the player', async () => {
		const { container } = render(ArtistsFilm, props);
		await expect
			.element(page.getByRole('img', { name: 'Los artistas en el taller' }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Ver el video' })).toBeVisible();
		expect(container.querySelector('iframe')).toBeNull();
	});

	it('swaps the still for the player when the visitor presses play', async () => {
		const { container } = render(ArtistsFilm, props);
		await page.getByRole('button', { name: 'Ver el video' }).click();
		const player = container.querySelector('iframe');
		expect(player?.getAttribute('src')).toBe(
			`${BLANK}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`
		);
		expect(player?.getAttribute('title')).toBe('Video de los artistas, en Vimeo');
		expect(container.querySelector('img')).toBeNull();
		expect(container.querySelector('button')).toBeNull();
	});

	it('moves the focus to the player, since the button is gone', async () => {
		const { container } = render(ArtistsFilm, props);
		await page.getByRole('button', { name: 'Ver el video' }).click();
		await expect.poll(() => document.activeElement).toBe(container.querySelector('iframe'));
	});

	it("plays the artists' own film unless told otherwise", () => {
		expect(SITE.filmUrl).toMatch(/^https:\/\/player\.vimeo\.com\/video\/\d+$/);
	});

	it('names the button and the player in English', async () => {
		const { container } = render(ArtistsFilm, { ...props, lang: 'en' });
		await page.getByRole('button', { name: 'Play the film' }).click();
		expect(container.querySelector('iframe')?.getAttribute('title')).toBe(
			'Film of the artists, on Vimeo'
		);
	});

	it('accepts extra classes', async () => {
		const { container } = render(ArtistsFilm, { ...props, class: 'mt-8' });
		expect(container.firstElementChild?.classList.contains('mt-8')).toBe(true);
	});
});
