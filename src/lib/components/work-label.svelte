<script lang="ts">
	import { browser } from '$app/env';
	import { SITE } from '#lib/content/site.ts';
	import type { Work } from '#lib/content/works.ts';
	import { copyFor, nameOf, workPath, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import LinkButton from './link-button.svelte';
	import WorkStatus from './work-status.svelte';

	interface Props {
		lang: Lang;
		work: Work;
		class?: string;
	}

	let { lang, work, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).works);

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

	const termClass = 'text-label text-ink-soft uppercase';
	const rowClass = 'flex flex-col gap-1.5 border-b border-line py-4';
</script>

<!--
	What a gallery writes beside a work: its tag, title, size and material, and the way to ask
	about it. It is kept slim and quiet, because the photos are the page.
-->
<div class={cn('flex flex-col gap-8', className)}>
	<div class="flex flex-col items-start gap-4">
		{#if work.status}
			<WorkStatus status={work.status} {lang} />
		{/if}
		{#if work.title !== undefined}
			<h1 lang="es" class="font-serif text-title font-light text-balance">{work.title}</h1>
		{:else}
			<h1 class={termClass}>{nameOf(work, lang)}</h1>
			<p class="font-serif text-prose text-ink-soft">{copy.detail.pending}</p>
		{/if}
	</div>
	{#if work.dimensions || work.medium}
		<dl class="border-t border-line">
			{#if work.dimensions}
				<div class={rowClass}>
					<dt class={termClass}>{copy.detail.dimensions}</dt>
					<dd class="font-serif text-prose tabular-nums">{work.dimensions[lang]}</dd>
				</div>
			{/if}
			{#if work.medium}
				<div class={rowClass}>
					<dt class={termClass}>{copy.detail.material}</dt>
					<dd class="font-serif text-prose">{work.medium[lang]}</dd>
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
