<script lang="ts">
	import { browser } from '$app/env';
	import LinkButton from '#lib/components/link-button.svelte';
	import Seo from '#lib/components/seo.svelte';
	import WorkNeighbours from '#lib/components/work-neighbours.svelte';
	import WorkPhotos from '#lib/components/work-photos.svelte';
	import WorkStatus from '#lib/components/work-status.svelte';
	import { ORDERED_WORKS, photosOf } from '#lib/content/images.ts';
	import { SITE } from '#lib/content/site.ts';
	import { catalogNumber, type Work } from '#lib/content/works.ts';
	import { pageHref } from '#lib/i18n/href.ts';
	import { copyFor, nameOf, workPath, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
		work: Work;
	}

	let { lang, work }: Props = $props();

	const copy = $derived(copyFor(lang).works);
	const name = $derived(nameOf(work, lang));
	const photos = $derived(photosOf(work));
	const position = $derived(ORDERED_WORKS.findIndex((candidate) => candidate.slug === work.slug));
	const previous = $derived(ORDERED_WORKS[position - 1]);
	const next = $derived(ORDERED_WORKS[position + 1]);

	// A work with no title yet is asked about by the address of its page: on the site the
	// visitor is reading, which before launch is a preview. The built page carries the real
	// site's address until the browser takes over.
	const origin = browser ? location.origin : SITE.url;

	// Both ways of asking arrive already saying which work it is.
	const enquiry = $derived.by(() => {
		if (work.title !== undefined) {
			return {
				whatsapp: `text=${encodeURIComponent(copy.detail.whatsappText(work.title))}`,
				mail: `subject=${encodeURIComponent(copy.detail.emailSubject(work.title))}`
			};
		}
		const text = encodeURIComponent(copy.detail.linkText(`${origin}${workPath(lang, work.slug)}`));
		return {
			whatsapp: `text=${text}`,
			mail: `subject=${encodeURIComponent(copy.detail.linkSubject)}&body=${text}`
		};
	});

	const photoAlt = (index: number): string => copy.detail.photoAlt(name, index + 1, photos.length);

	const termClass = 'text-label text-ink-soft uppercase';
	const rowClass = 'flex flex-col gap-1.5 border-b border-line py-4';
</script>

<Seo {lang} page="works" {work} />

<div
	class="mx-auto flex max-w-page items-center justify-between px-gutter pt-4 pb-6 md:pt-8 md:pb-10"
>
	<LinkButton href={pageHref(lang, 'works')} variant="text">
		<span aria-hidden="true" class="pr-3">←</span>{copy.title}
	</LinkButton>
	<p class="text-label text-ink-soft tabular-nums">
		{catalogNumber(position + 1)} / {catalogNumber(ORDERED_WORKS.length)}
	</p>
</div>

<!--
	The photos are the page. On a wide screen they fill two thirds and the label stays in
	view beside them. On a phone the first photo comes first, then the label, then the rest.
-->
<article
	class="mx-auto grid max-w-page gap-x-16 gap-y-10 px-gutter pb-section lg:grid-cols-3 lg:gap-y-6"
>
	<WorkPhotos photos={photos.slice(0, 1)} alt={photoAlt} eager class="lg:col-span-2" />

	<div class="flex flex-col gap-8 lg:sticky lg:top-gutter lg:row-span-2 lg:self-start">
		{#if work.title !== undefined}
			<h1 lang="es" class="font-serif text-display font-light text-balance">{work.title}</h1>
		{:else}
			<div class="flex flex-col gap-3">
				<h1 class={termClass}>{name}</h1>
				<p class="font-serif text-lead text-ink-soft">{copy.detail.pending}</p>
			</div>
		{/if}
		{#if work.dimensions || work.medium || work.status}
			<dl class="border-t border-line">
				{#if work.dimensions}
					<div class={rowClass}>
						<dt class={termClass}>{copy.detail.dimensions}</dt>
						<dd class="font-serif text-lead tabular-nums">{work.dimensions[lang]}</dd>
					</div>
				{/if}
				{#if work.medium}
					<div class={rowClass}>
						<dt class={termClass}>{copy.detail.material}</dt>
						<dd class="font-serif text-lead">{work.medium[lang]}</dd>
					</div>
				{/if}
				{#if work.status}
					<div class={rowClass}>
						<dt class={termClass}>{copy.status.label}</dt>
						<dd><WorkStatus status={work.status} {lang} /></dd>
					</div>
				{/if}
			</dl>
		{/if}
		<div class="flex flex-wrap items-center gap-x-6 gap-y-3">
			<LinkButton href={`${SITE.whatsappUrl}?${enquiry.whatsapp}`} external>
				{copy.detail.enquire}
			</LinkButton>
			<LinkButton href={`mailto:${SITE.email}?${enquiry.mail}`} variant="text">
				{copy.detail.email}
			</LinkButton>
		</div>
	</div>

	{#if photos.length > 1}
		<WorkPhotos
			photos={photos.slice(1)}
			alt={(index) => photoAlt(index + 1)}
			class="lg:col-span-2"
		/>
	{/if}
</article>

<WorkNeighbours {lang} {previous} {next} class="mx-auto max-w-page px-gutter pb-section" />
