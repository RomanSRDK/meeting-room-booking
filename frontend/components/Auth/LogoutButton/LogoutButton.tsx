"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { logoutMutationOptions } from "@/queries/auth-mutations";
import { currentUserQueryOptions } from "@/queries/auth-queries";
import styles from "./LogoutButton.module.css";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation(logoutMutationOptions);

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();

      queryClient.setQueryData(currentUserQueryOptions.queryKey, null);

      toast.success("Logged out successfully", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });

      router.replace("/login");
    } catch {
      toast.error("Failed to log out", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  }

  return (
    <form action={handleLogout}>
      <button
        className={styles.button}
        type="button"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? "Logging out..." : "Log out"}
      </button>
    </form>
  );
}
