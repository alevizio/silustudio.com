import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LinkButton from './link-button.svelte';

const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('link-button.svelte', () => {
	it('renders a link with its label and destination', async () => {
		render(LinkButton, { href: '/obras/', children: label('Ver todas las obras') });
		const link = page.getByRole('link', { name: 'Ver todas las obras' });
		await expect.element(link).toHaveAttribute('href', '/obras/');
		await expect.element(link).not.toHaveAttribute('target');
	});

	it('opens external links in a new tab without leaking the opener', async () => {
		render(LinkButton, {
			href: 'https://wa.me/59895342939',
			external: true,
			children: label('Escribir por WhatsApp')
		});
		const link = page.getByRole('link', { name: 'Escribir por WhatsApp' });
		await expect.element(link).toHaveAttribute('target', '_blank');
		await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('renders secondary links as underlined text instead of a button', async () => {
		render(LinkButton, {
			href: '/visitar/',
			variant: 'text',
			children: label('Planificar la visita')
		});
		const link = page.getByRole('link', { name: 'Planificar la visita' });
		await expect.element(link).toHaveClass(/underline/);
		await expect.element(link).not.toHaveClass(/border/);
	});

	it('accepts a variant and extra classes', async () => {
		render(LinkButton, { href: '/', variant: 'line', class: 'w-full', children: label('Inicio') });
		const link = page.getByRole('link', { name: 'Inicio' });
		await expect.element(link).toHaveClass(/w-full/);
		await expect.element(link).toHaveClass(/border-ink/);
	});
});
