<script lang="ts">
	import { SITE } from '#lib/content/site.ts';
	import { LANGS, ROUTES, copyFor, type Lang, type PageKey } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
		page: PageKey;
	}

	let { lang, page }: Props = $props();

	const OG_LOCALE: Record<Lang, string> = { es: 'es_UY', en: 'en_US' };
	const SHARE_IMAGE = `${SITE.url}/og.jpg`;

	const meta = $derived(copyFor(lang).meta[page]);
	const canonical = $derived(`${SITE.url}${ROUTES[lang][page]}`);
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
		<link rel="alternate" hreflang={code} href={`${SITE.url}${ROUTES[code][page]}`} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={`${SITE.url}${ROUTES.es[page]}`} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={OG_LOCALE[lang]} />
	<meta property="og:image" content={SHARE_IMAGE} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
