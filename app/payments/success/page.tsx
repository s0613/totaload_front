"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, ArrowLeft, Download, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

function SuccessParamsProcessor({ onSuccess, onError, onDone }: {
  onSuccess: (data: any) => void;
  onError: (message: string) => void;
  onDone: () => void;
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentKey = searchParams.get("paymentKey")
        const orderId = searchParams.get("orderId")
        const amount = searchParams.get("amount")

        if (!paymentKey || !orderId || !amount) {
          throw new Error("결제 정보가 올바르지 않습니다.")
        }

        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        })

        if (!response.ok) {
          throw new Error("결제 승인에 실패했습니다.")
        }

        const data = await response.json()
        onSuccess(data)
        toast.success("결제가 성공적으로 완료되었습니다!")
        
      } catch (error: any) {
        console.error("결제 승인 처리 실패:", error)
        onError(error.message || "결제 처리 중 오류가 발생했습니다.")
        toast.error("결제 승인에 실패했습니다.")
      } finally {
        onDone()
      }
    }

    processPayment()
  }, [searchParams, onSuccess, onError, onDone])

  return null
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">결제 처리 중</h2>
          <p className="text-gray-600">결제 승인을 진행하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">결제 승인 실패</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">{error}</p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  이전으로
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">결제 완료</CardTitle>
            <p className="text-gray-600">인증서 발급 결제가 성공적으로 완료되었습니다.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Suspense fallback={null}>
              <SuccessParamsProcessor
                onSuccess={setPaymentData}
                onError={setError}
                onDone={() => setIsProcessing(false)}
              />
            </Suspense>
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">주문번호</span>
                  <span className="font-medium">{paymentData.orderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">결제금액</span>
                  <span className="font-medium">{paymentData.totalAmount?.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">결제수단</span>
                  <span className="font-medium">{paymentData.method}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">결제일시</span>
                  <span className="font-medium">
                    {paymentData.approvedAt ? new Date(paymentData.approvedAt).toLocaleString() : "방금 전"}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">다음 단계</h3>
              <p className="text-sm text-blue-800 mb-3">
                인증서 발급이 자동으로 시작됩니다. 약 2-3분 후 인증서를 확인할 수 있습니다.
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 발급 완료 시 이메일로 알림 발송</li>
                <li>• 마이페이지에서 인증서 다운로드 가능</li>
                <li>• 발급된 인증서는 PDF 형태로 제공</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  // 인증서 페이지로 이동
                  const orderId = searchParams.get("orderId")
                  // orderId에서 certificateId 추출 (orderId에 certificateId가 포함되어 있다고 가정)
                  const urlParams = new URLSearchParams(window.location.search)
                  const allParams = Object.fromEntries(urlParams.entries())
                  
                  // 결제 페이지에서 전달된 certificateId가 있다면 해당 인증서 페이지로, 없다면 인증서 목록으로
                  const certificateId = allParams.certificateId
                  if (certificateId) {
                    router.push(`/certificates/${certificateId}?paymentCompleted=true`)
                  } else {
                    router.push("/certificates?paymentCompleted=true")
                  }
                }}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                인증서 확인
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
