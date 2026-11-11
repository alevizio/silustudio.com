import type { Work } from '#lib/content/works.ts';
import { en } from './en';
import { es } from './es';

export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const PAGES = ['home', 'works', 'studio', 'visit'] as const;
export type PageKey = (typeof PAGES)[number];

/** Spanish lives at the root, English under /en/. Every path ends in a slash (see +layout.ts). */
export const ROUTES = {
	es: { home: '/', works: '/obras/', studio: '/estudio/', visit: '/visitar/' },
	en: { home: '/en/', works: '/en/works/', studio: '/en/studio/', visit: '/en/visit/' }
} as const satisfies Record<Lang, Record<PageKey, string>>;

export type Copy = typeof es;

const COPY: Record<Lang, Copy> = { es, en };

export const copyFor = (lang: Lang): Copy => COPY[lang];

export const otherLang = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');

/** What to call a work: its title, or "Obra 41" while the artists have not sent one. */
export const nameOf = (work: Work, lang: Lang): string =>
	work.title !== undefined ? work.title : COPY[lang].works.reference(work.ref);

const withSlash = (pathname: string): string =>
	pathname.endsWith('/') ? pathname : `${pathname}/`;

export const langFromPath = (pathname: string): Lang =>
	withSlash(pathname).startsWith('/en/') ? 'en' : 'es';

/** Which page a path is, or null for anything that is not one of the site's pages. */
export const pageFromPath = (pathname: string): PageKey | null => {
	const path = withSlash(pathname);
	const routes = ROUTES[langFromPath(path)];
	return PAGES.find((key) => routes[key] === path) ?? null;
};

/** Address of a work's own page: /obras/guijarro/ or /en/works/guijarro/. */
export const workPath = (lang: Lang, slug: string): string => `${ROUTES[lang].works}${slug}/`;

const WORK_PATH = /^\/(?:obras|en\/works)\/([a-z0-9-]+)\/$/;

/** The work a path belongs to, or null when the path is not a work's page. */
export const workSlugFromPath = (pathname: string): string | null =>
	WORK_PATH.exec(withSlash(pathname))?.[1] ?? null;
