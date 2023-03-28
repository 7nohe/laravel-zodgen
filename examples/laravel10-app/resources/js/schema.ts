import { z } from "zod";
export const UpdatePostRequest = z.object({});
export const StorePostRequest = z.object({
    title: z.string().max(255),
    body: z.string()
});
export const ProfileUpdateRequest = z.object({
    name: z.string().max(255).optional(),
    email: z.string().email().max(255).optional(),
    age: z.number().int().optional(),
    height: z.number().nonnegative().optional(),
    bio: z.any()
});
