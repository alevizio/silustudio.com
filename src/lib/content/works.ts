import type { Lang } from '#lib/i18n/index.ts';

export type Localized = Record<Lang, string>;

export interface Work {
	/** Position in the artists' printed catalog, 1 to 34. */
	n: number;
	/** Anchor id on the works page. */
	slug: string;
	/** Titles are the works' names, so they stay in Spanish in both languages. */
	title: string;
	medium: Localized;
	dimensions: Localized;
	/** File name in assets/works of a full size photo, set only when the match is certain. */
	photo?: string;
}

/*
 * Source: the artists' "Catálogo de obras" PDF, in catalog order. Spanish technique lines
 * follow the catalog, with spelling and capitals normalised. English lines are a working
 * translation that the artists still need to review ("monolítico liviano", "goma" and
 * "madera de Swar" are the uncertain terms).
 */

const RELIEF: Localized = {
	es: 'Relieve con tela punzada endurecida con resina y fibra de vidrio sobre madera',
	en: 'Relief in needle-punched fabric hardened with resin and fibreglass on wood'
};

const METAL: Localized = {
	es: 'Metal y goma endurecido con resina y fibra de vidrio',
	en: 'Metal and rubber hardened with resin and fibreglass'
};

const SUPPORT: Localized = {
	es: 'Soporte de metal y goma endurecido con resina y fibra de vidrio',
	en: 'Metal and rubber support hardened with resin and fibreglass'
};

const LIMESTONE: Localized = {
	es: 'Piedra caliza tallada y pulida',
	en: 'Carved and polished limestone'
};

/** Appends a finish to a base technique: "Relieve…, revestido con arena". */
const finished = (base: Localized, es: string, en: string, separator = ', '): Localized => ({
	es: `${base.es}${separator}${es}`,
	en: `${base.en}, ${en}`
});

/** Width × height × depth in centimetres reads the same in both languages. */
const cm = (...sides: number[]): Localized => {
	const text = `${sides.join(' × ')} cm`;
	return { es: text, en: text };
};

const pieces = (count: number, size: Localized): Localized => ({
	es: `${count} piezas · ${size.es}`,
	en: `${count} pieces · ${size.en}`
});

const round = (diameter: number, depth?: number): Localized => ({
	es: `${diameter} cm de diámetro${depth ? ` × ${depth} cm de profundidad` : ''}`,
	en: `${diameter} cm diameter${depth ? ` × ${depth} cm deep` : ''}`
});

