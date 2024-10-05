export const roles = ['admin', 'user', 'guest', 'super admin', 'baker', 'omega', 'alpha'] as const;
export type Roles = (typeof roles)[number];

export type FormValues = {
	username: string;
	password: string;
	roles: Roles[];
	nested:
		| {
				age: number;
				gender: boolean;
		  }
		| {
				height: number;
				weight: number;
		  }
		| {
				bananas: string[];
		  };
	testers: { banana: string; lemon: number }[];
	rolesAreUnique: null;
	files: FileList | null;
};

export type Obj = Record<PropertyKey, unknown>;
