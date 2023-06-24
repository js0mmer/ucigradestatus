export type Status = 'Submitted' | 'Subscribed' | 'Unsubscribed' | 'Error' | 'Tardy';

export interface GradeStatus {
	courseCode: number;
	dept: string;
	number: string;
	title: string;
	instructors: string[];
	enrolled: number;
	graded: number;
	statusChangeDate: Date;
	status: Status;
}

export interface YearTerm {
	value: string;
	name: string;
}

export interface YearTermResponse {
	defaultTerm: string,
	yearTerms: YearTerm[]
}