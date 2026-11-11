<script lang="ts">
	import { catalogNumber, type Work } from '#lib/content/works.ts';
	import type { Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		work: Work;
		lang: Lang;
		class?: string;
	}

	let { work, lang, class: className }: Props = $props();
</script>

<!-- A wall label: catalog number, title, technique, size. Titles are always Spanish. -->
<div class={cn('flex flex-col gap-1.5', className)}>
	<h3 class="flex gap-3 text-label text-ink uppercase">
		<span class="text-ink-soft tabular-nums">{catalogNumber(work.n)}</span>
		<span lang="es">{work.title}</span>
	</h3>
	<p class="text-sm leading-relaxed text-ink-soft">{work.medium[lang]}</p>
	<p class="text-sm text-ink-soft tabular-nums">{work.dimensions[lang]}</p>
</div>
