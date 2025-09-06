"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { XCircle, ArrowLeft, RefreshCw, Home, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentFailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorInfo, setErrorInfo] = useState<{
    code: string | null
    message: string | null
    orderId: string | null
  }>({
    code: null,
    message: null,
    orderId: null
  })

  useEffect(() => {
    const code = searchParams.get("code")
    const message = searchParams.get("message")
    const orderId = searchParams.get("orderId")

    setErrorInfo({
      code,
      message,
      orderId
    })
  }, [searchParams])

  // 에러 코드에 따른 메시지 정리
  const getErrorMessage = (code: string | null, message: string | null) => {
    if (message) return message

    switch (code) {
      case "PAY_PROCESS_CANCELED":
        return "사용자가 결제를 취소했습니다."
      case "PAY_PROCESS_ABORTED":
        return "결제 프로세스가 중단되었습니다."
      case "REJECT_CARD_COMPANY":
        return "카드사에서 결제를 거절했습니다."
      case "INVALID_CARD_NUMBER":
        return "유효하지 않은 카드번호입니다."
      case "NOT_ENOUGH_BALANCE":
        return "잔액이 부족합니다."
      case "EXCEED_MAX_DAILY_PAYMENT_COUNT":
        return "일일 결제 한도를 초과했습니다."
      case "EXCEED_MAX_PAYMENT_AMOUNT":
        return "결제 한도를 초과했습니다."
      default:
        return "결제 처리 중 오류가 발생했습니다."
    }
  }

  const getErrorAdvice = (code: string | null) => {
    switch (code) {
      case "PAY_PROCESS_CANCELED":
        return "다시 결제를 시도해주세요."
      case "REJECT_CARD_COMPANY":
        return "다른 카드를 사용하거나 카드사에 문의해주세요."
      case "INVALID_CARD_NUMBER":
        return "카드번호를 다시 확인해주세요."
      case "NOT_ENOUGH_BALANCE":
        return "계좌 잔액을 확인하거나 다른 결제수단을 이용해주세요."
      case "EXCEED_MAX_DAILY_PAYMENT_COUNT":
      case "EXCEED_MAX_PAYMENT_AMOUNT":
        return "내일 다시 시도하거나 다른 결제수단을 이용해주세요."
      default:
        return "문제가 지속되면 고객센터에 문의해주세요."
    }
  }

  const handleRetry = () => {
    // 이전 결제 페이지로 돌아가기
    router.back()
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleGoToCertificates = () => {
    router.push("/certificates")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">결제 실패</CardTitle>
            <p className="text-gray-600">결제 처리 중 문제가 발생했습니다.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 에러 정보 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">오류 내용</h3>
                  <p className="text-sm text-red-800 mb-2">
                    {getErrorMessage(errorInfo.code, errorInfo.message)}
                  </p>
                  <p className="text-sm text-red-700">
                    {getErrorAdvice(errorInfo.code)}
                  </p>
                </div>
              </div>
            </div>

            {/* 에러 상세 정보 */}
            {(errorInfo.code || errorInfo.orderId) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm">상세 정보</h3>
                {errorInfo.orderId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">주문번호</span>
                    <span className="font-medium font-mono">{errorInfo.orderId}</span>
                  </div>
                )}
                {errorInfo.code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">오류코드</span>
                    <span className="font-medium font-mono">{errorInfo.code}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">발생시간</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* 도움말 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">결제 재시도 전 확인사항</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 카드 유효기간 및 한도 확인</li>
                <li>• 인터넷 뱅킹 서비스 이용 가능 여부</li>
                <li>• 결제 금액 및 계좌 잔액 확인</li>
                <li>• 브라우저 쿠키 및 캐시 삭제</li>
              </ul>
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                결제 재시도
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleGoToCertificates}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  인증서 목록
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </div>
            </div>

            {/* 고객센터 안내 */}
            <div className="text-center text-sm text-gray-500 border-t pt-4">
              문제가 지속되면{" "}
              <a 
                href="mailto:support@example.com" 
                className="text-blue-600 hover:underline"
              >
                고객센터
              </a>
              에 문의해주세요.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
