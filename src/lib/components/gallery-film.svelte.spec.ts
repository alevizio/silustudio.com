import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GalleryFilm from './gallery-film.svelte';

describe('gallery-film.svelte', () => {
	it('shows a described video with controls and a poster', async () => {
		const { container } = render(GalleryFilm, { lang: 'es' });
		const video = container.querySelector('video');
		expect(video?.getAttribute('aria-label')).toContain('recorrido por la galería');
		expect(video?.controls).toBe(true);
		expect(video?.getAttribute('poster')).toContain('silu-galeria-poster.jpg');
		expect(video?.querySelector('source')?.getAttribute('src')).toContain('silu-galeria.mp4');
	});

	it('never plays or downloads the film until the visitor asks', async () => {
		const { container } = render(GalleryFilm, { lang: 'es' });
		const video = container.querySelector('video');
		expect(video?.autoplay).toBe(false);
		expect(video?.getAttribute('preload')).toBe('none');
		expect(video?.paused).toBe(true);
	});

	it('offers captions in the language of the page', async () => {
		const { container } = render(GalleryFilm, { lang: 'en' });
		const track = container.querySelector('track');
		expect(track?.getAttribute('kind')).toBe('captions');
		expect(track?.getAttribute('srclang')).toBe('en');
		expect(track?.getAttribute('src')).toContain('silu-galeria.en.vtt');
		expect(track?.getAttribute('label')).toBe('Captions');
	});

	it('accepts extra classes', async () => {
		const { container } = render(GalleryFilm, { lang: 'es', class: 'md:col-span-4' });
		expect(container.querySelector('video')?.classList.contains('md:col-span-4')).toBe(true);
	});
});
