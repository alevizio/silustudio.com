/**
 * Facts about the gallery. Everything here comes from the live site or the artists'
 * catalog (November 2026). Opening hours are not published anywhere yet, so `hours`
 * stays null and the pages leave that line out until the artists provide them.
 */
const GEO = { lat: -34.9051398, lng: -54.8278289 } as const;
const WHATSAPP_NUMBER = '59895342939';
const MAP_ZOOM = 12;
const HOURS: string | null = null;
/** The gallery's own address on the web, and the address the preview of the redesign is at. */
const LIVE_URL = 'https://www.silustudio.com';
const PREVIEW_URL = 'https://silustudio.vercel.app';
const LAUNCHED: boolean = false;

export const SITE = {
	name: 'Silu',
	/**
	 * False while the redesign is a preview. Every page then tells search engines not to index
	 * it, so the preview never competes with the live site. Set to true on launch day.
	 */
	launched: LAUNCHED,
	url: LIVE_URL,
	/**
	 * Where these pages can be opened today. What a shared link shows (its picture above all) is
	 * built on this address: built on `url` before launch day, the picture would be looked for
	 * on the old site, which does not have it.
	 */
	servedFrom: LAUNCHED ? LIVE_URL : PREVIEW_URL,
	address: {
		street: 'Ruta 10, km 163.5',
		locality: 'Manantiales',
		region: 'Punta del Este',
		country: 'Uruguay'
	},
	/** Where the gallery is, for maps and for what the pages tell search engines. */
	geo: GEO,
	phone: { display: '+598 95 342 939', href: `tel:+${WHATSAPP_NUMBER}` },
	whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
	email: 'info@silustudio.com',
	instagram: { handle: '@silu.studio', url: 'https://www.instagram.com/silu.studio/' },
	directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${GEO.lat},${GEO.lng}`,
	mapEmbedUrl: `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${GEO.lat},${GEO.lng}!6i${MAP_ZOOM}`,
	/** The artists' own film, "SILU Artistas Loop", which their current site also embeds. */
	filmUrl: 'https://player.vimeo.com/video/338790525',
	hours: HOURS
} as const;
