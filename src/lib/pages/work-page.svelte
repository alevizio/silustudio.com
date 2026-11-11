<script lang="ts">
	import LinkButton from '#lib/components/link-button.svelte';
	import Seo from '#lib/components/seo.svelte';
	import WorkGallery from '#lib/components/work-gallery.svelte';
	import WorkStatus from '#lib/components/work-status.svelte';
	import { photosOf } from '#lib/content/images.ts';
	import { SITE } from '#lib/content/site.ts';
	import { WORKS, catalogNumber, type Work } from '#lib/content/works.ts';
	import { pageHref, workHref } from '#lib/i18n/href.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
		work: Work;
	}

	let { lang, work }: Props = $props();

	const copy = $derived(copyFor(lang).works);
	const position = $derived(WORKS.findIndex((candidate) => candidate.n === work.n));
	const previous = $derived(WORKS[position - 1]);
	const next = $derived(WORKS[position + 1]);

	// Both ways of asking arrive already naming the work.
	const whatsapp = $derived(
		`${SITE.whatsappUrl}?text=${encodeURIComponent(copy.detail.whatsappText(work.title))}`
	);
	const mail = $derived(
		`mailto:${SITE.email}?subject=${encodeURIComponent(copy.detail.emailSubject(work.title))}`
	);

	const termClass = 'text-label text-ink-soft uppercase';
	const rowClass = 'flex flex-col gap-1.5 border-b border-line py-4';
	const neighbourClass =
		'inline-flex min-h-11 items-center gap-3 text-label text-ink uppercase decoration-line underline-offset-8 hover:underline';
</script>

<Seo {lang} page="works" {work} />

<div
	class="mx-auto flex max-w-page items-center justify-between px-gutter pt-4 pb-6 md:pt-8 md:pb-10"
>
	<LinkButton href={pageHref(lang, 'works')} variant="text">
		<span aria-hidden="true" class="pr-3">←</span>{copy.title}
	</LinkButton>
	<p class="text-label text-ink-soft tabular-nums">
		{catalogNumber(work.n)} / {catalogNumber(WORKS.length)}
	</p>
</div>

<article class="mx-auto grid max-w-page gap-10 px-gutter pb-section lg:grid-cols-12 lg:gap-x-16">
	<!-- A new gallery per work, so moving to the next work starts again at its first photo. -->
	{#key work.slug}
		<WorkGallery
			photos={photosOf(work)}
			alt={(n, total) => copy.detail.photoAlt(work.title, n, total)}
			showLabel={copy.detail.showPhoto}
			label={copy.detail.photos}
			class="lg:col-span-7"
		/>
	{/key}

	<div class="flex flex-col gap-8 lg:col-span-5">
		<div class="flex flex-col gap-3">
			<p class="text-label text-ink-soft tabular-nums">{catalogNumber(work.n)}</p>
			<h1 lang="es" class="font-serif text-display font-light text-balance">{work.title}</h1>
		</div>
		<dl class="border-t border-line">
			<div class={rowClass}>
				<dt class={termClass}>{copy.detail.dimensions}</dt>
				<dd class="font-serif text-lead tabular-nums">{work.dimensions[lang]}</dd>
			</div>
			<div class={rowClass}>
				<dt class={termClass}>{copy.detail.material}</dt>
				<dd class="font-serif text-lead">{work.medium[lang]}</dd>
			</div>
			{#if work.status}
				<div class={rowClass}>
					<dt class={termClass}>{copy.status.label}</dt>
					<dd><WorkStatus status={work.status} {lang} /></dd>
				</div>
			{/if}
		</dl>
		<div class="flex flex-wrap items-center gap-x-6 gap-y-3">
			<LinkButton href={whatsapp} external>{copy.detail.enquire}</LinkButton>
			<LinkButton href={mail} variant="text">{copy.detail.email}</LinkButton>
		</div>
	</div>
</article>

<nav aria-label={copy.detail.navLabel} class="mx-auto max-w-page px-gutter pb-section">
	<div class="flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:justify-between">
		{#if previous}
			<a href={workHref(lang, previous.slug)} rel="prev" class={neighbourClass}>
				<span aria-hidden="true">←</span><span lang="es">{previous.title}</span>
			</a>
		{/if}
		{#if next}
			<a href={workHref(lang, next.slug)} rel="next" class={[neighbourClass, 'sm:ml-auto']}>
				<span lang="es">{next.title}</span><span aria-hidden="true">→</span>
			</a>
		{/if}
	</div>
</nav>