export const WORKS: readonly Work[] = [
	{
		n: 1,
		slug: 'guijarro',
		title: 'Guijarro',
		medium: { es: 'Madera tallada revestida en arena', en: 'Carved wood coated in sand' },
		dimensions: { es: 'Tamaños varios', en: 'Various sizes' },
		photo: 'foto-07'
	},
	{
		n: 2,
		slug: 'salto-al-vacio',
		title: 'Salto al vacío',
		medium: finished(SUPPORT, 'revestido en óxidos y minerales', 'coated in oxides and minerals'),
		dimensions: cm(220, 70, 25)
	},
	{
		n: 3,
		slug: 'impronta-humana',
		title: 'Impronta humana',
		medium: LIMESTONE,
		dimensions: cm(30, 25, 5),
		photo: 'foto-02'
	},
	{
		n: 4,
		slug: 'supraconciencia',
		title: 'Supraconciencia',
		medium: {
			es: 'Estructura de fibra natural de bambú revestido en arena',
			en: 'Natural bamboo fibre structure coated in sand'
		},
		dimensions: round(120, 8)
	},
	{
		n: 5,
		slug: 'rectangulo-inconcluso',
		title: 'Rectángulo inconcluso',
		medium: finished(
			RELIEF,
			'pátina con polvos de óxidos y minerales',
			'with a patina of oxide and mineral powders'
		),
		dimensions: cm(200, 80, 13)
	},
	{
		n: 6,
		slug: 'desde-el-centro-del-ser',
		title: 'Desde el centro del ser',
		medium: finished(
			RELIEF,
			'revestido con monolítico liviano',
			'coated in lightweight monolithic render'
		),
		dimensions: cm(220, 90, 22),
		photo: 'foto-15'
	},
	{
		n: 7,
		slug: 'duna-banada-en-peltre',
		title: 'Duna bañada en peltre',
		medium: finished(
			RELIEF,
			'Revestida con polvo de cuarzo, óxidos y minerales',
			'coated in quartz powder, oxides and minerals',
			'. '
		),
		dimensions: pieces(3, cm(100, 185, 22))
	},
	{
		n: 8,
		slug: 'avance-sostenido',
		title: 'Avance sostenido',
		medium: finished(RELIEF, 'revestido con arena', 'coated in sand'),
		dimensions: pieces(2, cm(225, 90, 18))
	},
	{
		n: 9,
		slug: 'equilibrio-sutil',
		title: 'Equilibrio sutil',
		medium: finished(RELIEF, 'revestido con óxidos y minerales', 'coated in oxides and minerals'),
		dimensions: cm(220, 90, 14)
	},
	{
		n: 10,
		slug: 'expansion-de-un-silencio',
		title: 'Expansión de un silencio',
		medium: finished(
			RELIEF,
			'revestido con texturador, óxidos y minerales',
			'coated in texturing compound, oxides and minerals'
		),
		dimensions: cm(160, 90, 12)
	},
	{
		n: 11,
		slug: 'resplandor-circular',
		title: 'Resplandor circular',
		medium: {
			es: 'Soporte de madera tallada revestida en madre perla blanca',
			en: 'Carved wood support coated in white mother of pearl'
		},
		dimensions: round(100)
	},
	{
		n: 12,
		slug: 'dimensiones-de-un-plano',
		title: 'Dimensiones de un plano',
		medium: finished(
			SUPPORT,
			'revestido en monolítico liviano',
			'coated in lightweight monolithic render'
		),
		dimensions: cm(120, 120, 20)
	},
	{
		n: 13,
		slug: 'reencause',
		title: 'Reencause',
		medium: finished(SUPPORT, 'revestida en arena', 'coated in sand'),
		dimensions: cm(250, 120, 22)
	},
	{
		n: 14,
		slug: 'brotar-desde-adentro',
		title: 'Brotar desde adentro',
		medium: finished(RELIEF, 'revestido con cuarzo molido', 'coated in ground quartz'),
		dimensions: cm(160, 90, 6)
	},
	{
		n: 15,
		slug: 'pliegue-de-un-ovalo',
		title: 'Pliegue de un óvalo',
		medium: finished(METAL, 'revestido con arena', 'coated in sand'),
		dimensions: cm(140, 90, 20)
	},
	{
		n: 16,
		slug: 'imaginarios',
		title: 'Imaginarios',
		medium: { es: 'Madera de Swar tallada y pulida', en: 'Carved and polished suar wood' },
		dimensions: { es: 'Varias medidas', en: 'Various sizes' }
	},
	{
		n: 17,
		slug: 'testigo-de-una-fiel-compania',
		title: 'Testigo de una fiel compañía',
		medium: finished(
			METAL,
			'revestido en monolítico liviano',
			'coated in lightweight monolithic render'
		),
		dimensions: cm(235, 85, 12)
	},
	{
		n: 18,
		slug: 'libre-expresion',
		title: 'Libre expresión',
		medium: finished(RELIEF, 'revestido con arena', 'coated in sand'),
		dimensions: cm(135, 125, 16)
	},
	{
		n: 19,
		slug: 'mismo-origen',
		title: 'Mismo origen',
		medium: finished(METAL, 'revestido en cuarzo molido', 'coated in ground quartz'),
		dimensions: round(100, 9),
		photo: 'foto-12'
	},
	{
		n: 20,
		slug: 'recorrido-infinito',
		title: 'Recorrido infinito',
		medium: finished(METAL, 'pátina de óxidos y minerales', 'with a patina of oxides and minerals'),
		dimensions: cm(140, 130, 21)
	},
	{
		n: 21,
		slug: 'redireccion-de-un-trazo',
		title: 'Redirección de un trazo',
		medium: finished(
			METAL,
			'revestido con monolítico liviano',
			'coated in lightweight monolithic render'
		),
		dimensions: cm(135, 120, 20)
	},
	{
		n: 22,
		slug: 'paso-del-tiempo',
		title: 'Paso del tiempo',
		medium: LIMESTONE,
		dimensions: cm(36, 23, 25)
	},
	{
		n: 23,
		slug: 'infinito',
		title: 'Infinito',
		medium: finished(
			METAL,
			'revestido con polvo de cuarzo y óxidos',
			'coated in quartz powder and oxides'
		),
		dimensions: cm(32, 33, 35)
	},
	{
		n: 24,
		slug: 'refugio-de-un-pliegue',
		title: 'Refugio de un pliegue',
		medium: finished(METAL, 'revestido con arena', 'coated in sand'),
		dimensions: cm(225, 92, 23)
	},
	{
		n: 25,
		slug: 'doble-piel',
		title: 'Doble piel',
		medium: finished(
			RELIEF,
			'revestido con texturador, areniscas con pátina de óxidos y minerales',
			'coated in texturing compound and sandstone with a patina of oxides and minerals'
		),
		dimensions: pieces(2, cm(180, 100, 12))
	},
	{
		n: 26,
		slug: 'tres-trazos',
		title: 'Tres trazos',
		medium: finished(
			METAL,
			'revestido con polvo de cuarzo, óxidos y minerales',
			'coated in quartz powder, oxides and minerals'
		),
		dimensions: cm(150, 120, 18)
	},
	{
		n: 27,
		slug: 'retorno-a-su-origen',
		title: 'Retorno a su origen',
		medium: {
			es: 'Soporte de bambú revestido en polvo de cuarzo',
			en: 'Bamboo support coated in quartz powder'
		},
		dimensions: round(120, 25)
	},
	{
		n: 28,
		slug: 'un-gesto-suave',
		title: 'Un gesto suave',
		medium: finished(
			RELIEF,
			'Pátina con polvo de óxidos y minerales',
			'with a patina of oxide and mineral powder',
			'. '
		),
		dimensions: cm(155, 90, 15)
	},
	{
		n: 29,
		slug: 'dar-es-recibir',
		title: 'Dar es recibir',
		medium: finished(RELIEF, 'revestido con arena', 'coated in sand'),
		dimensions: pieces(2, cm(165, 80, 12)),
		photo: 'foto-14'
	},
	{
		n: 30,
		slug: 'intersecciones',
		title: 'Intersecciones',
		medium: finished(
			METAL,
			'revestido con texturador, óxidos y minerales',
			'coated in texturing compound, oxides and minerals'
		),
		dimensions: cm(220, 122, 25)
	},
	{
		n: 31,
		slug: 'perspectivas',
		title: 'Perspectivas',
		medium: {
			es: 'Soporte de madera tallada, revestido en madre perla blanca',
			en: 'Carved wood support coated in white mother of pearl'
		},
		dimensions: cm(120, 100, 5)
	},
	{
		n: 32,
		slug: 'cause',
		title: 'Cause',
		medium: LIMESTONE,
		dimensions: cm(20, 50, 20)
	},
	{
		n: 33,
		slug: 'equilibrio-silencioso',
		title: 'Equilibrio silencioso',
		medium: finished(RELIEF, 'revestido con polvo de cuarzo', 'coated in quartz powder'),
		dimensions: cm(120, 120, 8)
	},
	{
		n: 34,
		slug: 'simbiosis',
		title: 'Simbiosis',
		medium: finished(RELIEF, 'revestido con arena', 'coated in sand'),
		dimensions: cm(220, 90, 15)
	}
];

/** The catalog number as printed on labels and used for thumbnail files: 7 becomes '07'. */
export const catalogNumber = (n: number): string => String(n).padStart(2, '0');

/** Works that have a full size photo, in catalog order. */
export const PHOTOGRAPHED_WORKS: readonly Work[] = WORKS.filter((work) => work.photo);

/**
 * Photos from the current site that could not be matched to a catalog title with certainty.
 * They are shown without a label until the artists name them.
 */
export const UNTITLED_PHOTOS: readonly string[] = [
	'foto-04',
	'foto-06',
	'foto-08',
	'foto-10',
	'foto-03',
	'foto-01',
	'foto-05',
	'foto-09',
	'foto-11',
	'foto-13'
];
