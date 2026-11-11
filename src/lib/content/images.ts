import type { Picture } from 'vite-imagetools';
import { WORKS, catalogNumber, type Work } from './works.ts';

type PictureModule = { default: Picture };

const fileName = (path: string): string => path.slice(path.lastIndexOf('/') + 1);
const folderName = (path: string): string => path.split('/').at(-2) ?? '';

/** Pictures grouped by a key taken from their path, each group in file name order. */
const grouped = (
	modules: Record<string, PictureModule>,
	keyOf: (path: string) => string
): Record<string, Picture[]> => {
	const groups: Record<string, Picture[]> = {};
	for (const path of Object.keys(modules).sort()) {
		(groups[keyOf(path)] ??= []).push(modules[path].default);
	}
	return groups;
};

/* Small photos cropped from the artists' PDF catalog: 07-1.jpg is the whole view of work 7, 07-2.jpg a detail. */
const CATALOG = grouped(
	import.meta.glob<PictureModule>('/src/lib/assets/catalog/*.jpg', {
		eager: true,
		// Naming widths makes each photo show at its real pixel size instead of half of it.
		// Nothing is enlarged: a photo narrower than a width here keeps its own width.
		query: { enhanced: true, w: '760;380' }
	}),
	(path) => fileName(path).slice(0, 2)
);

/* Full size photos, one folder per work named after its slug: works/guijarro/01.png, 02.jpg and so on. */
const FULL_SIZE = grouped(
	import.meta.glob<PictureModule>('/src/lib/assets/works/*/*.{png,jpg,jpeg,webp}', {
		eager: true,
		query: { enhanced: true, w: '1600;1080;720;480' }
	}),
	folderName
);

/** The photo shown beside a work in the list: its whole view from the catalog. */
export const thumbOf = (work: Work): Picture | undefined => CATALOG[catalogNumber(work.n)]?.[0];

/** A work's full size photos, in file name order. Empty until the artists send them. */
export const fullSizePhotosOf = (work: Work): Picture[] => FULL_SIZE[work.slug] ?? [];

/** What a work's page shows: its full size photos, or the catalog photos while it has none. */
export const photosOf = (work: Work): Picture[] => {
	const fullSize = fullSizePhotosOf(work);
	return fullSize.length > 0 ? fullSize : (CATALOG[catalogNumber(work.n)] ?? []);
};

/** Works that have at least one full size photo, in catalog order. */
export const PHOTOGRAPHED_WORKS: readonly Work[] = WORKS.filter(
	(work) => fullSizePhotosOf(work).length > 0
);

/**
 * Photos from the old site that could not be matched to a catalog title with certainty:
 * whole works first, then details. They are shown without a label until the artists name them.
 */
export const UNTITLED_PHOTOS: readonly Picture[] = Object.values(
	import.meta.glob<PictureModule>('/src/lib/assets/untitled/*.png', {
		eager: true,
		query: { enhanced: true, w: '1485;1080;720;480' }
	})
).map((module) => module.default);
