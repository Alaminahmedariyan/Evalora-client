"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useGetMe } from "@/hooks";
import AuthLoading from "./auth-loading";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isPending, isError } = useGetMe();
  const user = data?.data;

  useEffect(() => {
    if (isPending) return;
    if (isError || !user) {
      router.replace("/login");
    }
  }, [isPending, isError, user, router]);

  if (isPending) {
    return <AuthLoading />;
  }

  if (isError || !user) {
    return <AuthLoading label="Redirecting..." />;
  }

  return <>{children}</>;
}