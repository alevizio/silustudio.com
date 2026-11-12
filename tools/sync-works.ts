/*
 * Brings the works from the Google Sheet "Silu Obras" into the site.
 *
 *   npm run sync                       reads the sheet's published tab "Para la web" (hidden)
 *   npm run sync -- --from file.csv    reads a CSV file instead (the same columns)
 *
 * It rewrites src/lib/content/works.sheet.ts, which is all the site knows about the works,
 * and says what changed. Nothing is published by it: look at the site, run the tests, deploy.
 * A row that cannot be used stops the whole run, so a slip in the sheet never reaches the site.
 *
 * The photos are not in the sheet. They live in src/lib/assets/works/<código>/, and the
 * command says which works have none.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { format, resolveConfig } from 'prettier';
import { SHEET_URL } from '../src/lib/content/sheet-source.ts';
import type { SheetRow } from '../src/lib/content/works.sheet.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'src/lib/content/works.sheet.ts');
const PHOTOS = path.join(ROOT, 'src/lib/assets/works');

/** The columns the command reads, by their heading in the sheet. Others are ignored. */
const COLUMNS = {
	code: 'Código',
	title: 'Título',
	medium: 'Técnica',
	mediumEn: 'Technique (inglés)',
	dimensions: 'Medidas',
	status: 'Estado',
	onSite: 'En la web',
	inPdf: 'En el PDF'
} as const;

const STATUSES = ['', 'En la galería', 'Vendida', 'Reservada', 'Disponible'];
/**
 * What a tick box says in the published sheet, in English and in Spanish, and the words the
 * first version of the sheet used.
 */
const TICKED = ['TRUE', 'VERDADERO', 'Sí'];
const UNTICKED = ['FALSE', 'FALSO', 'No'];
/** What a code may be: lower case words joined by hyphens, as in an address. */
const CODE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const UNTITLED = /^obra-\d+$/;

/** Reads CSV text into rows of cells. Handles quoted cells, with commas and line breaks inside. */
export const parseCsv = (text: string): string[][] => {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (quoted) {
			if (char === '"' && text[i + 1] === '"') {
				cell += '"';
				i++;
			} else if (char === '"') quoted = false;
			else cell += char;
		} else if (char === '"') quoted = true;
		else if (char === ',') {
			row.push(cell);
			cell = '';
		} else if (char === '\n' || char === '\r') {
			if (char === '\r' && text[i + 1] === '\n') i++;
			row.push(cell);
			rows.push(row);
			row = [];
			cell = '';
		} else cell += char;
	}
	if (cell !== '' || row.length > 0) rows.push([...row, cell]);
	return rows;
};

/**
 * Turns the sheet's rows into the works the site shows. Throws one error that lists every
 * problem found, each with the number of its row in the sheet.
 */
export const worksFromSheet = (table: string[][]): SheetRow[] => {
	const [headings = [], ...lines] = table;
	const problems: string[] = [];
	const column = Object.fromEntries(
		Object.entries(COLUMNS).map(([key, heading]) => {
			const index = headings.findIndex((cell) => cell.trim() === heading);
			if (index < 0) problems.push(`The sheet has no column called "${heading}".`);
			return [key, index];
		})
	);
	if (problems.length > 0) throw new Error(problems.join('\n'));

	const works: SheetRow[] = [];
	const seen = new Set<string>();
	for (const [index, line] of lines.entries()) {
		const at = `Row ${index + 2}`;
		const cell = (key: keyof typeof COLUMNS): string => (line[column[key]] ?? '').trim();
		const code = cell('code');
		// An empty row is not a work, and neither is one that only has boxes nobody ticked.
		if (line.every((value) => value.trim() === '' || UNTICKED.includes(value.trim()))) continue;
		if (!CODE.test(code)) {
			problems.push(`${at}: the code "${code}" must be lower case words joined by hyphens.`);
			continue;
		}
		if (seen.has(code)) problems.push(`${at}: the code "${code}" is used twice.`);
		seen.add(code);
		if (cell('title') === '' && !UNTITLED.test(code)) {
			problems.push(`${at} (${code}): a work with no title needs a code like obra-41.`);
		}
		if (!STATUSES.includes(cell('status'))) {
			problems.push(`${at} (${code}): "${cell('status')}" is not one of the tags.`);
		}
		for (const key of ['onSite', 'inPdf'] as const) {
			if (!TICKED.includes(cell(key)) && !UNTICKED.includes(cell(key))) {
				problems.push(`${at} (${code}): "${COLUMNS[key]}" must be a tick box, ticked or not.`);
			}
		}
		works.push({
			code,
			title: cell('title'),
			medium: cell('medium'),
			mediumEn: cell('mediumEn'),
			dimensions: cell('dimensions'),
			status: cell('status'),
			onSite: TICKED.includes(cell('onSite')),
			inPdf: TICKED.includes(cell('inPdf'))
		});
	}
	if (works.length === 0) problems.push('The sheet has no works.');
	if (problems.length > 0) throw new Error(problems.join('\n'));
	return works;
};

