export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    age?: number;
    height?: number;
    bio: string;
    address?: { city: string, country: string }[]
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};
