---
name: forms-validation-zod
description: Best practices for implementing client and server-side form validation using Zod and React Hook Form.
---

# Forms Validation & Zod Skill

Use this skill when building interactive user input forms, schema validation, and error display components.

## Validation Principles

1. **Schema-First Design**
   - Declare strict TypeScript schemas using Zod for all form models.
   - Example:
     ```ts
     const contactSchema = z.object({
       email: z.string().email("Please enter a valid email address"),
       message: z.string().min(10, "Message must be at least 10 characters"),
     });
     ```

2. **Real-Time Visual Feedback**
   - Show inline validation error messages with red text and icons.
   - Disable submit buttons while submitting and show a spinner (`<Loader2 className="animate-spin" />`).
