<script lang="ts">
	import Header from './Header.svelte';
	import ResultsTable from './ResultsTable.svelte';
	import Search from './Search.svelte';
</script>

<svelte:head>
	<title>UCI Grade Status</title>
</svelte:head>
<Header />
<main class="md:container md:mx-auto xl:px-48 py-4">
	<Search />
	<div class="overflow-x-auto">
		<ResultsTable />
	</div>
</main>
