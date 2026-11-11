import { error } from '@sveltejs/kit';
import { WORKS, findWork } from '#lib/content/works.ts';
import type { EntryGenerator, PageLoad } from './$types';

// One page per work in the catalog, all written at build time.
export const entries: EntryGenerator = () => WORKS.map(({ slug }) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const work = findWork(params.slug);
	if (!work) error(404, 'Obra no encontrada');
	return { work };
};
