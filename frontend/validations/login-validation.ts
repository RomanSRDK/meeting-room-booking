import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password must contain no more than 72 characters")
    .required("Password is required"),
});
