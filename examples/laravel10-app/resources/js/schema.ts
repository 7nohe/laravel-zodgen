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
    bio: z.coerce.string().nonempty()
});
