import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { SITE } from '#lib/content/site.ts';
import { WORKS } from '#lib/content/works.ts';
import Seo from './seo.svelte';

const head = (selector: string): string | null | undefined =>
	document.head
		.querySelector(selector)
		?.getAttribute(selector.startsWith('link') ? 'href' : 'content');

describe('seo.svelte', () => {
	it('sets the title and description of the page', async () => {
		render(Seo, { lang: 'es', page: 'works' });
		await expect.poll(() => document.title).toBe('Obras · Silu');
		expect(head('meta[name="description"]')).toContain('Catálogo de obras de Silu');
	});

	it('points to the canonical address and to both languages', async () => {
		render(Seo, { lang: 'en', page: 'visit' });
		await expect
			.poll(() => head('link[rel="canonical"]'))
			.toBe('https://www.silustudio.com/en/visit/');
		expect(head('link[hreflang="es"]')).toBe('https://www.silustudio.com/visitar/');
		expect(head('link[hreflang="en"]')).toBe('https://www.silustudio.com/en/visit/');
		expect(head('link[hreflang="x-default"]')).toBe('https://www.silustudio.com/visitar/');
	});

	it('keeps search engines out until the site is launched', async () => {
		render(Seo, { lang: 'es', page: 'home' });
		await expect.poll(() => document.title).toContain('Silu');
		const robots = document.head.querySelector('meta[name="robots"]');
		if (SITE.launched) expect(robots).toBeNull();
		else expect(robots?.getAttribute('content')).toBe('noindex, nofollow');
	});

	it('describes a work on its own page and ties its two languages', async () => {
		render(Seo, { lang: 'en', page: 'works', work: WORKS[6] });
		await expect.poll(() => document.title).toBe('Duna bañada en peltre · Silu');
		expect(head('meta[name="description"]')).toContain('3 pieces · 100 × 185 × 22 cm');
		expect(head('link[rel="canonical"]')).toBe(
			'https://www.silustudio.com/en/works/duna-banada-en-peltre/'
		);
		expect(head('link[hreflang="es"]')).toBe(
			'https://www.silustudio.com/obras/duna-banada-en-peltre/'
		);
	});

	it('shares a work with its own photo when it has a full size one', async () => {
		render(Seo, { lang: 'es', page: 'works', work: WORKS[0] });
		await expect.poll(() => document.title).toBe('Guijarro · Silu');
		const image = head('meta[property="og:image"]');
		expect(image).toMatch(/^https:\/\/www\.silustudio\.com\/.+/);
		expect(image).not.toContain('og.jpg');
	});

	it('adds a share card with an image', async () => {
		render(Seo, { lang: 'es', page: 'home' });
		await expect
			.poll(() => head('meta[property="og:image"]'))
			.toBe('https://www.silustudio.com/og.jpg');
		expect(head('meta[property="og:locale"]')).toBe('es_UY');
	});
});
