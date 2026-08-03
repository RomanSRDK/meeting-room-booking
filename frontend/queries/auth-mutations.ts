import { mutationOptions } from "@tanstack/react-query";

import { loginUser, logoutUser, registerUser } from "@/services/auth-service";

export const registerMutationOptions = mutationOptions({
  mutationKey: ["auth", "register"],
  mutationFn: registerUser,
});

export const loginMutationOptions = mutationOptions({
  mutationKey: ["auth", "login"],
  mutationFn: loginUser,
});

export const logoutMutationOptions = mutationOptions({
  mutationKey: ["auth", "logout"],
  mutationFn: logoutUser,
});
