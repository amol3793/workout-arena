import { PRODUCT_CONFIG } from "@/lib/productConfig";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign in — Ease your Workout",
  description: "Sign in to access AI workout planning, progress tracking, and your personalized fitness coach.",
};

export default function LoginPage() {
  if (!PRODUCT_CONFIG.features.userWorkspace) notFound();
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-8">
      <LoginClient />
    </div>
  );
}
