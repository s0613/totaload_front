"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { userService } from "./UserService";
import { useAuthStore } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await userService.getCurrentUser();
        if (!cancelled && me) {
          login({
            email: me.email,
            name: me.email.split("@")[0],
            userId: me.id,
            role: me.role,
          });
          router.replace("/");
        }
      } catch {
        // 미로그인 상태면 통과
      }
    })();
    return () => { cancelled = true; };
  }, [login, router, params]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await userService.login({ email, password });
      try {
        const me = await userService.getCurrentUser();
        if (me) {
          login({
            email: me.email,
            name: me.email.split("@")[0],
            userId: me.id,
            role: me.role,
          });
        }
      } catch {}
      toast.success("로그인에 성공했습니다!");
      // push 대신 replace
      router.replace(res?.redirectUrl || "/");
    } catch (err: any) {
      console.error("로그인 처리 중 오류:", err);
      toast.error(err?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      setIsLoading(true);
      userService.startGoogleOAuth();
    } catch (error) {
      console.error("Google 로그인 시작 실패:", error);
      toast.error("Google 로그인 시작에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div className="lg:w-1/2 w-full flex items-center justify-center p-8 lg:p-12">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <Image
                src="/Totaro_logo.svg"
                alt="Totaro Logo"
                width={60}
                height={60}
                className="w-12 h-12 lg:w-16 lg:h-16"
              />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Totaro에 오신 것을 환영합니다</h1>
          <p className="text-lg lg:text-xl text-gray-600">계정에 로그인하여 서비스를 이용하세요</p>
        </div>
      </div>

      <div className="lg:w-1/2 w-full flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6 px-6 lg:px-8 pt-8">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">로그인</CardTitle>
              <CardDescription className="text-center text-gray-600 text-base">
                이메일과 비밀번호를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 lg:px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-base font-medium text-gray-700">
                    이메일
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="password" className="text-base font-medium text-gray-700">
                    비밀번호
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-base text-gray-600">로그인 상태 유지</span>
                  </label>
                  <Link href="/forgot-password" className="text-base text-blue-600 hover:underline">
                    비밀번호 찾기
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 text-base h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      로그인 중...
                    </>
                  ) : (
                    "로그인"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">SNS 계정으로 로그인</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50 bg-white"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-3" />
                  Google로 로그인
                </Button>
              </div>

              <div className="text-center pt-6">
                <p className="text-base text-gray-600">
                  계정이 없으신가요?{" "}
                  <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                    회원가입
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6 lg:mt-8">
            <p className="text-sm text-gray-500">© 2025 Totaro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