const HEADER = `/*
 * The works, as the Google Sheet "Silu Obras" has them: one row each, in the sheet's order.
 *
 * GENERATED by \`npm run sync\`. Do not edit by hand: change the sheet and run the command.
 * works.ts turns these rows into what the pages use.
 */
export interface SheetRow {
	/** The work's code: the last part of its address and the name of its photo folder. */
	code: string;
	/** Empty for a work that has no title yet. */
	title: string;
	medium: string;
	mediumEn: string;
	/** In Spanish. works.ts says the same in English. */
	dimensions: string;
	/** The tag, in the sheet's own words, or empty. */
	status: string;
	/** Whether the work is shown on the site, and in the PDF catalog. */
	onSite: boolean;
	inPdf: boolean;
}

export const SHEET_ROWS: readonly SheetRow[] = `;

/** Writes the rows to the file the site reads, in the project's own code style. */
export const writeWorks = async (works: SheetRow[], file = OUTPUT): Promise<void> => {
	const source = `${HEADER}${JSON.stringify(works, null, '\t')};\n`;
	// Always in this project's style, wherever the file is written.
	const style = await resolveConfig(OUTPUT);
	writeFileSync(file, await format(source, { ...style, filepath: file }));
};

const hasPhotos = (code: string): boolean => {
	const folder = path.join(PHOTOS, code);
	return (
		existsSync(folder) && readdirSync(folder).some((name) => /\.(jpe?g|png|webp)$/i.test(name))
	);
};

/** What the run changed, in words, against the rows the site had before. */
export const changes = (before: readonly SheetRow[], after: readonly SheetRow[]): string[] => {
	const old = new Map(before.map((work) => [work.code, work]));
	const now = new Set(after.map((work) => work.code));
	const lines: string[] = [];
	for (const work of after) {
		const was = old.get(work.code);
		if (!was) lines.push(`New: ${work.code}${work.title ? ` (${work.title})` : ''}`);
		else if (JSON.stringify(was) !== JSON.stringify(work)) lines.push(`Changed: ${work.code}`);
	}
	for (const work of before)
		if (!now.has(work.code)) lines.push(`Gone from the sheet: ${work.code}`);
	return lines;
};

if (import.meta.main) {
	const { values } = parseArgs({ options: { from: { type: 'string' } } });
	if (!values.from && !SHEET_URL) {
		console.error(
			'The sheet is not connected yet: put the address of its published tab in src/lib/content/sheet-source.ts, or pass --from file.csv.'
		);
		process.exit(1);
	}
	const text = values.from
		? readFileSync(values.from, 'utf8')
		: await (await fetch(SHEET_URL)).text();
	const { SHEET_ROWS: before } = await import('../src/lib/content/works.sheet.ts');
	try {
		const works = worksFromSheet(parseCsv(text));
		await writeWorks(works);
		const changed = changes(before, works);
		console.log(`${works.length} works read from the sheet.`);
		console.log(changed.length > 0 ? changed.join('\n') : 'Nothing changed.');
		const bare = works
			.filter((work) => work.onSite && !hasPhotos(work.code))
			.map((work) => work.code);
		if (bare.length > 0)
			console.log(`With no full size photos in assets/works yet: ${bare.join(', ')}`);
	} catch (error) {
		console.error(
			`The sheet could not be used:\n${error instanceof Error ? error.message : error}`
		);
		process.exit(1);
	}
}
