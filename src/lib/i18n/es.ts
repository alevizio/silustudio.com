/*
 * Spanish copy. The artists' statement and biographies are their own text from the current
 * site, unchanged except for one typo ("Actualmete"). Headings, buttons and the short
 * home page lines are new and still need the artists' approval.
 */
export const es = {
	meta: {
		home: {
			title: 'Silu · Galería y estudio de arte en Manantiales, Punta del Este',
			description:
				'Galería y estudio de Silvestre Jacobi y Lucila Dickinson. Relieves y esculturas en arena, cuarzo, piedra caliza, madera y nácar. Ruta 10, km 163.5, Manantiales, Uruguay.'
		},
		works: {
			title: 'Obras · Silu',
			description:
				'Catálogo de obras de Silu: relieves y esculturas de Silvestre Jacobi y Lucila Dickinson, con título, técnica y medidas.'
		},
		studio: {
			title: 'Estudio · Silu',
			description:
				'Silvestre Jacobi y Lucila Dickinson trabajan juntos como Silu. Su proceso creativo surge del diálogo con la naturaleza en su estado puro.'
		},
		visit: {
			title: 'Visitar la galería · Silu',
			description:
				'Cómo llegar a la galería Silu: Ruta 10, km 163.5, Manantiales, Punta del Este, Uruguay. Teléfono, WhatsApp y correo.'
		}
	},
	nav: {
		label: 'Principal',
		home: 'Silu, inicio',
		skip: 'Saltar al contenido',
		works: 'Obras',
		studio: 'Estudio',
		visit: 'Visitar',
		language: 'Idioma',
		languageNames: { es: 'Español', en: 'English' }
	},
	home: {
		eyebrow: 'Estudio de arte y galería',
		title: 'Galería y estudio de arte en Manantiales, Punta del Este.',
		lead: 'Silvestre Jacobi y Lucila Dickinson trabajan juntos como Silu. Sus relieves y esculturas, hechos con arenas, piedras, maderas y nácares, se exhiben en su propia galería.',
		heroAlt:
			'Interior de la galería Silu: relieves de arena en las paredes, esculturas circulares en el piso y una visitante recorriendo la sala.',
		gallery: {
			label: 'La galería',
			title: 'Las obras se ven en su propia sala, en Manantiales.',
			link: 'Planificar la visita',
			alts: {
				plinths:
					'Sala de la galería con esculturas sobre pedestales y un panel de raíces de madera.',
				corridor: 'Pasillo de la galería con relieves a ambos lados.',
				garden: 'Sala de la galería con esculturas sobre una tarima blanca y vista al jardín.'
			},
			film: {
				label: 'Película de 88 segundos: los artistas en el taller y un recorrido por la galería.',
				captions: 'Subtítulos'
			}
		},
		works: {
			label: 'Obras',
			title: (count: number) => `${count} obras en arena, cuarzo, piedra caliza, madera y nácar.`,
			link: 'Ver todas las obras'
		},
		artists: {
			label: 'Los artistas',
			title: 'Silvestre Jacobi y Lucila Dickinson',
			link: 'Conocer el estudio',
			alt: 'Lucila Dickinson y Silvestre Jacobi trabajando en una pieza en su taller.'
		}
	},
	works: {
		title: 'Obras',
		lead: 'Relieves y esculturas de Silvestre Jacobi y Lucila Dickinson.',
		details: {
			title: 'En sala y en detalle',
			alt: 'Obra de Silu fotografiada en la galería.'
		},
		catalog: {
			label: 'Catálogo',
			title: (count: number) => `Las ${count} obras del catálogo`,
			pdf: 'Ver el catálogo en PDF'
		},
		enquiry: {
			title: '¿Te interesa una obra?',
			text: 'Escribinos para consultar por cualquiera de las obras.',
			whatsapp: 'Escribir por WhatsApp',
			email: 'Enviar un correo'
		},
		photoAlt: (title: string, medium: string) => `${title}. ${medium}.`
	},
	studio: {
		label: 'Estudio',
		title: 'Silvestre Jacobi y Lucila Dickinson',
		statement: [
			'Los artistas Silvestre Jacobi y Lucila Dickinson trabajan juntos conformando un colectivo artístico Silu desde hace quince años.',
			'Su proceso creativo surge del sutil diálogo que tienen con la naturaleza en su estado puro. Sus obras son un pequeño fragmento de este diálogo, que alcanza su plenitud en el encuentro con los sentidos de quienes se detienen a observarlas.',
			'Una inspiración basada en el lenguaje del macro y microcosmos, como el crecimiento fractal, los patrones en espiral, el movimiento elíptico y las formas fluidas de la erosión que produce el paso del tiempo, los ha acompañado en su incansable búsqueda por comprender parte de su sabiduría y los ha ayudado a hacer despertar ese fragmento del ser que aún sigue completamente vinculado con la naturaleza.',
			'Realizan sus obras con materiales directamente recolectados de su natural entorno: como arenas, piedras, maderas petrificadas, nácares y fósiles. Ellas logran transmitir un significado profundo que trasciende el intelecto, porque en la raíz de su arte existe un acto de entrega absoluta a ese instante creador, dado que ese es el momento en que la intuición les abre el camino hacia un constante descubrir.',
			'El volumen de las formas orgánicas y las particulares texturas de sus obras hacen que la luz y la sombra adquieran un rol principal, lo que transmite una sensación de paz, calma y armonía, como fragmentos extraídos de la misma naturaleza que ellos tanto admiran.'
		],
		bios: [
			{ name: 'Lucila Dickinson', roles: 'Diseñadora de interiores, fotógrafa y paisajista.' },
			{ name: 'Silvestre Jacobi', roles: 'Director de cine, abogado y artista plástico.' }
		],
		closing: [
			'Juntos han aprendido y experimentado varias técnicas artísticas dándoles la oportunidad de producir y exponer su arte en varios países como: Costa Rica, Brasil, Argentina, Perú, Canadá e Indonesia.',
			'Actualmente exhiben sus obras en su propia galería de arte ubicada en Punta del Este - Uruguay.'
		],
		alts: {
			portrait: 'Lucila Dickinson y Silvestre Jacobi trabajando en una pieza en su taller.',
			workshop: 'Los artistas aplicando arena sobre una pieza ondulada en la mesa del taller.',
			drawing: 'Los artistas dibujando un plano y sosteniendo una maqueta de una obra.',
			storage: 'Relieves guardados en estantes metálicos.'
		}
	},
	visit: {
		label: 'Visitar',
		title: 'Visitá la galería',
		pageTitle: 'Visitar la galería',
		facadeAlt:
			'Frente de la galería Silu sobre la Ruta 10, con una escultura de acero corten en la entrada.',
		address: 'Dirección',
		contact: 'Contacto',
		hours: 'Horario',
		follow: 'Instagram',
		directions: 'Cómo llegar',
		whatsapp: 'Escribir por WhatsApp',
		mapTitle: 'Mapa: ubicación de la galería Silu en Manantiales'
	},
	footer: {
		rights: 'Silu. Todas las obras y fotografías pertenecen a los artistas.'
	}
};
