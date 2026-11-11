<script lang="ts">
	import LinkButton from '#lib/components/link-button.svelte';
	import SectionHeading from '#lib/components/section-heading.svelte';
	import Seo from '#lib/components/seo.svelte';
	import WorkPlate from '#lib/components/work-plate.svelte';
	import WorksIndex from '#lib/components/works-index.svelte';
	import { WORK_PHOTOS } from '#lib/content/images.ts';
	import { SITE } from '#lib/content/site.ts';
	import { PHOTOGRAPHED_WORKS, UNTITLED_PHOTOS, WORKS } from '#lib/content/works.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
	}

	let { lang }: Props = $props();

	/** The first plates of the wall are hung larger, two to a row; the rest go three to a row. */
	const LARGE_PLATES = 2;
	const PLATE_SIZES = {
		large: '(min-width: 768px) 46vw, 100vw',
		regular: '(min-width: 768px) 30vw, 100vw'
	};

	const copy = $derived(copyFor(lang).works);
</script>

<Seo {lang} page="works" />

<header class="mx-auto max-w-page px-gutter pt-6 pb-12 md:pt-12 md:pb-16">
	<h1 class="font-serif text-display font-light">{copy.title}</h1>
	<p class="max-w-prose pt-4 font-serif text-lead text-ink-soft">{copy.lead}</p>
</header>

<section aria-label={copy.title} class="mx-auto max-w-page px-gutter pb-section">
	<div class="grid gap-x-6 gap-y-14 md:grid-cols-6">
		{#each PHOTOGRAPHED_WORKS as work, index (work.n)}
			<WorkPlate
				{work}
				{lang}
				sizes={index < LARGE_PLATES ? PLATE_SIZES.large : PLATE_SIZES.regular}
				class={index < LARGE_PLATES ? 'md:col-span-3' : 'md:col-span-2'}
			/>
		{/each}
	</div>
</section>

<section aria-labelledby="works-details" class="mx-auto max-w-page px-gutter pb-section">
	<h2 id="works-details" class="pb-6 text-label text-ink-soft uppercase">{copy.details.title}</h2>
	<div class="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
		{#each UNTITLED_PHOTOS as key (key)}
			{@const picture = WORK_PHOTOS[key]}
			{#if picture}
				<enhanced:img
					src={picture}
					alt={copy.details.alt}
					sizes="(min-width: 768px) 18vw, 46vw"
					loading="lazy"
					class="h-auto w-full bg-plate"
				/>
			{/if}
		{/each}
	</div>
</section>

<section aria-labelledby="works-catalog" class="mx-auto max-w-page px-gutter pb-section">
	<div class="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between">
		<SectionHeading
			id="works-catalog"
			label={copy.catalog.label}
			title={copy.catalog.title(WORKS.length)}
		/>
		<LinkButton href={SITE.catalogUrl} external variant="text">{copy.catalog.pdf}</LinkButton>
	</div>
	<WorksIndex works={WORKS} {lang} />
</section>

<section
	aria-labelledby="works-enquiry"
	class="mx-auto flex max-w-page flex-col items-start gap-6 px-gutter pb-section"
>
	<SectionHeading id="works-enquiry" title={copy.enquiry.title} />
	<p class="max-w-prose font-serif text-lead text-ink-soft">{copy.enquiry.text}</p>
	<div class="flex flex-wrap gap-3">
		<LinkButton href={SITE.whatsappUrl} external>{copy.enquiry.whatsapp}</LinkButton>
		<LinkButton href={`mailto:${SITE.email}`} variant="line">{copy.enquiry.email}</LinkButton>
	</div>
</section>
