import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAGES, ROUTES } from '#lib/i18n/index.ts';
import { SITE } from './site.ts';
import { galleryData, serialise, workData, workTrail } from './structured-data.ts';
import { findWork, type Work } from './works.ts';

const work = (slug: string): Work => {
	const found = findWork(slug);
	if (!found) throw new Error(`No work is called ${slug}`);
	return found;
};

describe('galleryData', () => {
	it('says Silu is an art gallery, with its address and its place on the map', () => {
		const gallery = galleryData('es');
		expect(gallery['@type']).toBe('ArtGallery');
		expect(gallery.name).toBe('Silu');
		expect(gallery.address).toMatchObject({
			streetAddress: 'Ruta 10, km 163.5',
			addressLocality: 'Manantiales',
			addressCountry: 'UY'
		});
		expect(gallery.geo).toMatchObject({ latitude: SITE.geo.lat, longitude: SITE.geo.lng });
		expect(gallery.telephone).toBe('+59895342939');
	});

	it('names the two artists and links to their Instagram', () => {
		const gallery = galleryData('en');
		expect(gallery.founder).toEqual([
			{ '@type': 'Person', name: 'Lucila Dickinson' },
			{ '@type': 'Person', name: 'Silvestre Jacobi' }
		]);
		expect(gallery.sameAs).toEqual([SITE.instagram.url]);
		expect(gallery.url).toBe('https://www.silustudio.com/en/');
	});

	it('claims no opening hours while none are confirmed', () => {
		expect(SITE.hours).toBeNull();
		expect(galleryData('es')).not.toHaveProperty('openingHours');
	});
});

describe('workData', () => {
	it('describes a work as an artwork by the two artists, with its photos, technique and size', () => {
		const artwork = workData(work('guijarro'), 'es');
		expect(artwork).toMatchObject({
			'@type': 'VisualArtwork',
			name: 'Guijarro',
			url: 'https://www.silustudio.com/obras/guijarro/',
			artMedium: 'Madera tallada revestida en arena',
			size: 'Tamaños varios'
		});
		expect(artwork?.creator).toHaveLength(2);
		const images = Array.isArray(artwork?.image) ? artwork.image : [];
		expect(images).toHaveLength(3);
		for (const image of images) {
			// Each is a full address on the site, so it can be fetched from anywhere.
			expect(String(image)).toMatch(/^https:\/\/www\.silustudio\.com\/.+/);
		}
	});

	it('leaves out what a work does not have', () => {
		const artwork = workData(work('mar-de-fondo'), 'en');
		expect(artwork?.name).toBe('Mar de fondo');
		expect(artwork).not.toHaveProperty('artMedium');
		expect(artwork).not.toHaveProperty('size');
	});

	it('says nothing about a work that has no title yet', () => {
		expect(workData(work('obra-41'), 'es')).toBeUndefined();
	});

	it('never says whether a work is for sale, so a sample tag cannot pass for a fact', () => {
		expect(JSON.stringify(workData(work('resplandor-circular'), 'es'))).not.toMatch(
			/offers|availability|sold/i
		);
	});
});

describe('workTrail', () => {
	it('gives the way down to a work: home, the works, the work', () => {
		const trail = workTrail(work('guijarro'), 'Guijarro', 'en');
		expect(trail['@type']).toBe('BreadcrumbList');
		expect(trail.itemListElement).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Silu', item: 'https://www.silustudio.com/en/' },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Works',
				item: 'https://www.silustudio.com/en/works/'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: 'Guijarro',
				item: 'https://www.silustudio.com/en/works/guijarro/'
			}
		]);
	});
});

describe('serialise', () => {
	it('writes the data as JSON that cannot end the script it sits in', () => {
		const text = serialise({ name: '</script><script>alert(1)</script>' });
		expect(text).not.toContain('<');
		expect(JSON.parse(text)).toEqual({ name: '</script><script>alert(1)</script>' });
	});
});

describe('redirects from the old site', () => {
	interface Redirect {
		source: string;
		destination: string;
		permanent: boolean;
	}
	const config: { redirects: Redirect[] } = JSON.parse(readFileSync('vercel.json', 'utf8'));
	const { redirects } = config;
	/** The addresses the Squarespace site had, from its own sitemap. */
	const OLD_ADDRESSES = [
		'/inicio',
		'/inicio-eleccin-idioma',
		'/landing',
		'/english-1',
		'/artistas',
		'/artists',
		'/work',
		'/contacto',
		'/contact'
	];

	it('sends every address of the old site to a page of this one, for good', () => {
		const pages: string[] = PAGES.flatMap((page) => [ROUTES.es[page], ROUTES.en[page]]);
		for (const old of OLD_ADDRESSES) {
			for (const source of [old, `${old}/`]) {
				const redirect = redirects.find((candidate) => candidate.source === source);
				expect(redirect, source).toBeDefined();
				expect(pages, source).toContain(redirect?.destination);
				expect(redirect?.permanent, source).toBe(true);
			}
		}
	});

	it('keeps old Spanish pages in Spanish and old English pages in English', () => {
		const to = (source: string) => redirects.find((r) => r.source === source)?.destination;
		expect(to('/artistas')).toBe('/estudio/');
		expect(to('/artists')).toBe('/en/studio/');
		expect(to('/contacto')).toBe('/visitar/');
		expect(to('/contact')).toBe('/en/visit/');
		expect(to('/work')).toBe('/en/works/');
		expect(to('/english-1')).toBe('/en/');
	});
});
