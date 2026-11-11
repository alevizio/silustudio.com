import type { Picture } from 'vite-imagetools';

type PictureModule = { default: Picture };

const byName = (modules: Record<string, PictureModule>): Record<string, Picture> =>
	Object.fromEntries(
		Object.entries(modules).map(([path, module]) => {
			const file = path.slice(path.lastIndexOf('/') + 1);
			return [file.slice(0, file.lastIndexOf('.')), module.default];
		})
	);

/** One small photo per catalog work, cropped from the artists' PDF. Keys are catalog numbers, '01' to '34'. */
export const CATALOG_THUMBS = byName(
	import.meta.glob<PictureModule>('/src/lib/assets/catalog/*.jpg', {
		eager: true,
		query: { enhanced: true }
	})
);

/** The fifteen full size work photos from the current site. Keys are 'foto-01' to 'foto-15'. */
export const WORK_PHOTOS = byName(
	import.meta.glob<PictureModule>('/src/lib/assets/works/*.png', {
		eager: true,
		query: { enhanced: true, w: '1485;1080;720;480' }
	})
);
