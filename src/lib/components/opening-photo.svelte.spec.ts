import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { HERO_PHOTO, HERO_PHOTO_TALL } from '#lib/content/images.ts';
import OpeningPhoto, { WIDE_SCREEN } from './opening-photo.svelte';

const alt = 'Interior de la galería';
const props = { tall: HERO_PHOTO_TALL, wide: HERO_PHOTO, alt };

/** The choices the photo offers the browser, in the order the browser reads them. */
const sourcesIn = (container: Element): HTMLSourceElement[] => [
	...container.querySelectorAll('source')
];

describe('opening-photo.svelte', () => {
	it('shows one photo with its description', async () => {
		render(OpeningPhoto, props);
		await expect.element(page.getByRole('img', { name: alt })).toBeInTheDocument();
		expect(page.getByRole('img').elements()).toHaveLength(1);
	});

	it('offers the horizontal photo to a wide screen first, and the phone one to every other', async () => {
		const { container } = render(OpeningPhoto, props);
		await expect.element(page.getByRole('img', { name: alt })).toBeInTheDocument();
		const sources = sourcesIn(container);
		const wide = sources.filter((source) => source.media === WIDE_SCREEN);
		const tall = sources.filter((source) => source.media === '');
		expect(wide.length).toBeGreaterThan(0);
		expect(tall).toHaveLength(wide.length);
		// A browser takes the first choice that fits, so the ones with a condition come first.
		expect(sources.slice(0, wide.length)).toEqual(wide);
		// Each choice is one of the photo's own files, in one of its formats.
		expect(wide.map((source) => source.srcset)).toEqual(Object.values(HERO_PHOTO.sources));
		expect(tall.map((source) => source.srcset)).toEqual(Object.values(HERO_PHOTO_TALL.sources));
		expect(wide.map((source) => source.type)).toEqual(
			Object.keys(HERO_PHOTO.sources).map((format) => `image/${format}`)
		);
	});

	it('says how large each photo is, so the page keeps its place while the photo loads', async () => {
		const { container } = render(OpeningPhoto, props);
		const image = container.querySelector('img');
		expect(image?.getAttribute('width')).toBe(String(HERO_PHOTO_TALL.img.w));
		expect(image?.getAttribute('height')).toBe(String(HERO_PHOTO_TALL.img.h));
		for (const source of sourcesIn(container).filter((each) => each.media === WIDE_SCREEN)) {
			expect(source.getAttribute('width')).toBe(String(HERO_PHOTO.img.w));
			expect(source.getAttribute('height')).toBe(String(HERO_PHOTO.img.h));
		}
	});

	it('loads at once and ahead of everything else', async () => {
		const { container } = render(OpeningPhoto, props);
		const image = container.querySelector('img');
		expect(image?.getAttribute('fetchpriority')).toBe('high');
		expect(image?.getAttribute('loading')).not.toBe('lazy');
	});

	it('runs edge to edge unless it is told how wide it shows', async () => {
		const first = render(OpeningPhoto, props);
		for (const source of sourcesIn(first.container)) expect(source.sizes).toBe('100vw');
		first.unmount();
		const { container } = render(OpeningPhoto, { ...props, sizes: '50vw' });
		for (const source of sourcesIn(container)) expect(source.sizes).toBe('50vw');
	});

	it('fills its place, and accepts extra classes', async () => {
		const { container } = render(OpeningPhoto, { ...props, class: 'motion-safe:animate-settle' });
		const image = container.querySelector('img');
		expect(image?.classList.contains('size-full')).toBe(true);
		expect(image?.classList.contains('object-cover')).toBe(true);
		expect(image?.classList.contains('motion-safe:animate-settle')).toBe(true);
	});
});
