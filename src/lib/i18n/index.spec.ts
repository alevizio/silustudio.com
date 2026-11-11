import { describe, expect, it } from 'vitest';
import {
	LANGS,
	PAGES,
	ROUTES,
	alternatePath,
	copyFor,
	langFromPath,
	pageFromPath
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

describe('alternatePath', () => {
	it('links each page to the same page in the other language', () => {
		expect(alternatePath('/')).toBe('/en/');
		expect(alternatePath('/obras/')).toBe('/en/works/');
		expect(alternatePath('/en/studio/')).toBe('/estudio/');
		expect(alternatePath('/en/visit')).toBe('/visitar/');
	});

	it('falls back to the other home page for unknown paths', () => {
		expect(alternatePath('/no-existe/')).toBe('/en/');
		expect(alternatePath('/en/nope/')).toBe('/');
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
