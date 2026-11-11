<script lang="ts">
	import { SITE } from '#lib/content/site.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import LinkButton from './link-button.svelte';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).visit);
	const termClass = 'text-label text-ink-soft uppercase';
	const valueClass = 'font-serif text-lead';
	const linkClass =
		'decoration-line hover:decoration-ink underline underline-offset-4 transition-colors';
</script>

<!-- Where the gallery is and how to reach the artists. Hours appear once they are provided. -->
<div class={cn('flex flex-col gap-10', className)}>
	<dl class="grid gap-8 sm:grid-cols-2">
		<div class="flex flex-col gap-2">
			<dt class={termClass}>{copy.address}</dt>
			<dd class={valueClass}>
				<address class="not-italic">
					{SITE.address.street}<br />
					{SITE.address.locality}<br />
					{SITE.address.region}<br />
					{SITE.address.country}
				</address>
			</dd>
		</div>
		<div class="flex flex-col gap-2">
			<dt class={termClass}>{copy.contact}</dt>
			<dd class={cn(valueClass, 'flex flex-col')}>
				<a href={SITE.phone.href} class={linkClass}>{SITE.phone.display}</a>
				<a href={`mailto:${SITE.email}`} class={linkClass}>{SITE.email}</a>
			</dd>
		</div>
		{#if SITE.hours}
			<div class="flex flex-col gap-2">
				<dt class={termClass}>{copy.hours}</dt>
				<dd class={valueClass}>{SITE.hours}</dd>
			</div>
		{/if}
		<div class="flex flex-col gap-2">
			<dt class={termClass}>{copy.follow}</dt>
			<dd class={valueClass}>
				<a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" class={linkClass}>
					{SITE.instagram.handle}
				</a>
			</dd>
		</div>
	</dl>
	<div class="flex flex-wrap gap-3">
		<LinkButton href={SITE.directionsUrl} external>{copy.directions}</LinkButton>
		<LinkButton href={SITE.whatsappUrl} external variant="line">{copy.whatsapp}</LinkButton>
	</div>
</div>
