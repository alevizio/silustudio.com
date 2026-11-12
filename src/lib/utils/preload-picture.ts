import type { Picture } from 'vite-imagetools';

/** The formats a photo comes in, best first. A <picture> picks the same way. */
const FORMATS = ['avif', 'webp'];

/**
 * Asks the browser for a photo before it is on the page, in the size it would be shown at,
 * so it is there at once when the visitor gets to it. `sizes` is what the <img> will carry.
 */
export const preloadPicture = (picture: Picture, sizes: string): void => {
	const format = FORMATS.find((candidate) => candidate in picture.sources);
	if (!format) return;
	const image = new Image();
	image.sizes = sizes;
	image.srcset = picture.sources[format];
};
