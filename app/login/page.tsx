"use client";

import { Suspense } from "react";
import LoginPage from "@/features/user/LoginPage";

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
