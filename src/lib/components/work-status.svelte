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

	/** The gallery convention: a red dot is sold, half a dot is reserved, an empty ring is free. */
	const DOTS: Record<WorkStatus, string> = {
		available: 'border-ink-soft',
		reserved: 'border-sold bg-linear-to-r from-sold from-50% to-transparent to-50%',
		sold: 'border-sold bg-sold'
	};
</script>

<!-- Whether a work can still be bought. The word always shows; the dot only repeats it. -->
<p class={cn('flex items-center gap-2 text-label text-ink uppercase', className)}>
	<span aria-hidden="true" class={cn('size-2.5 shrink-0 rounded-full border', DOTS[status])}></span>
	{copyFor(lang).works.status[status]}
</p>
