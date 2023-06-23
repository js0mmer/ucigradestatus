<script lang="ts">
	import search from 'websoc-fuzzy-search';
	import { error, loading, results } from '../util/stores';
	import { PAGE_SIZE } from '../util/constants';
	import type GradeStatus from '../util/types';
	import { onMount } from 'svelte';

	let course = '';
	let instructor = '';

	let gradeStatuses: GradeStatus[] = [];

	$: {
		if (!course && !instructor) {
			results.set(gradeStatuses.slice(0, PAGE_SIZE));
		} else if (gradeStatuses.length != 0) {
			let filteredGradeStatuses = gradeStatuses;

			if (course) {
				let courseResults = search({ query: course, resultType: 'COURSE' });

				filteredGradeStatuses = filteredGradeStatuses.filter((value) => {
					let courseName = value.dept.toUpperCase().replace(' ', '') + value.number.toUpperCase();
					return courseResults[courseName];
				});
			}

			if (instructor) {
				let instructorResults = search({ query: instructor, resultType: 'INSTRUCTOR' });

				filteredGradeStatuses = filteredGradeStatuses.filter((value) => {
					return value.instructors.some(
						(instructor) => instructorResults[instructor.toUpperCase()]
					);
				});
			}

			results.set(filteredGradeStatuses.slice(0, PAGE_SIZE));
		}
	}

	function fetchGradeStatuses(yearTerm: string) {
		let searchParams = new URLSearchParams({ yearTerm });
		fetch('/api/statuses?' + searchParams)
			.then(async (res) => {
				if (!res.ok) {
					alert((await res.json()).message);
          error.set(true);
          return null;
				}

				return res.json();
			})
			.then((res) => {
				if (res) {
					gradeStatuses = res.map((value: any) => {
						value.statusChangeDate = new Date(value.statusChangeDate as string);
						return value;
					});

          loading.set(false);
				}
			});
	}

	onMount(() => {
		fetchGradeStatuses('2023-14');
	});
</script>

<input
	bind:value={course}
	class="dark:bg-neutral-900 dark:text-slate-100 dark:placeholder-neutral-100 border rounded-md m-1 border-slate-200 dark:border-neutral-600 hover:border-slate-300 dark:hover:border-neutral-500 focus:border-blue-300 dark:focus:border-blue-300  px-2 py-1 outline-none"
	type="text"
	placeholder="Course"
	id="course"
/>
<input
	bind:value={instructor}
	class="dark:bg-neutral-900 dark:text-slate-100 dark:placeholder-neutral-100 border rounded-md m-1 border-slate-200 dark:border-neutral-600 hover:border-slate-300 dark:hover:border-neutral-500 focus:border-blue-300 dark:focus:border-blue-300  px-2 py-1 outline-none"
	type="text"
	placeholder="Instructor"
	id="instructor"
/>
