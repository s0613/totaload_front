"use client"

import { useEffect, useRef, useState } from "react"
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk"
import { toast } from "sonner"

declare global {
  interface Window {
    TossPayments: unknown;
  }
}

interface TossPaymentWidgetProps {
  amount: number
  orderId: string
  orderName: string
  customerKey: string
  customerEmail?: string
  customerName?: string
  certificateId?: string
  onPaymentSuccess: (data: any) => void
  onPaymentFail: (error: any) => void
}

export default function TossPaymentWidget({
  amount,
  orderId,
  orderName,
  customerKey,
  customerEmail,
  customerName,
  certificateId,
  onPaymentSuccess,
  onPaymentFail
}: TossPaymentWidgetProps) {
  const paymentMethodRef = useRef<HTMLDivElement>(null)
  const agreementRef = useRef<HTMLDivElement>(null)
  const paymentButtonRef = useRef<HTMLButtonElement>(null)
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // 토스페이먼츠 클라이언트 키 (테스트 키 사용)
  const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"

  // 결제위젯 초기화 - 공식 샘플과 동일한 구조
  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        setIsLoading(true)
        
        // SDK 로드
        const tossPayments = await loadTossPayments(clientKey)
        
        // 결제위젯 초기화
        const widgetsInstance = tossPayments.widgets({
          customerKey: customerKey || "ANONYMOUS"
        })

        // 결제 금액 설정
        await widgetsInstance.setAmount({
          currency: 'KRW',
          value: amount,
        })

        setWidgets(widgetsInstance)
        setIsLoading(false)
      } catch (error) {
        console.error('결제위젯 초기화 오류:', error)
        toast.error("결제 시스템을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.")
        setHasError(true)
        setIsLoading(false)
      }
    }

    fetchPaymentWidgets()
  }, [amount, customerKey, clientKey])

  // 결제위젯 렌더링 - 공식 샘플과 동일한 구조
  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets && paymentMethodRef.current && agreementRef.current) {
        try {
          // 결제 UI 렌더링
          await widgets.renderPaymentMethods({
            selector: '#payment-method',
            variantKey: 'DEFAULT'
          })

          // 약관 UI 렌더링
          await widgets.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT'
          })
        } catch (error) {
          console.error('결제위젯 렌더링 오류:', error)
        }
      }
    }

    renderPaymentWidgets()
  }, [widgets])

  // 결제 요청 함수 - 공식 샘플과 동일한 구조
  const handlePayment = async () => {
    if (!widgets) return

    try {
      // successUrl에 인증서 정보 포함
      const successParams = new URLSearchParams()
      if (certificateId) {
        successParams.append('certificateId', certificateId)
      }
      
      const successUrl = `${window.location.origin}/payments/success?${successParams.toString()}`
      const failUrl = `${window.location.origin}/payments/fail`

      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl,
        failUrl,
        customerEmail: customerEmail || 'customer@example.com',
        customerName: customerName || '김토스',
        customerMobilePhone: '01012341234',
      })
    } catch (error) {
      console.error('결제 요청 오류:', error)
      onPaymentFail(error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-100 rounded-xl"></div>
          <div className="h-20 bg-gray-100 rounded-xl"></div>
          <div className="h-12 bg-gray-100 rounded-xl"></div>
        </div>
        <div className="text-center text-gray-500 py-4">
          <div className="inline-flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-[#3182F6]"></div>
            <span className="text-sm">결제 시스템 준비 중...</span>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태 처리
  if (hasError) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 시스템 오류</h3>
        <p className="text-gray-600 text-sm mb-6">
          결제 시스템을 불러오는데 문제가 발생했습니다.<br/>
          잠시 후 다시 시도해주세요.
        </p>
        <button
          onClick={() => {
            setHasError(false)
            setIsLoading(true)
            window.location.reload()
          }}
          className="px-6 py-3 bg-[#3182F6] text-white font-medium rounded-xl hover:bg-[#2563eb] transition-colors"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 결제수단 선택 - 공식 샘플과 동일한 구조 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div 
          id="payment-method" 
          ref={paymentMethodRef}
          className="min-h-[200px]"
        />
      </div>

      {/* 약관 동의 - 공식 샘플과 동일한 구조 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div 
          id="agreement" 
          ref={agreementRef}
          className="min-h-[120px]"
        />
      </div>

      {/* 결제 버튼 - 공식 샘플과 동일한 구조 */}
      <div className="btn-wrapper w-full">
        <button
          id="payment-request-button"
          ref={paymentButtonRef}
          onClick={handlePayment}
          disabled={!widgets}
          className={`btn primary w-full py-4 px-6 rounded-lg transition-colors duration-200 text-lg font-semibold ${
            widgets
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {amount.toLocaleString()}원 결제하기
        </button>
      </div>
      
      {/* 결제 안내 - 공식 샘플과 동일한 구조 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>• 테스트 결제이므로 실제 결제가 진행되지 않습니다.</p>
        <p>• 카드번호: 4242-4242-4242-4242 (테스트용)</p>
      </div>
    </div>
  )
}
