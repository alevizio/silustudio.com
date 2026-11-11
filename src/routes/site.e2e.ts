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
	// Work pages: one with full size photos, one with catalog photos only, one with no title
	// yet, one in English.
	{ path: '/obras/guijarro/', lang: 'es', h1: 'Guijarro' },
	{ path: '/obras/duna-banada-en-peltre/', lang: 'es', h1: 'Duna bañada en peltre' },
	{ path: '/obras/obra-41/', lang: 'es', h1: 'Obra 41' },
	{ path: '/en/works/infinito/', lang: 'en', h1: 'Infinito' }
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const PHONE = { width: 390, height: 844 };
/** Every work on the site: the 34 of the catalog and the 50 photographed works not in it. */
const WORKS = 84;
const WALL = 'main ul[aria-label="Obras"]';
const LIST = 'main ol';

// The map and the film are third-party pages. The tests never call them: they get an empty
// document instead.
test.beforeEach(async ({ page }) => {
	await page.route(/google\.com\/maps|player\.vimeo\.com/, (route) =>
		route.fulfill({
			contentType: 'text/html',
			body: '<!doctype html><html lang="en"><head><title>Embed</title></head><body><main><h1>Embed</h1></main></body></html>'
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

test('the works page shows every work once, on the wall or in the list', async ({ page }) => {
	await page.goto('/obras/#simbiosis');
	const onWall = await page.locator(`${WALL} > li`).count();
	const inList = await page.locator(`${LIST} > li`).count();
	expect(onWall).toBeGreaterThan(inList);
	expect(onWall + inList).toBe(WORKS);
	await expect(page.locator('#simbiosis')).toBeInViewport();
});

test('the wall hangs two works to a row on a wide screen, on one baseline', async ({ page }) => {
	await page.goto('/obras/');
	const boxes = await page
		.locator(`${WALL} > li img`)
		.evaluateAll((images) => images.slice(0, 2).map((image) => image.getBoundingClientRect()));
	const [left, right] = boxes;
	expect(right.left).toBeGreaterThan(left.right);
	expect(Math.abs(left.bottom - right.bottom)).toBeLessThanOrEqual(1);
});

test('a visitor opens a work from the wall and reads its label beside the photos', async ({
	page
}) => {
	await page.goto('/obras/');
	await page.locator(WALL).getByRole('link', { name: 'Guijarro' }).click();
	await expect(page).toHaveURL(/\/obras\/guijarro\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Guijarro');
	await expect(page.getByText('Madera tallada revestida en arena')).toBeVisible();
	// The label stays in view while the photos scroll past.
	await page.getByRole('img', { name: 'Guijarro, foto 3 de 3.' }).scrollIntoViewIfNeeded();
	await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
});

test('a visitor opens a work from the list, moves to the next one and comes back', async ({
	page
}) => {
	await page.goto('/obras/');
	await page.locator(LIST).getByRole('link', { name: 'Duna bañada en peltre' }).click();
	await expect(page).toHaveURL(/\/obras\/duna-banada-en-peltre\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Duna bañada en peltre');
	await expect(page.getByText(new RegExp(`^\\d{2} / ${WORKS}$`))).toBeVisible();
	await page.getByRole('navigation', { name: 'Otras obras' }).locator('a[rel="next"]').click();
	await expect(page).not.toHaveURL(/duna-banada-en-peltre/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await page.getByRole('main').getByRole('link', { name: 'Obras' }).click();
	await expect(page).toHaveURL(/\/obras\/$/);
});

test('every work on the works page has its own page', async ({ page }) => {
	await page.goto('/obras/');
	const hrefs = await page
		.locator(`${WALL} a, ${LIST} a`)
		.evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
	expect(hrefs).toHaveLength(WORKS);
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

test('a work page shows every photo of the work', async ({ page }) => {
	await page.goto('/en/works/infinito/');
	for (const n of [1, 2, 3]) {
		await expect(page.getByRole('img', { name: `Infinito, photo ${n} of 3.` })).toBeVisible();
	}
});

test('a small catalog photo is never stretched past its own size', async ({ page }) => {
	await page.goto('/obras/duna-banada-en-peltre/');
	const sizes = await page.locator('article img').evaluateAll((images) =>
		images.map((image) => ({
			shown: image.getBoundingClientRect().width,
			real: Number(image.getAttribute('width'))
		}))
	);
	expect(sizes.length).toBeGreaterThan(0);
	for (const { shown, real } of sizes) expect(shown).toBeLessThanOrEqual(real);
});

test('a work with no title yet is asked about by the address of its page', async ({ page }) => {
	await page.goto('/obras/obra-41/');
	const address = encodeURIComponent(`${new URL(page.url()).origin}/obras/obra-41/`);
	await expect(page.getByRole('link', { name: 'Consultar por WhatsApp' })).toHaveAttribute(
		'href',
		new RegExp(address.replace(/[.]/g, '\\.'))
	);
});

test('the artists film loads from Vimeo only when the visitor presses play', async ({ page }) => {
	const calls: string[] = [];
	page.on('request', (request) => {
		if (request.url().includes('vimeo.com')) calls.push(request.url());
	});
	await page.goto('/estudio/', { waitUntil: 'networkidle' });
	expect(calls).toEqual([]);
	await page.getByRole('button', { name: 'Ver el video' }).click();
	await expect(page.locator('iframe[title="Video de los artistas, en Vimeo"]')).toHaveAttribute(
		'src',
		/player\.vimeo\.com\/video\/\d+\?.*dnt=1/
	);
	await expect.poll(() => calls.length).toBeGreaterThan(0);
});

test('the home page opens on a photo that runs edge to edge', async ({ page }) => {
	await page.goto('/');
	const photo = page.getByRole('img', { name: /Interior de la galería Silu/ });
	const box = await photo.boundingBox();
	const viewport = page.viewportSize();
	expect(box?.x).toBe(0);
	expect(box?.width).toBe(viewport?.width);
	await expect(page.getByRole('link', { name: 'Cómo llegar' }).first()).toBeInViewport();
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
