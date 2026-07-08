import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to keep creating.</p>
      </div>
      <SignInForm />
      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-foreground font-medium underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}
