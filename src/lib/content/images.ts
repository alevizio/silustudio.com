import type { Picture } from 'vite-imagetools';
import { CATALOG_WORKS, WORKS, catalogNumber, type CatalogWork, type Work } from './works.ts';

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
const CATALOG_BY_NUMBER = grouped(
	import.meta.glob<PictureModule>('/src/lib/assets/catalog/*.jpg', {
		eager: true,
		// Naming widths makes each photo show at its real pixel size instead of half of it.
		// Nothing is enlarged: a photo narrower than a width here keeps its own width.
		query: { enhanced: true, w: '760;380' }
	}),
	(path) => fileName(path).slice(0, 2)
);

const CATALOG_PHOTOS = new Map(
	CATALOG_WORKS.map((work) => [work.slug, CATALOG_BY_NUMBER[catalogNumber(work.n)] ?? []])
);

/* Full size photos, one folder per work named after its slug: works/guijarro/01.png, 02.jpg and so on. */
const FULL_SIZE = grouped(
	import.meta.glob<PictureModule>('/src/lib/assets/works/*/*.{png,jpg,jpeg,webp}', {
		eager: true,
		query: { enhanced: true, w: '1600;1080;720;480' }
	}),
	folderName
);

/** A work's full size photos, in file name order. Empty until the artists send them. */
export const fullSizePhotosOf = (work: Work): Picture[] => FULL_SIZE[work.slug] ?? [];

/** What a work's page shows: its full size photos, or the catalog photos while it has none. */
export const photosOf = (work: Work): Picture[] => {
	const fullSize = fullSizePhotosOf(work);
	return fullSize.length > 0 ? fullSize : (CATALOG_PHOTOS.get(work.slug) ?? []);
};

const hasFullSizePhoto = (work: Work): boolean => fullSizePhotosOf(work).length > 0;

/** Works with at least one full size photo. They hang large on the works page. */
export const PHOTOGRAPHED_WORKS: readonly Work[] = WORKS.filter(hasFullSizePhoto);

/** Catalog works that only have the small catalog photos. They hang smaller, below the wall. */
export const LISTED_WORKS: readonly CatalogWork[] = CATALOG_WORKS.filter(
	(work) => !hasFullSizePhoto(work)
);

/** The order a visitor meets the works in: the wall, then the works with small photos. */
export const ORDERED_WORKS: readonly Work[] = [...PHOTOGRAPHED_WORKS, ...LISTED_WORKS];

/** Pictures from a folder, in file name order. */
const inOrder = (modules: Record<string, PictureModule>): Picture[] =>
	Object.keys(modules)
		.sort()
		.map((path) => modules[path].default);

/**
 * The photo that opens the home page. It runs from edge to edge of the screen, so it is
 * offered at every width up to its own and with less compression than the other photos.
 * Left to the usual two copies, an ordinary screen would get the half-size one, 890 pixels
 * stretched across the whole screen.
 */
export const HERO_PHOTO: Picture = inOrder(
	import.meta.glob<PictureModule>('/src/lib/assets/gallery/sala-01.jpg', {
		eager: true,
		query: { enhanced: true, w: '1779;1280;960;640', quality: '82' }
	})
)[0];

/*
 * The next two sets are copies from the artists' Instagram (about 1080 pixels wide), to be
 * replaced by the original files when the artists send them.
 */

/** The artists and their helpers at work: the black and white series from their Instagram. */
export const AT_WORK_PHOTOS: readonly Picture[] = inOrder(
	import.meta.glob<PictureModule>('/src/lib/assets/studio/taller-*.jpg', {
		eager: true,
		query: { enhanced: true, w: '1080;720;480' }
	})
);

/** Works hanging in the homes of the people who bought them. */
export const IN_HOMES_PHOTOS: readonly Picture[] = inOrder(
	import.meta.glob<PictureModule>('/src/lib/assets/homes/*.jpg', {
		eager: true,
		query: { enhanced: true, w: '1080;720;480' }
	})
);

/**
 * Photos from the old site that could not be matched to a work with certainty: whole works
 * first, then details. They are shown without a label until the artists name them.
 */
export const UNTITLED_PHOTOS: readonly Picture[] = Object.values(
	import.meta.glob<PictureModule>('/src/lib/assets/untitled/*.png', {
		eager: true,
		query: { enhanced: true, w: '1485;1080;720;480' }
	})
).map((module) => module.default);
