<script lang="ts">
	import { SITE } from '#lib/content/site.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import CoastMap from './coast-map.svelte';
	import { TEXT_LINK } from './link-button.svelte';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	const OSM_COPYRIGHT = 'https://www.openstreetmap.org/copyright';

	let interactive = $state(false);

	const copy = $derived(copyFor(lang).visit);
</script>

<!--
	Where the gallery is. It opens as the site's own drawing of the coast, which loads nothing
	from anyone else. A visitor who wants to move around the map asks for Google's, and it
	takes the drawing's place.
-->
<section aria-label={copy.mapTitle} class={cn('mx-auto max-w-wide', className)}>
	{#if interactive}
		<!-- The button that had the focus is gone, so the focus moves on to the map. -->
		<iframe
			{@attach (map) => map.focus()}
			src={SITE.mapEmbedUrl}
			title={copy.mapTitle}
			referrerpolicy="no-referrer-when-downgrade"
			class="aspect-square w-full bg-plate md:aspect-coast"
		></iframe>
	{:else}
		<CoastMap {lang} class="reveal" />
		<div
			class="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-8 gap-y-2 px-gutter pt-4"
		>
			<button
				type="button"
				onclick={() => (interactive = true)}
				class={cn('inline-flex cursor-pointer items-center text-label uppercase', TEXT_LINK)}
			>
				{copy.map.interactive}
			</button>
			<p class="text-sm text-ink-soft">
				{copy.map.credit}
				<a
					href={OSM_COPYRIGHT}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex min-h-6 items-center underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
				>
					© OpenStreetMap
				</a>
			</p>
		</div>
	{/if}
</section>
