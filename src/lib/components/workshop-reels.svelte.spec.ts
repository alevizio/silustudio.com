import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WorkshopReels from './workshop-reels.svelte';

describe('workshop-reels.svelte', () => {
	it('shows three films, each described in words', async () => {
		const { container } = render(WorkshopReels, { lang: 'es' });
		await expect.element(page.getByRole('list', { name: 'Videos del taller' })).toBeVisible();
		const films = [...container.querySelectorAll('video')];
		expect(films).toHaveLength(3);
		for (const film of films) {
			expect(film.getAttribute('aria-label')).toMatch(/^Video de \d+ segundos: .+\.$/);
		}
	});

	it('never plays or loads a film by itself', async () => {
		const { container } = render(WorkshopReels, { lang: 'es' });
		for (const film of container.querySelectorAll('video')) {
			expect(film.autoplay).toBe(false);
			expect(film.getAttribute('preload')).toBe('none');
			expect(film.controls).toBe(true);
			// On a phone it plays in its place, not full screen.
			expect(film.playsInline).toBe(true);
			expect(film.getAttribute('poster')).toMatch(/taller-\d\.jpg$/);
		}
	});

	it('carries captions in the page language for every film', async () => {
		const spanish = render(WorkshopReels, { lang: 'es' }).container;
		for (const track of spanish.querySelectorAll('track')) {
			expect(track.getAttribute('kind')).toBe('captions');
			expect(track.getAttribute('srclang')).toBe('es');
			expect(track.getAttribute('src')).toMatch(/taller-\d\.es\.vtt$/);
		}
		expect(spanish.querySelectorAll('track')).toHaveLength(3);
		const english = render(WorkshopReels, { lang: 'en' }).container;
		expect(english.querySelector('track')?.getAttribute('src')).toMatch(/taller-1\.en\.vtt$/);
		expect(english.querySelector('video')?.getAttribute('aria-label')).toMatch(/^A 19 second film/);
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkshopReels, { lang: 'es', class: 'pb-6' });
		expect(container.firstElementChild?.classList.contains('pb-6')).toBe(true);
	});
});
