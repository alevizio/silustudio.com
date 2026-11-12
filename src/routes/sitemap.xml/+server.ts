import { ORDERED_WORKS, photosOf } from '#lib/content/images.ts';
import { SITE } from '#lib/content/site.ts';
import { LANGS, PAGES, ROUTES, workPath, type Lang } from '#lib/i18n/index.ts';
import type { RequestHandler } from './$types';

// Written once, when the site is built.
export const prerender = true;

const absolute = (path: string): string => `${SITE.url}${path}`;

/** What must not appear as itself inside XML. */
const escape = (text: string): string =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface Entry {
	/** The address of the page in each language. */
	paths: Record<Lang, string>;
	/** Photos on the page, so they can be found by an image search. */
	images: string[];
}

const entries = (): Entry[] => [
	...PAGES.map((page) => ({
		paths: { es: ROUTES.es[page], en: ROUTES.en[page] },
		images: []
	})),
	...ORDERED_WORKS.map((work) => ({
		paths: { es: workPath('es', work.slug), en: workPath('en', work.slug) },
		images: photosOf(work).map((photo) => photo.img.src)
	}))
];

/** One page in one language, tied to the same page in the other. */
const url = (entry: Entry, lang: Lang): string =>
	[
		'<url>',
		`<loc>${escape(absolute(entry.paths[lang]))}</loc>`,
		...LANGS.map(
			(code) =>
				`<xhtml:link rel="alternate" hreflang="${code}" href="${escape(absolute(entry.paths[code]))}"/>`
		),
		`<xhtml:link rel="alternate" hreflang="x-default" href="${escape(absolute(entry.paths.es))}"/>`,
		...entry.images.map(
			(image) => `<image:image><image:loc>${escape(absolute(image))}</image:loc></image:image>`
		),
		'</url>'
	].join('');

/** Every page of the site in both languages, for search engines. */
export const GET: RequestHandler = () => {
	const urls = entries().flatMap((entry) => LANGS.map((lang) => url(entry, lang)));
	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
		...urls,
		'</urlset>'
	].join('\n');
	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
