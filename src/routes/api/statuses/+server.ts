import { error, json } from '@sveltejs/kit';
import type { Status } from '../../../types/gradeStatus';
import type GradeStatus from '../../../types/gradeStatus';
import { load } from 'cheerio';
import { titleCase } from 'title-case';

function parseWebGrades(html: string): GradeStatus[] {
	const start = performance.now();
	const $ = load(html);
	const courses = $('.Courses');
	const entries = courses.find('tr');
	const gradeStatuses: GradeStatus[] = [];
	entries.each(function () {
		let courseCode = 0,
			dept = '',
			number = '',
			title = '',
			enrolled = 0,
			graded = 0,
			statusChangeDate = new Date(1970, 0, 1),
			status: Status = 'Error';

		const instructors: string[] = [];

		const cols = $(this).find('td');

		if (cols.length != 0) {
			// ignore header rows
			let isEmpty = false;

			cols.each(function (i) {
				if ($(this).text() == '') {
					// ignore empty rows
					isEmpty = true;
					return false;
				}

				switch (i) {
					case 0:
						courseCode = Number($(this).text());
						break;
					case 1:
						dept = $(this).text();
						break;
					case 2:
						number = $(this).text();
						break;
					case 3:
						title = titleCase($(this).text().toLowerCase());
						break;
					case 4:
						$(this)
							.html()
							?.toLowerCase()
							.split('<br>')
							.forEach((instructor) => {
								instructors.push(titleCase(instructor));
							});
						break;
					case 5:
						enrolled = Number($(this).text());
						break;
					case 6:
						graded = Number($(this).text());
						break;
					case 7:
						statusChangeDate = new Date($(this).text());
						break;
					case 8:
						status = $(this).text() as Status;
						break;
				}
			});

			if (!isEmpty) {
				gradeStatuses.push({
					courseCode,
					dept,
					number,
					title,
					instructors,
					enrolled,
					graded,
					statusChangeDate,
					status
				});
			}
		}
	});

	const end = performance.now();

	console.log('Scrape time:', end - start);

	return gradeStatuses;
}

function fetchWebGradesStatus(yearTerm: string, school: string): Promise<GradeStatus[] | null> {
	const body = new URLSearchParams({
		YearTerm: yearTerm,
		School: school,
		ShowSubscribed: '1',
		ShowSubmitted: '1',
		ShowUnsubscribed: '1',
		SortBy: 'CourseCode',
		FontSize: '100',
		Submit: 'Show Classes'
	});

	const start = performance.now();
	return fetch('https://www.reg.uci.edu/perl/WebGradesStatus', {
		method: 'POST',
		// cache: 'default',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: body.toString()
	})
		.then((res) => res.text())
		.then((text) => {
			const end = performance.now();
			console.log('Fetch time:', end - start);
			const gradeStatuses = parseWebGrades(text);
			return gradeStatuses;
		})
		.catch(() => {
			return null;
		});
}

export async function GET({ url, setHeaders }) {
	const yearTerm = url.searchParams.get('yearTerm');

	if (!yearTerm) {
		throw error(400, 'Invalid request. Missing yearTerm param.');
	}

	const gradeStatuses = await fetchWebGradesStatus(yearTerm, 'ANY');

	setHeaders({
		'cache-control': 's-maxage=60'
	});

	if (gradeStatuses == null) {
		throw error(500, 'Unable to fetch data from webgrades');
	}

	return json(gradeStatuses);
}
