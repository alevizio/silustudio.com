<script lang="ts">
	import type { WorkStatus } from '#lib/content/works.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		status: WorkStatus;
		lang: Lang;
		class?: string;
	}

	let { status, lang, class: className }: Props = $props();

	/*
	 * The gallery convention: a red dot is sold, half a dot is reserved, an empty ring is free.
	 * A work that hangs in the gallery today gets a dot of sand, which breathes a few times as
	 * the tag arrives and then rests.
	 */
	const DOTS: Record<WorkStatus, string> = {
		onView:
			'border-sand-deep bg-sand after:absolute after:inset-0 after:rounded-full after:border after:border-sand-deep after:opacity-0 motion-safe:after:animate-breathe',
		available: 'border-ink-soft',
		reserved: 'border-sold bg-linear-to-r from-sold from-50% to-transparent to-50%',
		sold: 'border-sold bg-sold'
	};
</script>

<!-- A work's tag. The word always shows; the dot only repeats it. -->
<p
	class={cn(
		'inline-flex items-center gap-2 border border-line px-2.5 py-1 text-label text-ink uppercase',
		className
	)}
>
	<span
		aria-hidden="true"
		class={cn('relative size-2.5 shrink-0 rounded-full border', DOTS[status])}
	></span>
	{copyFor(lang).works.status[status]}
</p>
