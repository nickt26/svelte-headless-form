import { clone } from 'src/util/clone';

export const dropLast = <T>(list: T[]): T[] => {
	const clonedList = clone(list);
	clonedList.splice(-1);
	return clonedList;
};
