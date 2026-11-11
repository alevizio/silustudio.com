import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { WORKS } from '#lib/content/works.ts';
import WorkPlate from './work-plate.svelte';

const SIZES = '100vw';
const guijarro = WORKS[0];
const withoutPhoto = WORKS[1];

describe('work-plate.svelte', () => {
	it('shows the photo with a descriptive alt text and the label under it', async () => {
		render(WorkPlate, { work: guijarro, lang: 'es', sizes: SIZES });
		await expect
			.element(page.getByRole('img', { name: 'Guijarro. Madera tallada revestida en arena.' }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('Guijarro');
	});

	it('describes the photo in English on English pages', async () => {
		render(WorkPlate, { work: guijarro, lang: 'en', sizes: SIZES });
		await expect
			.element(page.getByRole('img', { name: 'Guijarro. Carved wood coated in sand.' }))
			.toBeInTheDocument();
	});

	it('renders nothing for a work that has no photo yet', async () => {
		const { container } = render(WorkPlate, { work: withoutPhoto, lang: 'es', sizes: SIZES });
		expect(container.querySelector('figure')).toBeNull();
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkPlate, {
			work: guijarro,
			lang: 'es',
			sizes: SIZES,
			class: 'md:col-span-3'
		});
		expect(container.querySelector('figure')?.classList.contains('md:col-span-3')).toBe(true);
	});
});
