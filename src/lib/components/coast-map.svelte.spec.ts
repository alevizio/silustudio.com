import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { COAST_MAP } from '#lib/content/coast-map.ts';
import CoastMap from './coast-map.svelte';

describe('coast-map.svelte', () => {
	it('is one picture to a screen reader, described in words', async () => {
		render(CoastMap, { lang: 'es' });
		const map = page.getByRole('img', {
			name: /^Mapa de la costa entre Punta del Este y José Ignacio/
		});
		await expect.element(map).toBeVisible();
		await expect.element(map).toHaveAttribute('aria-label', expect.stringContaining('Ruta 10'));
	});

	it('draws the land, the water, the shore and the roads', async () => {
		const { container } = render(CoastMap, { lang: 'es' });
		const drawing = container.querySelector('svg');
		expect(drawing?.getAttribute('aria-hidden')).toBe('true');
		expect(drawing?.getAttribute('viewBox')).toBe(`0 0 ${COAST_MAP.width} ${COAST_MAP.height}`);
		expect(drawing?.querySelectorAll('path')).toHaveLength(5);
	});

	it('draws the coast road as one line that can be traced from end to end', async () => {
		const { container } = render(CoastMap, { lang: 'es' });
		const road = container.querySelector('path.drawn-line');
		expect(road?.getAttribute('d')).toBe(COAST_MAP.coastRoad);
		expect(road?.getAttribute('pathLength')).toBe('1');
		// One line has one starting point.
		expect(COAST_MAP.coastRoad.match(/M/g)).toHaveLength(1);
	});

	it('names the towns along the coast and the gallery, with its address', async () => {
		const { container } = render(CoastMap, { lang: 'es' });
		for (const name of ['Maldonado', 'La Barra', 'Silu', 'Ruta 10, km 163.5', 'Manantiales']) {
			await expect.element(page.getByText(name, { exact: true })).toBeInTheDocument();
		}
		// Punta del Este and José Ignacio are each written twice: at their dot on a wide screen,
		// and where the road leaves the map on a phone.
		for (const name of ['Punta del Este', 'José Ignacio']) {
			expect(container.textContent?.split(name)).toHaveLength(3);
		}
	});

	it('puts the gallery at the centre of the drawing', async () => {
		const { container } = render(CoastMap, { lang: 'es' });
		const pin = container.querySelector('.map-pin')?.parentElement;
		expect(pin?.style.getPropertyValue('--x')).toBe('0.5');
		expect(pin?.style.getPropertyValue('--y')).toBe('0.5');
	});

	it('gives the scale, and names the sea in the page language', async () => {
		render(CoastMap, { lang: 'es' });
		await expect.element(page.getByText('5 km')).toBeInTheDocument();
		await expect.element(page.getByText('Océano Atlántico')).toBeInTheDocument();
		render(CoastMap, { lang: 'en' });
		await expect.element(page.getByText('Atlantic Ocean')).toBeInTheDocument();
	});

	it('accepts extra classes', async () => {
		const { container } = render(CoastMap, { lang: 'es', class: 'reveal' });
		expect(container.firstElementChild?.classList.contains('reveal')).toBe(true);
	});
});
