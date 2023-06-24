<script lang="ts">
	import Spinner from './Spinner.svelte';
	import type { GradeStatus } from '../util/types';
	import { error, loading, results } from '../util/stores';

	let loadingValue = true;
	loading.subscribe((value) => (loadingValue = value));

	let gradeStatuses: GradeStatus[] = [];
	results.subscribe((value) => (gradeStatuses = value));

	let errorValue = false;
	error.subscribe((value) => (errorValue = value));
</script>

<table class="w-full mt-4">
	<thead>
		<tr class="border-b p-2 border-b-slate-200 dark:border-b-neutral-600">
			<th class="border-r p-2 border-x-slate-200 dark:border-x-neutral-600">Course Code</th>
			<th class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">Dept</th>
			<th class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">Number</th>
			<th class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">Title</th>
			<th class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">Instructor</th>
			<th class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">Enr</th>
			<th class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">Grd</th>
			<th class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">Status Change Date</th>
			<th class="border-l p-2 border-x-slate-200 dark:border-x-neutral-600">Status</th>
		</tr>
	</thead>
	<tbody>
		{#each gradeStatuses as entry}
			<tr class="border-t p-2 border-t-slate-200 dark:border-t-neutral-600">
				<td class="border-r p-2 border-x-slate-200 dark:border-x-neutral-600">
					{String(entry.courseCode).padStart(5, '0')}
				</td>
				<td class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">{entry.dept}</td>
				<td class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">{entry.number}</td>
				<td class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">{entry.title}</td>
				<td class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">
					{#if entry.instructors.length == 1}
						{entry.instructors[0]}
					{:else}
						{#each entry.instructors as instructor}
							{instructor}<br />
						{/each}
					{/if}
				</td>
				<td class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">{entry.enrolled}</td>
				<td class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">{entry.graded}</td>
				<td class="border-x p-2 border-x-slate-200 dark:border-x-neutral-600">
					{entry.statusChangeDate.toLocaleString('en-us', {
						weekday: 'short',
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric'
					})}
				</td>
				<td
					class:text-green-500={entry.status == 'Submitted'}
					class:text-yellow-500={entry.status == 'Tardy'}
					class:dark:text-green-400={entry.status == 'Submitted'}
					class:dark:text-yellow-400={entry.status == 'Tardy'}
					class:text-red-400={entry.status == 'Unsubscribed' || entry.status == 'Error'}
					class="border-l p-2 border-x-slate-200 dark:border-x-neutral-600">{entry.status}</td
				>
			</tr>
		{:else}
			{#if !loadingValue && !errorValue && gradeStatuses.length == 0}
				No Results Found
			{/if}
		{/each}
	</tbody>
</table>
{#if errorValue}
	<div class="flex w-full justify-center py-40 text-8xl">💀</div>
{:else if loadingValue}
	<div class="flex w-full justify-center p-20">
		<Spinner size="10em" thickness="1em" accentColor="#34aeeb" />
	</div>
{/if}
