<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { catalogNumber, type Work } from '#lib/content/works.ts';
	import { workHref } from '#lib/i18n/href.ts';
	import { copyFor, nameOf, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import ArrowIcon from './arrow-icon.svelte';

	interface Props {
		lang: Lang;
		/** Where the work stands among the works, counting from 1. */
		place: number;
		total: number;
		/** The works before and after. Each is missing at its end of the order. */
		previous?: Work;
		next?: Work;
		class?: string;
	}

	let { lang, place, total, previous, next, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).works.detail);

	let pager: HTMLElement | undefined = $state();

	// A new page takes the focus away. When the visitor pressed one of these arrows with the
	// keyboard, the focus comes back to that arrow on the next work, so it can be pressed again.
	onNavigate(() => {
		const pressed = document.activeElement;
		if (!(pressed instanceof HTMLAnchorElement) || !pager?.contains(pressed)) return;
		const { rel } = pressed;
		return () => {
			pager?.querySelector<HTMLAnchorElement>(`a[rel="${rel}"]`)?.focus({ preventScroll: true });
		};
	});

	const ARROW =
		'group relative isolate inline-flex size-11 items-center justify-center overflow-hidden rounded-full border';
	/* An arrow fills with ink from the side it comes from, and its tip moves on a little. */
	const LINK =
		'border-ink text-ink transition-colors duration-(--motion-fill) before:absolute before:inset-0 before:-z-10 before:scale-x-0 before:bg-ink before:transition-transform before:duration-(--motion-fill) before:ease-settle hover:text-wall hover:before:scale-x-100 focus-visible:text-wall focus-visible:before:scale-x-100 active:scale-95 motion-reduce:before:transition-none';
	const SIDES = {
		left: {
			rel: 'prev',
			key: 'ArrowLeft',
			fill: 'before:origin-right',
			nudge: 'group-hover:-translate-x-0.5'
		},
		right: {
			rel: 'next',
			key: 'ArrowRight',
			fill: 'before:origin-left',
			nudge: 'group-hover:translate-x-0.5'
		}
	};
</script>

{#snippet arrow(work: Work | undefined, direction: 'left' | 'right', label: string)}
	{@const side = SIDES[direction]}
	{#if work}
		<a
			href={workHref(lang, work.slug)}
			rel={side.rel}
			aria-label={`${label}: ${nameOf(work, lang)}`}
			aria-keyshortcuts={side.key}
			class={cn(ARROW, LINK, side.fill)}
		>
			<ArrowIcon {direction} class={cn('transition-transform duration-300', side.nudge)} />
		</a>
	{:else}
		<!-- At either end of the works the arrow stays in its place, but leads nowhere. -->
		<span aria-hidden="true" class={cn(ARROW, 'border-line text-line')}>
			<ArrowIcon {direction} />
		</span>
	{/if}
{/snippet}

<!--
	Arrows to the works before and after, with the work's place between them. They sit in the
	same spot on every work's page, so a visitor can keep pressing one to walk through the works:
	the focus stays on the arrow from one work to the next. The page also answers to the left
	and right arrow keys.
-->
<nav
	bind:this={pager}
	aria-label={copy.pagerLabel}
	class={cn('flex items-center gap-3', className)}
>
	{@render arrow(previous, 'left', copy.previous)}
	<p class="min-w-18 text-center text-label text-ink-soft tabular-nums">
		<span aria-hidden="true">{catalogNumber(place)} / {catalogNumber(total)}</span>
		<span class="sr-only">{copy.place(place, total)}</span>
	</p>
	{@render arrow(next, 'right', copy.next)}
</nav>
