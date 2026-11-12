import type { Lang } from '#lib/i18n/index.ts';
import { SITE } from './site.ts';
import { SHEET_ROWS, type SheetRow } from './works.sheet.ts';

export type Localized = Record<Lang, string>;

/** `onView` is a work that hangs in the gallery today. The others say whether it can be bought. */
export type WorkStatus = 'onView' | 'available' | 'reserved' | 'sold';

interface WorkBase {
	/** Last part of the work's address, and the name of its photo folder in assets/works. */
	slug: string;
	medium?: Localized;
	dimensions?: Localized;
	/** Left out until the artists confirm it. A work with no status shows none. */
	status?: WorkStatus;
}

export interface TitledWork extends WorkBase {
	/** Titles are the works' names, so they stay in Spanish in both languages. */
	title: string;
	ref?: never;
}

/** A photographed work the artists have not sent a title for yet. */
export interface UntitledWork extends WorkBase {
	title?: never;
	/** What the work is called until it has a title. It is the number in its code: obra-41 is 41. */
	ref: number;
}

export type Work = TitledWork | UntitledWork;

/** A work from the artists' PDF catalog, which gives its number, technique and size. */
export interface CatalogWork extends TitledWork {
	/** Position in the catalog, 1 to 34. */
	n: number;
	medium: Localized;
	dimensions: Localized;
}

/*
 * Every fact about a work comes from the Google Sheet "Silu Obras", through works.sheet.ts
 * (`npm run sync`). This file only gives those rows the shape the pages use.
 *
 * Where the sheet's first contents came from, for whoever checks them with the artists:
 * - The 34 works below are the artists' "Catálogo de obras" PDF. Their Spanish technique
 *   lines follow it, with spelling and capitals normalised. The English lines are a working
 *   translation still to be reviewed ("monolítico liviano", "goma" and "madera de Swar" are
 *   the uncertain terms).
 * - Mar de fondo, Pables, Encuentro en un reflejo and Ser antiguo (díptico) take their titles
 *   from a designer's proposal of November 2026 that followed the artists' stock folder.
 * - Opuestos en tensión and Azul profundo were identified on the artists' Instagram: a post
 *   shows the very same work and gives its title, technique and size.
 * - The works coded obra-NN have photos and no title yet. NN is the number of their photo
 *   set in that proposal.
 */

/**
 * The works of the PDF catalog, by code, in the catalog's order. A work's place here is its
 * catalog number, which is also how its small catalog photos are named (assets/catalog).
 */
const CATALOG_ORDER = [
	'guijarro',
	'salto-al-vacio',
	'impronta-humana',
	'supraconciencia',
	'rectangulo-inconcluso',
	'desde-el-centro-del-ser',
	'duna-banada-en-peltre',
	'avance-sostenido',
	'equilibrio-sutil',
	'expansion-de-un-silencio',
	'resplandor-circular',
	'dimensiones-de-un-plano',
	'reencause',
	'brotar-desde-adentro',
	'pliegue-de-un-ovalo',
	'imaginarios',
	'testigo-de-una-fiel-compania',
	'libre-expresion',
	'mismo-origen',
	'recorrido-infinito',
	'redireccion-de-un-trazo',
	'paso-del-tiempo',
	'infinito',
	'refugio-de-un-pliegue',
	'doble-piel',
	'tres-trazos',
	'retorno-a-su-origen',
	'un-gesto-suave',
	'dar-es-recibir',
	'intersecciones',
	'perspectivas',
	'cause',
	'equilibrio-silencioso',
	'simbiosis'
];

/** The sheet's words for each tag. */
const STATUSES: Readonly<Record<string, WorkStatus>> = {
	'En la galería': 'onView',
	Vendida: 'sold',
	Reservada: 'reserved',
	Disponible: 'available'
};

const UNTITLED_CODE = /^obra-(\d+)$/;

export const catalogNumber = (n: number): string => String(n).padStart(2, '0');

/**
 * The sheet gives a size once, in Spanish. This says the same in English: the figures stay,
 * and the few words around them are swapped.
 */
export const dimensionsInEnglish = (spanish: string): string =>
	spanish
		.replace(/^(Tamaños varios|Varias medidas)$/, 'Various sizes')
		.replace(/\bpiezas\b/g, 'pieces')
		.replace(/\bpieza\b/g, 'piece')
		.replace(/cm de diámetro/g, 'cm diameter')
		.replace(/cm de profundidad/g, 'cm deep');

/*
 * SAMPLES, NOT FACTS. Ale asked to see how the tags look, so these works carry a made-up
 * status while the site is a preview. Nothing here is true of the real works, and none of it
 * can reach the public site: the list is empty the moment SITE.launched is true.
 * When the artists confirm the real ones, they go in the sheet's "Estado" column, and this
 * list can be deleted.
 */
export const SAMPLE_STATUSES: Readonly<Record<string, WorkStatus>> = SITE.launched
	? {}
	: {
			guijarro: 'onView',
			'impronta-humana': 'sold',
			supraconciencia: 'onView',
			'resplandor-circular': 'sold',
			reencause: 'onView'
		};

/** A row of the sheet as a work. A tag from the sheet always wins over a sample one. */
const workFrom = (row: SheetRow): Work => {
	const status = STATUSES[row.status] ?? SAMPLE_STATUSES[row.code];
	const facts = {
		slug: row.code,
		...(row.medium && { medium: { es: row.medium, en: row.mediumEn || row.medium } }),
		...(row.dimensions && {
			dimensions: { es: row.dimensions, en: dimensionsInEnglish(row.dimensions) }
		}),
		...(status && { status })
	};
	if (row.title) return { ...facts, title: row.title };
	// The sync command only lets a row go without a title when its code is obra-NN.
	return { ...facts, ref: Number(UNTITLED_CODE.exec(row.code)?.[1] ?? 0) };
};

/** A work with everything the catalog gives: a title, a technique and a size. */
type CompleteWork = TitledWork & { medium: Localized; dimensions: Localized };

const isComplete = (work: Work): work is CompleteWork =>
	work.title !== undefined && work.medium !== undefined && work.dimensions !== undefined;

const shown = SHEET_ROWS.filter((row) => row.onSite).map(workFrom);

/** The works of the PDF catalog that the sheet still shows, in the catalog's order. */
export const CATALOG_WORKS: readonly CatalogWork[] = CATALOG_ORDER.flatMap((code, index) => {
	const work = shown.find((candidate) => candidate.slug === code);
	return work && isComplete(work) ? [{ ...work, n: index + 1 }] : [];
});

/** Every work on the site: the catalog first, then the others in the sheet's order. */
export const WORKS: readonly Work[] = [
	...CATALOG_WORKS,
	...shown.filter((work) => !CATALOG_ORDER.includes(work.slug))
];

/** The codes of the works that go in the PDF catalog. */
export const PDF_WORKS: ReadonlySet<string> = new Set(
	SHEET_ROWS.filter((row) => row.inPdf).map((row) => row.code)
);

/** The work with this slug, if there is one. */
export const findWork = (slug: string): Work | undefined =>
	WORKS.find((work) => work.slug === slug);
