import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { changes, parseCsv, worksFromSheet, writeWorks } from '../../../tools/sync-works.ts';
import { SHEET_ROWS, type SheetRow } from './works.sheet.ts';

const HEADINGS = [
	'Código',
	'Título',
	'Técnica',
	'Technique (inglés)',
	'Medidas',
	'Estado',
	'En la web',
	'En el PDF'
];
const row = (code: string, title: string, rest: string[] = ['', '', '', '', 'Sí', 'Sí']) => [
	code,
	title,
	...rest
];
const folder = mkdtempSync(path.join(tmpdir(), 'silu-sync-test-'));

afterAll(() => {
	rmSync(folder, { recursive: true, force: true });
});

describe('parseCsv', () => {
	it('reads rows of cells, also with commas, quotes and line breaks inside a cell', () => {
		const text = 'Código,Título\r\nguijarro,"Relieve, con ""comillas"""\nobra-41,"dos\nlíneas"\n';
		expect(parseCsv(text)).toEqual([
			['Código', 'Título'],
			['guijarro', 'Relieve, con "comillas"'],
			['obra-41', 'dos\nlíneas']
		]);
	});

	it('reads a last row that does not end in a line break', () => {
		expect(parseCsv('a,b\nc,d')).toEqual([
			['a', 'b'],
			['c', 'd']
		]);
	});
});

describe('worksFromSheet', () => {
	it('turns each row into a work, in the order of the sheet', () => {
		const works = worksFromSheet([
			HEADINGS,
			row('mar-de-fondo', 'Mar de fondo', [
				'Arena',
				'Sand',
				'220 × 90 × 10 cm',
				'Vendida',
				'Sí',
				'No'
			]),
			row('obra-41', '')
		]);
		expect(works).toEqual([
			{
				code: 'mar-de-fondo',
				title: 'Mar de fondo',
				medium: 'Arena',
				mediumEn: 'Sand',
				dimensions: '220 × 90 × 10 cm',
				status: 'Vendida',
				onSite: true,
				inPdf: false
			},
			{
				code: 'obra-41',
				title: '',
				medium: '',
				mediumEn: '',
				dimensions: '',
				status: '',
				onSite: true,
				inPdf: true
			}
		]);
	});

	it('finds its columns by their headings, wherever they are, and ignores the private ones', () => {
		const works = worksFromSheet([
			['Precio (privado)', ...HEADINGS.toReversed()],
			['9000', 'Sí', 'Sí', '', '', '', '', 'Guijarro', 'guijarro']
		]);
		expect(works).toHaveLength(1);
		expect(works[0]).toMatchObject({ code: 'guijarro', title: 'Guijarro' });
		expect(JSON.stringify(works)).not.toContain('9000');
	});

	it('skips empty rows, and rows made ready for new works with only empty tick boxes', () => {
		const works = worksFromSheet([
			HEADINGS,
			row('guijarro', 'Guijarro'),
			['', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', 'FALSE', 'FALSE']
		]);
		expect(works).toHaveLength(1);
	});

	it('reads the tick boxes of the sheet, in English and in Spanish', () => {
		const works = worksFromSheet([
			HEADINGS,
			row('guijarro', 'Guijarro', ['', '', '', '', 'TRUE', 'FALSE']),
			row('cause', 'Cause', ['', '', '', '', 'VERDADERO', 'FALSO']),
			row('pables', 'Pables', ['', '', '', '', 'FALSE', 'TRUE'])
		]);
		expect(works.map((work) => [work.onSite, work.inPdf])).toEqual([
			[true, false],
			[true, false],
			[false, true]
		]);
	});

	it('refuses the whole sheet when a row cannot be used, and says which row and why', () => {
		const broken = [
			HEADINGS,
			row('Mar de Fondo', 'Mar de fondo'),
			row('guijarro', 'Guijarro'),
			row('guijarro', 'Otra vez'),
			row('sin-titulo', ''),
			row('cause', 'Cause', ['', '', '', 'Prestada', 'Sí', 'Sí']),
			row('pables', 'Pables', ['', '', '', '', 'Quizás', 'Sí'])
		];
		let message = '';
		try {
			worksFromSheet(broken);
		} catch (error) {
			message = error instanceof Error ? error.message : '';
		}
		expect(message).toContain('Row 2: the code "Mar de Fondo"');
		expect(message).toContain('Row 4: the code "guijarro" is used twice');
		expect(message).toContain('Row 5 (sin-titulo): a work with no title needs a code like obra-41');
		expect(message).toContain('Row 6 (cause): "Prestada" is not one of the tags');
		expect(message).toContain('Row 7 (pables): "En la web" must be a tick box, ticked or not');
	});

	it('refuses a sheet that lost one of its columns, or has no works', () => {
		expect(() => worksFromSheet([HEADINGS.slice(1), ['Guijarro']])).toThrow(
			'no column called "Código"'
		);
		expect(() => worksFromSheet([HEADINGS])).toThrow('The sheet has no works.');
	});
});

describe('changes', () => {
	const work = (code: string, title = ''): SheetRow => ({
		code,
		title,
		medium: '',
		mediumEn: '',
		dimensions: '',
		status: '',
		onSite: true,
		inPdf: true
	});

	it('says what is new, what changed and what is gone', () => {
		const before = [work('guijarro', 'Guijarro'), work('obra-41'), work('cause', 'Cause')];
		const after = [
			work('guijarro', 'Guijarro'),
			work('obra-41', 'Mar adentro'),
			work('nueva', 'Nueva')
		];
		expect(changes(before, after)).toEqual([
			'Changed: obra-41',
			'New: nueva (Nueva)',
			'Gone from the sheet: cause'
		]);
	});

	it('says nothing when nothing changed', () => {
		expect(changes(SHEET_ROWS, [...SHEET_ROWS])).toEqual([]);
	});
});

describe('writeWorks', () => {
	it('writes the rows as the file the site reads, and writing them again changes nothing', async () => {
		const file = path.join(folder, 'works.sheet.ts');
		await writeWorks([...SHEET_ROWS], file);
		// The file in the repository is exactly what the command writes from its own rows.
		expect(readFileSync(file, 'utf8')).toBe(readFileSync('src/lib/content/works.sheet.ts', 'utf8'));
	});
});
