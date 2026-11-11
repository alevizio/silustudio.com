import type { Handle } from '@sveltejs/kit/hooks';
import { langFromPath } from '#lib/i18n/index.ts';

/** Sets `<html lang>` per page so Spanish and English pages are announced correctly. */
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', langFromPath(event.url.pathname))
	});
