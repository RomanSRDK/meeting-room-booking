import type { Metadata } from "next";
import NotFoundClient from "./not-found-client";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The requested page could not be found in the meeting room booking application.",
};

export default function NotFoundPage() {
  return <NotFoundClient />;
}
