import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Picture } from 'vite-imagetools';
import { preloadPicture } from './preload-picture.ts';

const SIZES = '(min-width: 1024px) 50vw, 100vw';

const picture = (sources: Record<string, string>): Picture => ({
	sources,
	img: { src: '/photo.jpg', w: 800, h: 600 }
});

/** Every image the code under test creates, so their requests can be read back. */
const created: HTMLImageElement[] = [];
const RealImage = window.Image;

const watchImages = (): void => {
	vi.stubGlobal(
		'Image',
		class extends RealImage {
			constructor() {
				super();
				created.push(this);
			}
		}
	);
};

afterEach(() => {
	vi.unstubAllGlobals();
	created.length = 0;
});

describe('preloadPicture', () => {
	it('asks for the photo in the best format it comes in, at the size it will be shown', () => {
		watchImages();
		preloadPicture(picture({ webp: '/photo.webp 800w', avif: '/photo.avif 800w' }), SIZES);
		expect(created).toHaveLength(1);
		expect(created[0].getAttribute('srcset')).toBe('/photo.avif 800w');
		expect(created[0].sizes).toBe(SIZES);
	});

	it('falls back to the next format when the best one is missing', () => {
		watchImages();
		preloadPicture(picture({ webp: '/photo.webp 800w', jpeg: '/photo.jpg 800w' }), SIZES);
		expect(created[0].getAttribute('srcset')).toBe('/photo.webp 800w');
	});

	it('asks for nothing when the photo comes in no modern format', () => {
		watchImages();
		preloadPicture(picture({ jpeg: '/photo.jpg 800w' }), SIZES);
		expect(created).toHaveLength(0);
	});
});
