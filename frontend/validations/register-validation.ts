import * as Yup from "yup";

export const registerValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(50, "Name must contain no more than 50 characters")
    .required("Name is required"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password must contain no more than 72 characters")
    .required("Password is required"),
});
