import { describe, expect, it } from 'vitest';
import {
	LANGS,
	PAGES,
	ROUTES,
	copyFor,
	langFromPath,
	nameOf,
	pageFromPath,
	workPath,
	workSlugFromPath
} from './index.ts';

describe('langFromPath', () => {
	it('reads Spanish at the root and English under /en/', () => {
		expect(langFromPath('/')).toBe('es');
		expect(langFromPath('/obras/')).toBe('es');
		expect(langFromPath('/en/')).toBe('en');
		expect(langFromPath('/en/works/')).toBe('en');
	});

	it('accepts paths without the trailing slash', () => {
		expect(langFromPath('/en')).toBe('en');
		expect(langFromPath('/estudio')).toBe('es');
	});

	it('does not mistake a Spanish path that starts with "en" for English', () => {
		expect(langFromPath('/entrada/')).toBe('es');
	});
});

describe('pageFromPath', () => {
	it('names every route in both languages', () => {
		for (const lang of LANGS) {
			for (const page of PAGES) {
				expect(pageFromPath(ROUTES[lang][page])).toBe(page);
			}
		}
	});

	it('returns null for a path that is not a page', () => {
		expect(pageFromPath('/no-existe/')).toBeNull();
	});
});

describe('work pages', () => {
	it('builds the address of a work in each language', () => {
		expect(workPath('es', 'guijarro')).toBe('/obras/guijarro/');
		expect(workPath('en', 'guijarro')).toBe('/en/works/guijarro/');
	});

	it('reads the work back from either address', () => {
		expect(workSlugFromPath('/obras/duna-banada-en-peltre/')).toBe('duna-banada-en-peltre');
		expect(workSlugFromPath('/en/works/guijarro')).toBe('guijarro');
	});

	it('does not mistake the list or other pages for a work', () => {
		expect(workSlugFromPath('/obras/')).toBeNull();
		expect(workSlugFromPath('/en/works/')).toBeNull();
		expect(workSlugFromPath('/estudio/')).toBeNull();
		expect(pageFromPath('/obras/guijarro/')).toBeNull();
	});
});

describe('copy', () => {
	it('has a title and description for every page in both languages', () => {
		for (const lang of LANGS) {
			for (const page of PAGES) {
				const meta = copyFor(lang).meta[page];
				expect(meta.title.length).toBeGreaterThan(0);
				expect(meta.description.length).toBeGreaterThan(0);
			}
		}
	});

	it('keeps the same number of statement paragraphs in both languages', () => {
		expect(copyFor('en').studio.statement).toHaveLength(copyFor('es').studio.statement.length);
		expect(copyFor('en').studio.closing).toHaveLength(copyFor('es').studio.closing.length);
	});
});

describe('nameOf', () => {
	it('calls a work by its title, in Spanish in both languages', () => {
		expect(nameOf({ slug: 'guijarro', title: 'Guijarro' }, 'es')).toBe('Guijarro');
		expect(nameOf({ slug: 'guijarro', title: 'Guijarro' }, 'en')).toBe('Guijarro');
	});

	it('calls a work with no title yet by the number of its folder', () => {
		expect(nameOf({ slug: 'obra-41', ref: 41 }, 'es')).toBe('Obra 41');
		expect(nameOf({ slug: 'obra-41', ref: 41 }, 'en')).toBe('Work 41');
	});
});
