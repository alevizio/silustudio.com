import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { buildCatalog } from '../../../tools/catalog-pdf.ts';

const folder = mkdtempSync(path.join(tmpdir(), 'silu-catalog-test-'));

afterAll(() => {
	rmSync(folder, { recursive: true, force: true });
});

/** How many pages a PDF has, read from the page objects it lists. */
const pagesOf = (file: string): number =>
	readFileSync(file, 'latin1').match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;

describe('the PDF catalog (tools/catalog-pdf.ts)', () => {
	it('writes a PDF with a cover, a page for each work and the way to the gallery', async () => {
		const out = path.join(folder, 'catalogo.pdf');
		const count = await buildCatalog({ lang: 'es', out, only: ['guijarro', 'obra-41'] });
		expect(count).toBe(2);
		expect(readFileSync(out, 'latin1').startsWith('%PDF')).toBe(true);
		expect(pagesOf(out)).toBe(4);
	}, 60_000);

	it('leaves out a work that has no full size photo, and writes in English when asked', async () => {
		const out = path.join(folder, 'catalog.pdf');
		// "Duna bañada en peltre" only has the small photos cut from the old catalog.
		const count = await buildCatalog({
			lang: 'en',
			out,
			only: ['duna-banada-en-peltre', 'cause']
		});
		expect(count).toBe(1);
		expect(pagesOf(out)).toBe(3);
	}, 60_000);
});
