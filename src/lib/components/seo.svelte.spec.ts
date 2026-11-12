import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { SITE } from '#lib/content/site.ts';
import { WORKS } from '#lib/content/works.ts';
import Seo from './seo.svelte';

const head = (selector: string): string | null | undefined =>
	document.head
		.querySelector(selector)
		?.getAttribute(selector.startsWith('link') ? 'href' : 'content');

/** What the page tells search engines in schema.org terms, by type. */
const structured = (): Record<string, Record<string, unknown>> =>
	Object.fromEntries(
		[...document.head.querySelectorAll('script[type="application/ld+json"]')].map((script) => {
			const data: Record<string, unknown> = JSON.parse(script.textContent ?? '{}');
			return [String(data['@type']), data];
		})
	);

describe('seo.svelte', () => {
	it('tells search engines about the gallery on the pages people come to it from', async () => {
		const home = render(Seo, { lang: 'es', page: 'home' });
		await expect.poll(() => structured().ArtGallery?.name).toBe('Silu');
		home.unmount();
		const works = render(Seo, { lang: 'es', page: 'works' });
		await expect.poll(() => document.title).toBe('Obras · Silu');
		expect(structured().ArtGallery).toBeUndefined();
		works.unmount();
	});

	it('tells search engines a work is an artwork, and where its page sits in the site', async () => {
		const page = render(Seo, { lang: 'en', page: 'works', work: WORKS[0] });
		await expect.poll(() => structured().VisualArtwork?.name).toBe('Guijarro');
		expect(structured().BreadcrumbList).toBeDefined();
		expect(structured().ArtGallery).toBeUndefined();
		page.unmount();
	});

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
		await expect.poll(() => document.title).toBe('Duna bañada en peltre · Works · Silu');
		expect(head('meta[name="description"]')).toContain('3 pieces · 100 × 185 × 22 cm');
		expect(head('link[rel="canonical"]')).toBe(
			'https://www.silustudio.com/en/works/duna-banada-en-peltre/'
		);
		expect(head('link[hreflang="es"]')).toBe(
			'https://www.silustudio.com/obras/duna-banada-en-peltre/'
		);
	});

	it('describes a work with no title yet by its stand-in name, without empty facts', async () => {
		const untitled = WORKS.find((work) => work.slug === 'obra-41');
		render(Seo, { lang: 'es', page: 'works', work: untitled });
		await expect.poll(() => document.title).toBe('Obra 41 · Obras · Silu');
		expect(head('meta[name="description"]')).toBe(
			'Obra 41. Obra de Silvestre Jacobi y Lucila Dickinson, Silu.'
		);
		expect(head('link[rel="canonical"]')).toBe('https://www.silustudio.com/obras/obra-41/');
	});

	it('shares a work with its own photo when it has a full size one', async () => {
		render(Seo, { lang: 'es', page: 'works', work: WORKS[0] });
		await expect.poll(() => document.title).toBe('Guijarro · Obras · Silu');
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
