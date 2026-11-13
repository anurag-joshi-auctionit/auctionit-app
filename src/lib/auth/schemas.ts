import { z } from "zod";
import { AuthValidationMessages } from "@/lib/auth/messages";

export const loginSchema = z.object({
  userLoginName: z
    .string()
    .trim()
    .min(1, AuthValidationMessages.USERNAME_REQUIRED),
  password: z
    .string()
    .trim()
    .min(1, AuthValidationMessages.PASSWORD_REQUIRED),
});

export type LoginFormData = z.infer<typeof loginSchema>;
