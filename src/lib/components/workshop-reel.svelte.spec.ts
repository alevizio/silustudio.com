import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WorkshopReel from './workshop-reel.svelte';

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

	it('arrives softly with the rest of the page, and accepts extra classes', async () => {
		const { container } = render(WorkshopReel, { lang: 'es', film: 1, class: 'lg:col-span-4' });
		const frame = container.firstElementChild;
		expect(frame?.classList.contains('reveal')).toBe(true);
		expect(frame?.classList.contains('lg:col-span-4')).toBe(true);
	});
});
