import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { AT_WORK_PHOTOS } from '#lib/content/images.ts';
import HungPair from './hung-pair.svelte';

const [first, second] = AT_WORK_PHOTOS;
const props = {
	large: { picture: first, alt: 'Foto grande' },
	small: { picture: second, alt: 'Foto chica' },
	text: 'Su proceso creativo surge del diálogo con la naturaleza.'
};

describe('hung-pair.svelte', () => {
	it('shows both photos with their descriptions and the text that goes with them', async () => {
		render(HungPair, props);
		await expect.element(page.getByRole('img', { name: 'Foto grande' })).toBeInTheDocument();
		await expect.element(page.getByRole('img', { name: 'Foto chica' })).toBeInTheDocument();
		await expect.element(page.getByText(props.text)).toBeInTheDocument();
	});

	it('reads in one order on every screen: the large photo, the text, the small photo', async () => {
		const { container } = render(HungPair, props);
		const order = [...container.querySelectorAll('img, p')].map(
			(element) => element.getAttribute('alt') ?? element.textContent?.trim()
		);
		expect(order).toEqual(['Foto grande', props.text, 'Foto chica']);
	});

	it('gives the large photo most of the row, on the left unless flipped', async () => {
		const left = render(HungPair, props).container.querySelector('img');
		expect(left?.classList.contains('lg:col-span-7')).toBe(true);
		expect(left?.classList.contains('lg:order-2')).toBe(false);
		const right = render(HungPair, { ...props, flipped: true }).container.querySelector('img');
		expect(right?.classList.contains('lg:col-span-8')).toBe(true);
		expect(right?.classList.contains('lg:order-2')).toBe(true);
	});

	it('never crops a photo', async () => {
		const { container } = render(HungPair, props);
		for (const photo of container.querySelectorAll('img')) {
			expect(photo.classList.contains('h-auto')).toBe(true);
			expect(photo.className).not.toMatch(/object-cover/);
		}
	});

	it('accepts extra classes', async () => {
		const { container } = render(HungPair, { ...props, class: 'pb-section' });
		expect(container.firstElementChild?.classList.contains('pb-section')).toBe(true);
	});
});
