"use client";

import axios from "axios";
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  loginMutationOptions,
  registerMutationOptions,
} from "@/queries/auth-mutations";
import { currentUserQueryOptions } from "@/queries/auth-queries";
import type { RegisterCredentials } from "@/types/auth";
import { registerValidationSchema } from "@/validations/register-validation";
import styles from "./RegisterForm.module.css";

const initialValues: RegisterCredentials = {
  name: "",
  email: "",
  password: "",
};

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const registerMutation = useMutation(registerMutationOptions);

  const loginMutation = useMutation(loginMutationOptions);

  async function handleSubmit(
    values: RegisterCredentials,
    formikHelpers: FormikHelpers<RegisterCredentials>,
  ) {
    formikHelpers.setStatus("");

    try {
      await registerMutation.mutateAsync(values);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        formikHelpers.setStatus("A user with this email already exists");

        return;
      }

      formikHelpers.setStatus("Failed to create an account");

      return;
    }

    try {
      const user = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      queryClient.setQueryData(currentUserQueryOptions.queryKey, user);

      toast.success("Account created successfully");

      router.replace("/");
    } catch {
      formikHelpers.setStatus(
        "Account created successfully, but automatic login failed. Please log in manually.",
      );
    }
  }

  return (
    <Formik<RegisterCredentials>
      initialValues={initialValues}
      validationSchema={registerValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ dirty, isSubmitting, isValid, status }) => (
        <Form className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>

            <Field
              className={styles.input}
              id="name"
              name="name"
              type="text"
              autoComplete="name"
            />

            <div className={styles.errorSlot}>
              <ErrorMessage name="name">
                {(message) => <p className={styles.error}>{message}</p>}
              </ErrorMessage>
            </div>
          </div>

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
              autoComplete="new-password"
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
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
