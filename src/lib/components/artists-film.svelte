<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import FilmToggle from '#lib/components/film-toggle.svelte';
	import { SITE } from '#lib/content/site.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { watchInView } from '#lib/motion/in-view.ts';
	import { asksForLessMotion } from '#lib/motion/preference.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		/** The still that stands in until the film's first frame arrives. */
		poster: Picture;
		posterAlt: string;
		/** Address of the film's player. */
		src?: string;
		class?: string;
	}

	let { lang, poster, posterAlt, src = SITE.filmUrl, class: className }: Props = $props();

	/**
	 * Starts at once, silent and in a loop, with none of Vimeo's own controls, title, author or
	 * avatar, and without its tracking.
	 */
	const PLAYER_OPTIONS = 'autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&dnt=1';

	/** The player is on the page. Until then there is only the still. */
	let started = $state(false);
	/** The visitor started the film by hand, so the focus follows to the button that stops it. */
	let pressed = $state(false);
	/** The visitor has paused the film. */
	let stopped = $state(false);
	let player: HTMLIFrameElement | undefined = $state();
	let loaded = false;
	let inView = true;

	const copy = $derived(copyFor(lang).studio.film);

	// The film starts by itself, unless the visitor has asked their device for less motion.
	$effect(() => {
		if (!asksForLessMotion()) started = true;
	});

	// Vimeo's player takes its orders as messages, once it has loaded. Out of sight the film
	// waits, and back on screen it goes on, unless the visitor has stopped it.
	const order = (): void => {
		if (!loaded) return;
		const method = inView && !stopped ? 'play' : 'pause';
		player?.contentWindow?.postMessage({ method }, new URL(src).origin);
	};

	const runInView = (frame: HTMLIFrameElement) =>
		watchInView(frame, (now) => {
			inView = now;
			order();
		});

	const toggle = (): void => {
		stopped = !stopped;
		order();
	};
</script>

<!--
	The artists' film is on Vimeo. It starts by itself, silent, and runs in a loop while it is on
	screen, with one button to stop it. A visitor who asks for less motion gets the still, and
	nothing loads from Vimeo until they press play.
-->
<div class={cn('relative aspect-video bg-plate', className)}>
	<!-- The still stays under the player, which is clear until the film's first frame arrives. -->
	<enhanced:img
		src={poster}
		alt={posterAlt}
		sizes="(min-width: 1280px) 1216px, 100vw"
		fetchpriority="high"
		class="absolute inset-0 size-full object-cover"
	/>
	{#if started}
		<!-- The player has no controls of its own, so it is kept out of reach like a picture. -->
		<iframe
			bind:this={player}
			{@attach runInView}
			onload={() => {
				loaded = true;
				order();
			}}
			src={`${src}?${PLAYER_OPTIONS}`}
			title={copy.title}
			allow="autoplay"
			tabindex="-1"
			class="pointer-events-none absolute inset-0 size-full"
		></iframe>
		<FilmToggle {lang} running={!stopped} onclick={toggle} takesFocus={pressed} />
	{:else}
		<button
			type="button"
			onclick={() => {
				pressed = true;
				started = true;
			}}
			class="group absolute inset-0 flex cursor-pointer items-center justify-center"
		>
			<span
				class="relative isolate inline-flex min-h-12 items-center overflow-hidden border border-ink bg-ink px-6 text-label text-wall uppercase transition-colors duration-(--motion-fill) group-hover:border-sand-deep group-focus-visible:border-sand-deep before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-sand-deep before:transition-transform before:duration-(--motion-fill) before:ease-settle group-hover:before:scale-y-100 group-focus-visible:before:scale-y-100 motion-reduce:before:transition-none"
			>
				{copy.play}
			</span>
		</button>
	{/if}
</div>
