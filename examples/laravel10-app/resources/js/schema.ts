import { z } from "zod";
export const UpdatePostRequest = z.object({});
export const StorePostRequest = z.object({
    title: z.coerce.string().max(255).nonempty(),
    body: z.coerce.string().nonempty()
});
export const ProfileUpdateRequest = z.object({
    name: z.coerce.string().max(255).nonempty(),
    email: z.coerce.string().email().max(255).optional(),
    age: z.coerce.number().int().optional(),
    height: z.coerce.number().nonnegative().optional(),
    bio: z.coerce.string().nonempty(),
    address: z.array(z.object({
        country: z.coerce.string().nonempty(),
        city: z.coerce.string().nonempty()
    }))
});
export const LoginRequest = z.object({
    email: z.coerce.string().email().nonempty(),
    password: z.coerce.string().nonempty()
});
