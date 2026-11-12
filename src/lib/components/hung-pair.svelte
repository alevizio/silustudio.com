<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import { cn } from '#lib/utils/cn.ts';

	interface Photo {
		picture: Picture;
		alt: string;
	}

	interface Props {
		/** The photo that takes most of the row. */
		large: Photo;
		/** A smaller photo that hangs in the column beside it, under the text. */
		small: Photo;
		/** The wall text that goes with them. */
		text: string;
		/** Puts the large photo on the right and the column on the left. */
		flipped?: boolean;
		class?: string;
	}

	let { large, small, text, flipped = false, class: className }: Props = $props();

	/** Where the two parts stand on a wide screen. On a phone they simply follow one another. */
	const SIDES = {
		largeLeft: { large: 'lg:col-span-7', column: 'lg:col-span-4 lg:col-start-9' },
		largeRight: {
			large: 'lg:order-2 lg:col-span-8 lg:col-start-5',
			column: 'lg:order-1 lg:col-span-4'
		}
	};

	const side = $derived(flipped ? SIDES.largeRight : SIDES.largeLeft);
</script>

<!--
	Two photos hung together the way a gallery hangs a large work beside a small one: the large
	one takes most of the row, and a narrow column beside it holds a short wall text at the top
	and the small photo at the bottom. Neither photo is cropped.
-->
<div class={cn('grid gap-8 lg:grid-cols-12 lg:gap-x-16', className)}>
	<enhanced:img
		src={large.picture}
		alt={large.alt}
		sizes="(min-width: 1280px) 46rem, (min-width: 1024px) 62vw, 100vw"
		loading="lazy"
		class={cn('h-auto w-full reveal', side.large)}
	/>
	<div class={cn('flex flex-col justify-between gap-8', side.column)}>
		<p class="reveal font-serif text-prose text-ink-soft reveal-after-1">{text}</p>
		<enhanced:img
			src={small.picture}
			alt={small.alt}
			sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 30vw, 100vw"
			loading="lazy"
			class="h-auto w-full reveal reveal-after-2"
		/>
	</div>
</div>
