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
</script>

<!-- A work's tag: one small word in a hairline frame, quiet beside the photos. -->
<p
	class={cn(
		'inline-flex items-center border border-line px-2 py-0.5 text-tag text-ink uppercase',
		className
	)}
>
	{copyFor(lang).works.status[status]}
</p>
