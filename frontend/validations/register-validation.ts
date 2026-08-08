import * as Yup from "yup";

export const registerValidationSchema = Yup.object({
  name: Yup.string().trim().required("Enter your name"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Use at least 8 characters")
    .max(72, "Use no more than 72 characters")
    .required("Password is required"),
});
