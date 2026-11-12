/*
 * What the pages tell search engines in their own vocabulary (schema.org, as JSON-LD): that
 * Silu is an art gallery with an address, and that each work is an artwork by the two artists.
 * It repeats what a visitor can read on the page and adds nothing a visitor cannot see.
 */
import { ROUTES, copyFor, workPath, type Lang } from '#lib/i18n/index.ts';
import { photosOf } from './images.ts';
import { SITE } from './site.ts';
import type { Work } from './works.ts';

export type StructuredData = Record<string, unknown>;

const CONTEXT = 'https://schema.org';
/** Manantiales is in the department of Maldonado. The site itself says "Punta del Este". */
const DEPARTMENT = 'Maldonado';
const COUNTRY_CODE = 'UY';
const SHARE_IMAGE = '/og.jpg';

const absolute = (path: string): string => `${SITE.url}${path}`;

/** The two artists, by the names their biographies carry. */
const artists = (): StructuredData[] =>
	copyFor('es').studio.bios.map(({ name }) => ({ '@type': 'Person', name }));

/**
 * The gallery: its name, address, place on the map and ways to reach it. Opening hours join
 * it once the artists confirm them.
 */
export const galleryData = (lang: Lang): StructuredData => ({
	'@context': CONTEXT,
	'@type': 'ArtGallery',
	'@id': absolute('/#galeria'),
	name: SITE.name,
	alternateName: 'Silu Studio',
	description: copyFor(lang).meta.home.description,
	url: absolute(ROUTES[lang].home),
	image: absolute(SHARE_IMAGE),
	telephone: SITE.phone.href.replace('tel:', ''),
	email: SITE.email,
	address: {
		'@type': 'PostalAddress',
		streetAddress: SITE.address.street,
		addressLocality: SITE.address.locality,
		addressRegion: DEPARTMENT,
		addressCountry: COUNTRY_CODE
	},
	geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
	hasMap: SITE.directionsUrl,
	sameAs: [SITE.instagram.url],
	founder: artists()
});

/**
 * A work, as an artwork by the two artists with its photos, technique and size. A work with
 * no title yet has nothing to be called, so it is left out until it has one.
 */
export const workData = (work: Work, lang: Lang): StructuredData | undefined => {
	if (work.title === undefined) return undefined;
	return {
		'@context': CONTEXT,
		'@type': 'VisualArtwork',
		name: work.title,
		url: absolute(workPath(lang, work.slug)),
		image: photosOf(work).map((photo) => absolute(photo.img.src)),
		creator: artists(),
		...(work.medium && { artMedium: work.medium[lang] }),
		...(work.dimensions && { size: work.dimensions[lang] }),
		inLanguage: lang
	};
};

/** The way down to a work's page: home, the works, the work. */
export const workTrail = (work: Work, name: string, lang: Lang): StructuredData => ({
	'@context': CONTEXT,
	'@type': 'BreadcrumbList',
	itemListElement: [
		{ name: SITE.name, item: absolute(ROUTES[lang].home) },
		{ name: copyFor(lang).works.title, item: absolute(ROUTES[lang].works) },
		{ name, item: absolute(workPath(lang, work.slug)) }
	].map((step, index) => ({ '@type': 'ListItem', position: index + 1, ...step }))
});

/**
 * The text of a JSON-LD script. "<" is written as an escape, so nothing in the data can end
 * the script it sits in.
 */
export const serialise = (data: StructuredData): string =>
	JSON.stringify(data).replace(/</g, '\\u003c');
