import { z } from "zod";
export const UpdatePostRequest = z.object({
    tag: z.object({
        ids: z.array(z.coerce.string())
    })
});
export const StorePostRequest = z.object({
    title: z.coerce.string().max(255),
    body: z.coerce.string()
});
export const ProfileUpdateRequest = z.object({
    name: z.coerce.string().max(255),
    email: z.coerce.string().email().max(255).optional(),
    age: z.coerce.number().int().optional(),
    height: z.coerce.number().nonnegative().optional(),
    bio: z.coerce.string(),
    address: z.array(z.object({
        country: z.coerce.string(),
        city: z.coerce.string()
    }))
});
export const DestroyPostRequest = z.object({
    ids: z.array(z.coerce.number().int().optional())
});
export const LoginRequest = z.object({
    email: z.coerce.string().email(),
    password: z.coerce.string()
});
