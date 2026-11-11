import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
	{ path: '/', lang: 'es', h1: 'Galería y estudio de arte en Manantiales, Punta del Este.' },
	{ path: '/obras/', lang: 'es', h1: 'Obras' },
	{ path: '/estudio/', lang: 'es', h1: 'Silvestre Jacobi y Lucila Dickinson' },
	{ path: '/visitar/', lang: 'es', h1: 'Visitar la galería' },
	{ path: '/en/', lang: 'en', h1: 'Art gallery and studio in Manantiales, Punta del Este.' },
	{ path: '/en/works/', lang: 'en', h1: 'Works' },
	{ path: '/en/studio/', lang: 'en', h1: 'Silvestre Jacobi and Lucila Dickinson' },
	{ path: '/en/visit/', lang: 'en', h1: 'Visit the gallery' },
	// Work pages: one with a full size photo, one with catalog photos only, one in English.
	{ path: '/obras/guijarro/', lang: 'es', h1: 'Guijarro' },
	{ path: '/obras/duna-banada-en-peltre/', lang: 'es', h1: 'Duna bañada en peltre' },
	{ path: '/en/works/infinito/', lang: 'en', h1: 'Infinito' }
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const PHONE = { width: 390, height: 844 };
const CATALOG_SIZE = 34;

// The map is a third-party page. The tests never call it: they get an empty document instead.
test.beforeEach(async ({ page }) => {
	await page.route(/google\.com\/maps/, (route) =>
		route.fulfill({
			contentType: 'text/html',
			body: '<!doctype html><html lang="en"><head><title>Map</title></head><body><main><h1>Map</h1></main></body></html>'
		})
	);
});

for (const { path, lang, h1 } of PAGES) {
	test.describe(`page ${path}`, () => {
		test('has one main heading, a title and the right language', async ({ page }) => {
			await page.goto(path);
			await expect(page.locator('html')).toHaveAttribute('lang', lang);
			await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
			await expect(page).toHaveTitle(/Silu/);
		});

		test('has no accessibility violations', async ({ page }) => {
			await page.goto(path);
			const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
			expect(results.violations).toEqual([]);
		});

		test('fits a phone screen without sideways scrolling', async ({ page }) => {
			await page.setViewportSize(PHONE);
			await page.goto(path);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - window.innerWidth
			);
			expect(overflow).toBeLessThanOrEqual(0);
		});
	});
}

test('the header takes a visitor to the works and then to the visit page', async ({ page }) => {
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Principal' });
	await nav.getByRole('link', { name: 'Obras' }).click();
	await expect(page).toHaveURL(/\/obras\/$/);
	await expect(nav.getByRole('link', { name: 'Obras' })).toHaveAttribute('aria-current', 'page');
	await nav.getByRole('link', { name: 'Visitar' }).click();
	await expect(page).toHaveURL(/\/visitar\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Visitar la galería');
});

test('the language switch keeps the visitor on the same page', async ({ page }) => {
	await page.goto('/obras/');
	await page.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL(/\/en\/works\/$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await page.getByRole('link', { name: 'Español' }).click();
	await expect(page).toHaveURL(/\/obras\/$/);
});

test('the works page lists the whole catalog and each work can be linked to', async ({ page }) => {
	await page.goto('/obras/#simbiosis');
	await expect(page.locator('main ol').getByRole('listitem')).toHaveCount(CATALOG_SIZE);
	await expect(page.locator('#simbiosis')).toBeInViewport();
});

test('a visitor opens a work from the list, moves to the next one and comes back', async ({
	page
}) => {
	await page.goto('/obras/');
	await page.locator('main ol').getByRole('link', { name: 'Duna bañada en peltre' }).click();
	await expect(page).toHaveURL(/\/obras\/duna-banada-en-peltre\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Duna bañada en peltre');
	await expect(page.getByText('07 / 34')).toBeVisible();
	await page
		.getByRole('navigation', { name: 'Otras obras' })
		.getByRole('link', { name: 'Avance sostenido' })
		.click();
	await expect(page).toHaveURL(/\/obras\/avance-sostenido\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Avance sostenido');
	await page.getByRole('main').getByRole('link', { name: 'Obras' }).click();
	await expect(page).toHaveURL(/\/obras\/$/);
});

test('every work in the list has its own page', async ({ page }) => {
	await page.goto('/obras/');
	const hrefs = await page
		.locator('main ol a')
		.evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
	expect(hrefs).toHaveLength(CATALOG_SIZE);
	for (const href of hrefs) {
		const response = await page.request.get(href);
		expect(response.status(), href).toBe(200);
	}
});

test('the language switch stays on the same work', async ({ page }) => {
	await page.goto('/obras/guijarro/');
	await page.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL(/\/en\/works\/guijarro\/$/);
	await expect(page.getByText('Carved wood coated in sand')).toBeVisible();
});

test('choosing another photo of a work shows it large', async ({ page }) => {
	await page.goto('/en/works/infinito/');
	await expect(page.getByRole('img', { name: 'Infinito, photo 1 of 3.' })).toBeVisible();
	await page.getByRole('button', { name: 'Show photo 2' }).click();
	await expect(page.getByRole('img', { name: 'Infinito, photo 2 of 3.' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Show photo 2' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
});

test('no work shows a status until one is confirmed', async ({ page }) => {
	await page.goto('/obras/');
	await expect(page.getByText(/^(Disponible|Reservada|Vendida)$/)).toHaveCount(0);
});

test('every page except Visit ends with the invitation to visit', async ({ page }) => {
	await page.goto('/estudio/');
	await expect(page.getByRole('region', { name: 'Visitá la galería' })).toBeVisible();
	await page.goto('/visitar/');
	await expect(page.getByRole('region', { name: 'Visitá la galería' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Cómo llegar' })).toHaveCount(1);
});

test('the skip link is the first stop for keyboard users', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	const skip = page.getByRole('link', { name: 'Saltar al contenido' });
	await expect(skip).toBeFocused();
	await expect(skip).toHaveAttribute('href', '#contenido');
});

test('no page asks for a file that does not exist', async ({ page }) => {
	const failed: string[] = [];
	page.on('response', (response) => {
		if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
	});
	for (const { path } of PAGES) {
		await page.goto(path, { waitUntil: 'networkidle' });
	}
	expect(failed).toEqual([]);
});
