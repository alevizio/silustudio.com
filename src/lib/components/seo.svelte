<script lang="ts">
	import { fullSizePhotosOf } from '#lib/content/images.ts';
	import { SITE } from '#lib/content/site.ts';
	import type { Work } from '#lib/content/works.ts';
	import {
		LANGS,
		ROUTES,
		copyFor,
		nameOf,
		workPath,
		type Lang,
		type PageKey
	} from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
		page: PageKey;
		/** When set, the head describes this work's own page instead of `page`. */
		work?: Work;
	}

	let { lang, page, work }: Props = $props();

	const OG_LOCALE: Record<Lang, string> = { es: 'es_UY', en: 'en_US' };
	const DEFAULT_SHARE_IMAGE = '/og.jpg';

	const copy = $derived(copyFor(lang));
	const workMeta = (described: Work) => {
		const name = nameOf(described, lang);
		const facts = [name, described.medium?.[lang], described.dimensions?.[lang]];
		return {
			title: copy.works.detail.metaTitle(name),
			description: copy.works.detail.metaDescription(facts.filter((fact) => fact !== undefined))
		};
	};
	const meta = $derived(work ? workMeta(work) : copy.meta[page]);
	const pathIn = (code: Lang): string => (work ? workPath(code, work.slug) : ROUTES[code][page]);
	const canonical = $derived(`${SITE.url}${pathIn(lang)}`);
	// A work is shared with its own photo once it has a full size one.
	const shareImage = $derived(
		`${SITE.url}${(work && fullSizePhotosOf(work)[0]?.img.src) || DEFAULT_SHARE_IMAGE}`
	);
</script>

<!-- Title, description, share card and the links that tie the Spanish and English pages. -->
<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	{#if !SITE.launched}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
	<link rel="canonical" href={canonical} />
	{#each LANGS as code (code)}
		<link rel="alternate" hreflang={code} href={`${SITE.url}${pathIn(code)}`} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={`${SITE.url}${pathIn('es')}`} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={OG_LOCALE[lang]} />
	<meta property="og:image" content={shareImage} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
