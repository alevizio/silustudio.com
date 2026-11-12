<script lang="ts">
	import LinkButton from '#lib/components/link-button.svelte';
	import SectionHeading from '#lib/components/section-heading.svelte';
	import Seo from '#lib/components/seo.svelte';
	import WorksWall from '#lib/components/works-wall.svelte';
	import { LISTED_WORKS, PHOTOGRAPHED_WORKS, UNTITLED_PHOTOS } from '#lib/content/images.ts';
	import { SITE } from '#lib/content/site.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
	}

	let { lang }: Props = $props();

	const copy = $derived(copyFor(lang).works);
</script>

<Seo {lang} page="works" />

<header
	class="mx-auto max-w-page px-gutter pt-6 pb-12 motion-safe:animate-arrive md:pt-12 md:pb-16"
>
	<h1 class="font-serif text-display font-light">{copy.title}</h1>
	<p class="max-w-prose pt-4 font-serif text-lead text-ink-soft">{copy.lead}</p>
</header>

<!-- Every work with a full size photo hangs here. The tiles bring their own space below. -->
<WorksWall
	works={PHOTOGRAPHED_WORKS}
	{lang}
	label={copy.title}
	opensPage
	class="mx-auto max-w-page px-gutter pb-10 md:pb-14"
/>

<section aria-labelledby="works-details" class="mx-auto max-w-page px-gutter pb-section">
	<h2 id="works-details" class="reveal pb-6 text-label text-ink-soft uppercase">
		{copy.details.title}
	</h2>
	<div class="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
		{#each UNTITLED_PHOTOS as picture, index (index)}
			<enhanced:img
				src={picture}
				alt={copy.details.alt}
				sizes="(min-width: 768px) 18vw, 46vw"
				loading="lazy"
				class="h-auto w-full reveal bg-plate"
			/>
		{/each}
	</div>
</section>

<section aria-labelledby="works-catalog" class="mx-auto max-w-page px-gutter pb-section">
	<div class="flex reveal flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between">
		<SectionHeading
			id="works-catalog"
			label={copy.catalog.label}
			title={copy.catalog.title(LISTED_WORKS.length)}
		/>
		<LinkButton href={SITE.catalogUrl} external variant="text">{copy.catalog.pdf}</LinkButton>
	</div>
	<!-- The catalog's own photos are small, so these hang three to a row at their real size. -->
	<WorksWall works={LISTED_WORKS} {lang} label={copy.catalog.label} columns={3} />
</section>

<section
	aria-labelledby="works-enquiry"
	class="mx-auto flex max-w-page reveal flex-col items-start gap-6 px-gutter pb-section"
>
	<SectionHeading id="works-enquiry" title={copy.enquiry.title} />
	<p class="max-w-prose font-serif text-lead text-ink-soft">{copy.enquiry.text}</p>
	<div class="flex flex-wrap gap-3">
		<LinkButton href={SITE.whatsappUrl} external>{copy.enquiry.whatsapp}</LinkButton>
		<LinkButton href={`mailto:${SITE.email}`} variant="line">{copy.enquiry.email}</LinkButton>
	</div>
</section>
