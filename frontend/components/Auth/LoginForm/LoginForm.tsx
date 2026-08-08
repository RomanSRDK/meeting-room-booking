"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loginMutationOptions } from "@/queries/auth-mutations";
import { currentUserQueryOptions } from "@/queries/auth-queries";
import type { LoginCredentials } from "@/types/auth";
import { loginValidationSchema } from "@/validations/login-validation";

import styles from "./LoginForm.module.css";

const initialValues: LoginCredentials = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation(loginMutationOptions);

  async function handleSubmit(
    values: LoginCredentials,
    formikHelpers: FormikHelpers<LoginCredentials>,
  ) {
    formikHelpers.setStatus("");

    try {
      const user = await loginMutation.mutateAsync(values);

      queryClient.setQueryData(currentUserQueryOptions.queryKey, user);

      toast.success("Logged in successfully", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });

      router.replace("/");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        formikHelpers.resetForm();

        const message =
          "Too many login attempts. Please wait 15 minutes and try again";

        toast.error(message, {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });

        return;
      }

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        formikHelpers.setStatus("Invalid email or password");

        return;
      }

      formikHelpers.setStatus("Failed to log in");
    }
  }

  return (
    <Formik<LoginCredentials>
      initialValues={initialValues}
      validationSchema={loginValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ dirty, isSubmitting, isValid, status }) => (
        <Form className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>

            <Field
              className={styles.input}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
            />

            <div className={styles.errorSlot}>
              <ErrorMessage name="email">
                {(message) => <p className={styles.error}>{message}</p>}
              </ErrorMessage>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>

            <Field
              className={styles.input}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
            />

            <div className={styles.errorSlot}>
              <ErrorMessage name="password">
                {(message) => <p className={styles.error}>{message}</p>}
              </ErrorMessage>
            </div>
          </div>

          <div className={styles.requestErrorSlot}>
            {status && <p className={styles.requestError}>{status}</p>}
          </div>

          <button
            className={styles.submitButton}
            type="submit"
            disabled={!dirty || !isValid || isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
