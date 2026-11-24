<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		/** In threes: a square photo, a tall one and a wide one. A last, unfinished three is left out. */
		photos: readonly Picture[];
		/** What each photo shows, in the same order as `photos`. */
		alts: readonly string[];
		class?: string;
	}

	let { photos, alts, class: className }: Props = $props();

	const SIZES = '(min-width: 1280px) 18rem, (min-width: 768px) 23vw, 46vw';

	const trios = $derived(
		Array.from({ length: Math.floor(photos.length / 3) }, (_, trio) => {
			const [square, tall, wide] = [0, 1, 2].map((place) => ({
				picture: photos[trio * 3 + place],
				alt: alts[trio * 3 + place] ?? ''
			}));
			return { square, tall, wide };
		})
	);
</script>

<!--
	Works in the rooms they hang in, laid out as Lucila sketched it (23 Nov 2026): a square photo
	over a wide one, beside a tall one as high as both. Every other three turns the other way.
	On a phone the threes come one under the other; on a wider screen two sit side by side.
	The square and wide photos keep their shape. The tall one fills the height beside them,
	which takes a little of its ceiling and floor.
-->
<div class={cn('grid gap-3 md:grid-cols-2 md:gap-6', className)}>
	{#each trios as trio, index (index)}
		<div class="grid grid-cols-2 gap-3 md:gap-6">
			<div class={['flex flex-col gap-3 md:gap-6', index % 2 === 1 && 'order-last']}>
				<enhanced:img
					src={trio.square.picture}
					alt={trio.square.alt}
					sizes={SIZES}
					loading="lazy"
					class="aspect-square h-auto w-full reveal object-cover"
				/>
				<enhanced:img
					src={trio.wide.picture}
					alt={trio.wide.alt}
					sizes={SIZES}
					loading="lazy"
					class="aspect-room h-auto w-full reveal object-cover reveal-after-1"
				/>
			</div>
			<div class="relative reveal reveal-after-1">
				<enhanced:img
					src={trio.tall.picture}
					alt={trio.tall.alt}
					sizes={SIZES}
					loading="lazy"
					class="absolute inset-0 size-full object-cover"
				/>
			</div>
		</div>
	{/each}
</div>
