import type { ReactNode } from "react";

import { AccountShell } from "@/components/Layout/AccountShell/AccountShell";

type AccountLayoutProps = {
  children: ReactNode;
};

export default function AccountLayout({ children }: AccountLayoutProps) {
  return <AccountShell>{children}</AccountShell>;
}
