export type Status = 'Submitted' | 'Subscribed' | 'Unsubscribed' | 'Error' | 'Tardy';

interface GradeStatus {
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

export default GradeStatus;
