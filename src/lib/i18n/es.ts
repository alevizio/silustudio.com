/*
 * Spanish copy. The artists' statement and biographies are their own text from the current
 * site, unchanged except for one typo ("Actualmete") and one date: "desde hace quince años"
 * became "desde hace más de dos décadas" (18 Nov 2026, Ale), to agree with Lucila's new text
 * on the home page. Headings, buttons and the short
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
	/** The button on every film that runs by itself. */
	films: {
		pause: 'Pausar el video',
		play: 'Reproducir el video'
	},
	/**
	 * The headings, the small line under the first one, the opening paragraph and the "Catálogo"
	 * link are the artists' own words, as Lucila sent them after going through the page with
	 * Silvestre (23 Nov 2026). Only the "·" between Punta del Este and Uruguay is the site's.
	 */
	home: {
		title: 'Estudio y exposición permanente de la dupla creativa SILU.',
		/** The small line under the headline: where the gallery is. The street is on Visitar. */
		place: 'Punta del Este · Uruguay',
		lead: [
			'Con más de dos décadas de trayectoria, Silvestre Jacobi y Lucila Dickinson —el colectivo artístico SILU— abren las puertas de su estudio-taller para exhibir su obra. Su propuesta nace del “naturalismo abstracto”, una filosofía propia que busca reconectar al ser humano con la naturaleza. A través del encuentro entre lo orgánico y lo creado por el hombre, su arte despierta ese vínculo esencial que permanece latente entre ambos mundos.'
		],
		/** True of both photos the page can open on: the upright one and the horizontal one. */
		heroAlt:
			'Interior de la galería Silu: relieves de arena en las paredes y esculturas en el piso de la sala.',
		gallery: {
			label: 'Galería',
			title: 'Exposición permanente.',
			link: 'Planificar la visita',
			/** The horizontal photos a wide screen shows. */
			alts: {
				console:
					'Sala de la galería: un relieve de bandas y dos piezas circulares en la pared, una consola de piedra junto a una columna y más relieves al fondo.',
				corridor:
					'Pasillo de la galería con relieves a ambos lados y una escultura de piedra a lo largo del piso.',
				roots: 'Esculturas de raíces dentro de marcos de hierro, junto a una consola de piedra.',
				plinths:
					'Relieve azulado en la pared y esculturas de piedra sobre pedestales, con el jardín al fondo.'
			},
			/** The upright photos a phone shows: one for each alta-NN in assets/gallery, in file name order. */
			tallAlts: [
				'Esculturas de piedra en el piso y sobre un pedestal, bajo un relieve de bandas.',
				'Relieves iluminados en la pared y una escultura de piedra en el piso.',
				'Un tronco tallado de pie junto a un relieve blanco de pliegues rectos.',
				'Consola de madera con una pequeña escultura dorada, bajo una pieza circular.',
				'Piedras talladas sobre pedestales, con la sala y el jardín al fondo.',
				'Tres relieves en una pared de la galería: uno plegado, uno vertical y ondulado, y uno rectangular.'
			],
			film: {
				label: 'Película sin sonido: los artistas en el taller y un recorrido por la galería.'
			}
		},
		works: {
			label: 'Obras',
			title: 'Obras esculturales realizadas con materiales naturales.',
			link: 'Catálogo',
			/** One for each photo in assets/spaces, in file name order. */
			spaces: [
				'Relieve claro y plegado en una pared de hormigón, junto a un sillón gris y un ventanal.',
				'Una mujer camina por un pasillo blanco junto a relieves ovalados en la pared.',
				'Relieve de ondas en tres paneles sobre un sofá blanco, en una sala con columnas de troncos.',
				'Escultura blanca en forma de concha en primer plano, delante de un escritorio.',
				'Relieve blanco de anillos sobre un sofá blanco, en una sala luminosa.',
				'Escultura de anillos de acero sobre el pasto, frente a un edificio de techos curvos.',
				'Relieve circular azul sobre un sofá azul, junto a una planta.',
				'Relieve claro y ondulado en la pared, sobre una consola con dos lámparas blancas.',
				'Relieve azul grisáceo sobre un sofá claro, en una pared de madera con luz cálida.',
				'Relieves de formas orgánicas en la pared de un comedor, sobre una mesa con sillas de esterilla.',
				'Relieve claro en un nicho de la pared, junto a un sillón de esterilla.',
				'Relieve vertical de formas curvas junto a una escalera, entre columnas de troncos y plantas.'
			]
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
		homes: {
			title: 'En casas',
			/** One for each photo in assets/homes, in file name order. */
			alts: [
				'Relieve en una pared de hormigón, junto a un sillón.',
				'Obra blanca sobre un sofá, en una sala.',
				'Obra de pared sobre un sofá, en una sala de estar.',
				'Obra circular azul sobre un sofá.',
				'Relieves en la pared de una escalera.',
				'Obra iluminada en la pared de un comedor.',
				'Obra de aros en la pared de un comedor.',
				'Relieve vertical junto a un ventanal.',
				'Relieve sobre un sofá.',
				'Relieve en paneles sobre un sofá.'
			]
		},
		catalog: {
			label: 'Catálogo',
			title: (count: number) => `${count} obras más del catálogo`,
			pdf: 'Descargar el catálogo (PDF)'
		},
		enquiry: {
			title: '¿Te interesa una obra?',
			text: 'Escribinos para consultar por cualquiera de las obras.',
			whatsapp: 'Escribir por WhatsApp',
			email: 'Enviar un correo'
		},
		/** A work with no title yet is called by the number of its folder. */
		reference: (ref: number) => `Obra ${ref}`,
		photoAlt: (name: string, medium?: string) => (medium ? `${name}. ${medium}.` : `${name}.`),
		status: {
			onView: 'En la galería',
			available: 'Disponible',
			reserved: 'Reservada',
			sold: 'Vendida'
		},
		detail: {
			material: 'Material',
			dimensions: 'Medidas',
			enquire: 'Consultar por WhatsApp',
			email: 'Enviar un correo',
			whatsappText: (title: string) => `Hola, quiero consultar por la obra «${title}».`,
			emailSubject: (title: string) => `Consulta por la obra «${title}»`,
			/** For a work with no title yet: the message carries the address of its page instead. */
			linkText: (url: string) => `Hola, quiero consultar por esta obra: ${url}`,
			linkSubject: 'Consulta por una obra',
			pending: 'Consultanos por el título, las medidas y el material de esta obra.',
			navLabel: 'Otras obras',
			pagerLabel: 'Recorrer las obras',
			previous: 'Obra anterior',
			next: 'Obra siguiente',
			before: 'Anterior',
			after: 'Siguiente',
			/** `place` is the work's position and `total` how many there are: "Obra 7 de 84". */
			place: (place: number, total: number) => `Obra ${place} de ${total}`,
			/** Names the row of a work's photos, which a phone swipes through. */
			photos: 'Fotos de la obra',
			photoAlt: (name: string, n: number, total: number) => `${name}, foto ${n} de ${total}.`,
			metaTitle: (name: string) => `${name} · Obras · Silu`,
			/** `facts` are the work's name and, when known, its technique and size. */
			metaDescription: (facts: string[]) =>
				`${facts.join('. ')}. Obra de Silvestre Jacobi y Lucila Dickinson, Silu.`
		}
	},
	studio: {
		label: 'Estudio',
		title: 'Silvestre Jacobi y Lucila Dickinson',
		statement: [
			'Los artistas Silvestre Jacobi y Lucila Dickinson trabajan juntos conformando un colectivo artístico Silu desde hace más de dos décadas.',
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
		},
		film: {
			title: 'Video de los artistas, en Vimeo',
			play: 'Ver el video'
		},
		reels: {
			/** One for each film in workshop-reel.svelte, in the same order. */
			labels: [
				'Video sin sonido: espátula, lija y amoladora sobre una pieza redonda en el taller.',
				'Video sin sonido: mezclando arena, marcando y dando forma a una pieza.',
				'Video sin sonido: del lijado en el taller a la obra colgada en una casa.'
			]
		},
		atWork: {
			title: 'En el taller',
			/** One for each photo named taller-NN in assets/studio, in file name order. */
			alts: [
				'Los dos artistas trabajando en una mesa al aire libre, entre árboles.',
				'Alisando la arena de un relieve sobre la mesa del taller.',
				'Lijando una pieza circular al aire libre.',
				'Con una brocha sobre una pieza curva.',
				'En una escalera, junto a un relieve colgado en la pared.',
				'Dos personas terminando una pieza ovalada en el taller.',
				'Cortando piedra con una amoladora, al aire libre.',
				'Revistiendo una pieza ovalada, en cuclillas.',
				'Soldando una escultura de acero, con máscara.',
				'Los dos artistas conversando sobre una maqueta de papel, apoyados en la mesa del taller.',
				'En cuclillas sobre el piso del taller, tamizando arena.',
				'Soldando un aro de metal, con máscara y entre chispas.',
				'Con máscara y guantes, preparando una mezcla en la mesa del taller.',
				'Los dos artistas sosteniendo una escultura de aros oscuros sobre la mesa del taller.',
				'Sobre una escalera, ajustando una luz junto a un gran relieve de pliegues.',
				'Sentados en el piso del taller, armando una pieza de aros.',
				'El taller: una mesa larga, estantes y baldes, y uno de los artistas trabajando una pieza.',
				'Pintando un gran aro de acero en el patio, con un balde en la mano.',
				'Sobre una escalera, dirigiendo una luz hacia un relieve largo en la pared.',
				'En cuclillas y con máscara, dando forma a una pieza alta y delgada.',
				'Poniéndose las antiparras y la máscara antes de trabajar.',
				'Los dos artistas levantando un panel alto contra la pared del taller.',
				'Los dos artistas de rodillas en el piso, marcando con lápiz una pieza larga.',
				'En cuclillas en el piso del taller, los dos artistas estudian unas piezas curvas oscuras.',
				'Los dos artistas alisando con brocha y espátula la superficie de una pieza.'
			]
		}
	},
	visit: {
		label: 'Visitar',
		title: 'Visitá la galería',
		pageTitle: 'Visitar la galería',
		facadeAlt:
			'Frente de la galería Silu sobre la Ruta 10, con una escultura de acero corten en la entrada.',
		/** The two photos under the front: inside the gallery and behind it. */
		placeAlts: {
			patio:
				'Patio de la galería: un gran relieve de raíces en la pared blanca, un sillón verde, una mesa de madera petrificada y palmeras.',
			garden:
				'La parte de atrás del edificio: el taller en la planta baja, abierto al jardín, entre árboles.'
		},
		address: 'Dirección',
		contact: 'Contacto',
		hours: 'Horario',
		follow: 'Instagram',
		directions: 'Cómo llegar',
		whatsapp: 'Escribir por WhatsApp',
		mapTitle: 'Mapa: ubicación de la galería Silu en Manantiales',
		map: {
			alt: 'Mapa de la costa entre Punta del Este y José Ignacio. La galería Silu está sobre la Ruta 10, en Manantiales, al este de La Barra.',
			sea: 'Océano Atlántico',
			road: 'Ruta 10',
			interactive: 'Ver mapa interactivo',
			credit: 'Mapa dibujado con datos de'
		}
	},
	footer: {
		rights: 'Silu. Todas las obras y fotografías pertenecen a los artistas.'
	}
};
