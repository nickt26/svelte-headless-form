export type FormValues = {
	name: string;
	email: string;
	// age: 'banana' | 'lemon';
	age: Date | number;
	roles: string[];
	location: {
		address: string;
		coords: {
			lat: number;
			lng: number;
		};
		parts: (string | number | boolean | { a: string })[];
	};
	titles: ['Mr', 'Dr', 'Sir'];
};
