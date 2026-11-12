import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GalleryFilm from './gallery-film.svelte';

describe('gallery-film.svelte', () => {
	it('shows the film of the gallery, described in words, with its still', async () => {
		const { container } = render(GalleryFilm, { lang: 'es' });
		const video = container.querySelector('video');
		expect(video?.getAttribute('aria-label')).toBe(
			'Película sin sonido: los artistas en el taller y un recorrido por la galería.'
		);
		expect(video?.getAttribute('poster')).toContain('silu-galeria-poster.jpg');
		expect(video?.querySelector('source')?.getAttribute('src')).toContain('silu-galeria.mp4');
	});

	it('runs by itself with no sound, and has no captions left to offer', async () => {
		const { container } = render(GalleryFilm, { lang: 'es' });
		const video = container.querySelector('video');
		expect(video?.muted).toBe(true);
		expect(video?.loop).toBe(true);
		expect(video?.controls).toBe(false);
		expect(container.querySelector('track')).toBeNull();
		await expect.element(page.getByRole('button', { name: /el video$/ })).toBeInTheDocument();
	});

	it('describes the film in English', async () => {
		const { container } = render(GalleryFilm, { lang: 'en' });
		expect(container.querySelector('video')?.getAttribute('aria-label')).toBe(
			'Silent film: the artists in the workshop and a walk through the gallery.'
		);
	});

	it('accepts extra classes', async () => {
		const { container } = render(GalleryFilm, { lang: 'es', class: 'md:col-span-4' });
		expect(container.firstElementChild?.classList.contains('md:col-span-4')).toBe(true);
	});
});
