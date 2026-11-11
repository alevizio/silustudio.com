<script lang="ts">
	import WorkPage from '#lib/pages/work-page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<WorkPage lang="en" work={data.work} />
