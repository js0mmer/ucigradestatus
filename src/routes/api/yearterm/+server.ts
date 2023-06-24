import { error, json } from '@sveltejs/kit';
import { WEBGRADES_URL } from '../../../util/constants';
import { load } from 'cheerio';
import type { YearTerm, YearTermResponse } from '../../../util/types';

function parseYearTerms(html: string): YearTermResponse {
	const $ = load(html);
	const yearTermSelect = $('[name=YearTerm]');
	const yearTerms: YearTerm[] = [];
	let defaultTerm = '';
	yearTermSelect.find('option').each(function () {
		const value = $(this).attr('value') ?? '';
		const name = $(this).text();

		if ($(this).attr('selected')) {
			defaultTerm = value;
		}

		yearTerms.push({
			value,
			name
		});
	});

	return { defaultTerm, yearTerms };
}

export async function GET() {
	const yearTerms = await fetch(WEBGRADES_URL)
		.then(async (res) => {
			if (!res.ok) {
				throw new Error(await res.text());
			}

			return res.text();
		})
		.then((text) => {
			return parseYearTerms(text);
		})
		.catch((error) => {
			console.log(error);
			return null;
		});

	if (!yearTerms) {
		throw error(500, 'Unable to fetch YearTerms options from WebGrades');
	}

	return json(yearTerms);
}
