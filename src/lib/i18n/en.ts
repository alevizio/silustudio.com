import type { es } from './es';

/*
 * English copy. The statement and biographies are the artists' own English text from the
 * current site with spelling corrected and nothing reworded. Headings, buttons and the
 * short home page lines are new and still need the artists' approval.
 */
export const en: typeof es = {
	meta: {
		home: {
			title: 'Silu · Art gallery and studio in Manantiales, Punta del Este',
			description:
				'Gallery and studio of Silvestre Jacobi and Lucila Dickinson. Reliefs and sculptures in sand, quartz, limestone, wood and mother of pearl. Ruta 10, km 163.5, Manantiales, Uruguay.'
		},
		works: {
			title: 'Works · Silu',
			description:
				'Catalog of works by Silu: reliefs and sculptures by Silvestre Jacobi and Lucila Dickinson, with title, technique and dimensions.'
		},
		studio: {
			title: 'Studio · Silu',
			description:
				'Silvestre Jacobi and Lucila Dickinson work together as Silu. Their creative process emerges from a dialogue with nature at its purest.'
		},
		visit: {
			title: 'Visit the gallery · Silu',
			description:
				'How to get to the Silu gallery: Ruta 10, km 163.5, Manantiales, Punta del Este, Uruguay. Phone, WhatsApp and email.'
		}
	},
	nav: {
		label: 'Main',
		home: 'Silu, home',
		skip: 'Skip to content',
		works: 'Works',
		studio: 'Studio',
		visit: 'Visit',
		language: 'Language',
		languageNames: { es: 'Español', en: 'English' }
	},
	home: {
		eyebrow: 'Silu · Silvestre Jacobi and Lucila Dickinson',
		title: 'Art gallery and studio in Manantiales, Punta del Este.',
		lead: 'Silvestre Jacobi and Lucila Dickinson work together as Silu. Their reliefs and sculptures, made with sand, stone, wood and mother of pearl, are shown in their own gallery.',
		heroAlt:
			'Inside the Silu gallery: sand reliefs on the walls, circular sculptures on the floor and a visitor walking through the room.',
		gallery: {
			label: 'The gallery',
			title: 'The works are shown in their own space, in Manantiales.',
			link: 'Plan your visit',
			alts: {
				plinths: 'Gallery room with sculptures on plinths and a panel made of wood roots.',
				corridor: 'Gallery corridor with reliefs on both sides.',
				long: 'A long view through the gallery: white rings on the floor, a round piece made of roots and reliefs on the walls.',
				garden: 'Gallery room with sculptures on a white platform and a view of the garden.'
			},
			film: {
				label: 'An 88 second film: the artists in the workshop and a walk through the gallery.',
				captions: 'Captions'
			}
		},
		works: {
			label: 'Works',
			title: 'Works in sand, quartz, limestone, wood and mother of pearl.',
			link: 'See all works'
		},
		artists: {
			label: 'The artists',
			title: 'Silvestre Jacobi and Lucila Dickinson',
			link: 'About the studio',
			alt: 'Lucila Dickinson and Silvestre Jacobi working on a piece in their workshop.'
		}
	},
	works: {
		title: 'Works',
		lead: 'Reliefs and sculptures by Silvestre Jacobi and Lucila Dickinson.',
		details: {
			title: 'In the room and up close',
			alt: 'A work by Silu photographed in the gallery.'
		},
		homes: {
			title: 'In homes',
			alts: [
				'A relief on a concrete wall beside a lounge chair.',
				'A white work above a sofa in a living room.',
				'A wall work above a sofa in a living room.',
				'A round blue work above a sofa.',
				'Reliefs on the wall of a staircase.',
				'A lit work on a dining room wall.',
				'A work of rings on a dining room wall.',
				'A vertical relief beside a large window.',
				'A relief above a sofa.',
				'A relief in panels above a sofa.'
			]
		},
		catalog: {
			label: 'Catalog',
			title: (count: number) => `${count} more works from the catalog`,
			pdf: 'See the catalog as a PDF (11 MB)'
		},
		enquiry: {
			title: 'Interested in a work?',
			text: 'Write to us to ask about any of the works.',
			whatsapp: 'Message on WhatsApp',
			email: 'Send an email'
		},
		reference: (ref: number) => `Work ${ref}`,
		photoAlt: (name: string, medium?: string) => (medium ? `${name}. ${medium}.` : `${name}.`),
		status: {
			onView: 'On view at the gallery',
			available: 'Available',
			reserved: 'Reserved',
			sold: 'Sold'
		},
		detail: {
			material: 'Material',
			dimensions: 'Dimensions',
			enquire: 'Ask on WhatsApp',
			email: 'Send an email',
			whatsappText: (title: string) => `Hello, I would like to ask about the work “${title}”.`,
			emailSubject: (title: string) => `Enquiry about the work “${title}”`,
			linkText: (url: string) => `Hello, I would like to ask about this work: ${url}`,
			linkSubject: 'Enquiry about a work',
			pending: 'Ask us for the title, size and material of this work.',
			navLabel: 'Other works',
			pagerLabel: 'Browse the works',
			previous: 'Previous work',
			next: 'Next work',
			before: 'Previous',
			after: 'Next',
			place: (place: number, total: number) => `Work ${place} of ${total}`,
			photoAlt: (name: string, n: number, total: number) => `${name}, photo ${n} of ${total}.`,
			metaTitle: (name: string) => `${name} · Works · Silu`,
			metaDescription: (facts: string[]) =>
				`${facts.join('. ')}. A work by Silvestre Jacobi and Lucila Dickinson, Silu.`
		}
	},
	studio: {
		label: 'Studio',
		title: 'Silvestre Jacobi and Lucila Dickinson',
		statement: [
			'The artists Silvestre Jacobi and Lucila Dickinson have worked together in an artistic union, called SILU, for the last fifteen years.',
			'Their creative process emerges from the subtle dialogue that they maintain with nature at its purest. Their work represents a small fragment of this dialogue, which reaches fulfilment through the encounter with the senses of those who observe them.',
			'The inspiration comes from the language of the macro and microcosmos, portrayed in the fractal growth, the spiral patterns, the elliptical movements, as well as the fluid forms that come from the erosion that the passing of time provides. Such sources of inspiration have accompanied the artists in their search to understand the wisdom of nature and helped them to awaken that fragment of the soul which still maintains a close association with it.',
			'They perform their works with materials which have been directly obtained from their natural surroundings: sand, rocks, petrified wood, mother of pearl and fossils. Such materials convey a deep and significant meaning which transcends the intellect, because at the root of their art there is an act of surrender to that moment of creation when intuition opens the way to discovery.',
			'The volume of the organic forms, as well as the particular textures of their art, make light and shadow acquire a predominant role, which transmit a feeling of peace, calm and harmony, as fragments from the nature the artists so admire.'
		],
		bios: [
			{
				name: 'Lucila Dickinson',
				roles: 'Interior designer, photographer and landscape designer.'
			},
			{ name: 'Silvestre Jacobi', roles: 'Film director, lawyer and plastic artist.' }
		],
		closing: [
			'Together they have learned and experienced different artistic techniques giving them the opportunity to produce and exhibit their art in different countries such as: Costa Rica, Brazil, Argentina, Peru, Canada and Indonesia.',
			'Currently they exhibit their art works in their own art gallery in Punta del Este - Uruguay.'
		],
		alts: {
			portrait: 'Lucila Dickinson and Silvestre Jacobi working on a piece in their workshop.',
			workshop: 'The artists applying sand to a wave shaped piece on the workshop table.',
			drawing: 'The artists drawing a plan and holding a small model of a work.',
			storage: 'Reliefs stored on metal racks.'
		},
		film: {
			title: 'Film of the artists, on Vimeo',
			play: 'Play the film'
		},
		reels: {
			pause: 'Pause the film',
			play: 'Play the film',
			labels: [
				'Silent film: spatula, sandpaper and grinder on a round piece in the workshop.',
				'Silent film: mixing sand, marking and shaping a piece.',
				'Silent film: from sanding in the workshop to the work hung in a home.'
			]
		},
		atWork: {
			title: 'In the workshop',
			alts: [
				'The two artists working at a table outdoors, among trees.',
				'Smoothing the sand of a relief on the workshop table.',
				'Sanding a round piece outdoors.',
				'Brushing a curved piece.',
				'On a ladder beside a relief hung on the wall.',
				'Two people finishing an oval piece in the workshop.',
				'Cutting stone with a grinder outdoors.',
				'Coating an oval piece, crouching beside it.',
				'Welding a steel sculpture, wearing a mask.'
			]
		}
	},
	visit: {
		label: 'Visit',
		title: 'Visit the gallery',
		pageTitle: 'Visit the gallery',
		facadeAlt:
			'Front of the Silu gallery on Ruta 10, with a weathering steel sculpture at the entrance.',
		address: 'Address',
		contact: 'Contact',
		hours: 'Opening hours',
		follow: 'Instagram',
		directions: 'Get directions',
		whatsapp: 'Message on WhatsApp',
		mapTitle: 'Map: location of the Silu gallery in Manantiales',
		map: {
			alt: 'Map of the coast between Punta del Este and José Ignacio. The Silu gallery is on Ruta 10 in Manantiales, east of La Barra.',
			sea: 'Atlantic Ocean',
			road: 'Ruta 10',
			interactive: 'Open the interactive map',
			credit: 'Map drawn with data from'
		}
	},
	footer: {
		rights: 'Silu. All works and photographs belong to the artists.'
	}
};
