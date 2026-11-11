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

const otherLang = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');

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

/** The same page in the other language. Unknown paths go to the other language's home. */
export const alternatePath = (pathname: string) => {
	const target = ROUTES[otherLang(langFromPath(pathname))];
	return target[pageFromPath(pathname) ?? 'home'];
};
