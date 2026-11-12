import { describe, expect, it } from 'vitest';
import { LANGS, copyFor } from '#lib/i18n/index.ts';
import { AT_WORK_PHOTOS, IN_HOMES_PHOTOS } from './images.ts';

describe('the photo sets from the artists', () => {
	it('has the artists at work and works in homes', () => {
		expect(AT_WORK_PHOTOS.length).toBeGreaterThan(0);
		expect(IN_HOMES_PHOTOS.length).toBeGreaterThan(0);
	});

	it('describes every photo, in both languages, so none is shown without words', () => {
		for (const lang of LANGS) {
			const copy = copyFor(lang);
			expect(copy.studio.atWork.alts, lang).toHaveLength(AT_WORK_PHOTOS.length);
			expect(copy.works.homes.alts, lang).toHaveLength(IN_HOMES_PHOTOS.length);
			for (const alt of [...copy.studio.atWork.alts, ...copy.works.homes.alts]) {
				expect(alt.length, alt).toBeGreaterThan(10);
			}
		}
	});
});
