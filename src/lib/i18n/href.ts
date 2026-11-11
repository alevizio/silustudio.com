import { resolve } from '$app/paths';
import { ROUTES, alternatePath, type Lang, type PageKey } from './index.ts';

type SitePath = (typeof ROUTES)[Lang][PageKey];

/*
 * `resolve()` checks a path against the site's real routes, but only when it is given one
 * literal at a time. Listing every route here keeps that check for links that depend on
 * the language. It takes pathnames without the leading slash.
 */
const RESOLVERS: Record<SitePath, () => string> = {
	'/': () => resolve('/'),
	'/obras/': () => resolve('obras/'),
	'/estudio/': () => resolve('estudio/'),
	'/visitar/': () => resolve('visitar/'),
	'/en/': () => resolve('en/'),
	'/en/works/': () => resolve('en/works/'),
	'/en/studio/': () => resolve('en/studio/'),
	'/en/visit/': () => resolve('en/visit/')
};

/** Link to one of the site's pages in the given language. */
export const pageHref = (lang: Lang, page: PageKey): string => RESOLVERS[ROUTES[lang][page]]();

/** Link to the page being shown, in the other language. */
export const alternateHref = (pathname: string): string => RESOLVERS[alternatePath(pathname)]();
