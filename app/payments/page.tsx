"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { ArrowLeft, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import TossPaymentWidget from "@/components/TossPaymentWidget"

export default function PaymentsPage() {
  const { isLoggedIn, isHydrated, user } = useAuthStore()
  const router = useRouter()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)

  function ParamsInitializer() {
    const searchParams = useSearchParams()
    useEffect(() => {
      if (isHydrated && !isLoggedIn) {
        router.push("/login")
        return
      }

      const certificateId = searchParams.get('certificateId')
      const service = searchParams.get('service')
      
      if (certificateId && service === 'certificate_issue') {
        const data = {
          certificateId,
          manufacturer: searchParams.get('manufacturer'),
          modelName: searchParams.get('modelName'),
          manufactureYear: searchParams.get('manufactureYear'),
          amount: searchParams.get('amount') || '70000',
          service: 'certificate_issue',
          title: searchParams.get('orderName') || '인증서 발급',
          vin: searchParams.get('vin') || '',
          country: searchParams.get('country') || ''
        }
        setPaymentData(data)
        setShowPaymentForm(true)
      } else if (isHydrated && isLoggedIn && !showPaymentForm) {
        router.replace('/payments/history')
      }
    }, [isHydrated, isLoggedIn, router, searchParams, showPaymentForm])

    return null
  }

  // 모든 useEffect를 컴포넌트 최상단에 배치
  useEffect(() => {}, [])

  // 고유한 주문번호 생성 함수
  const generateOrderId = () => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 고유한 고객 키 생성 함수
  const generateCustomerKey = () => {
    return user?.userId ? `customer_${user.userId}` : `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 결제 성공 핸들러
  const handlePaymentSuccess = (data: any) => {
    console.log('결제 성공:', data)
    toast.success('결제가 완료되었습니다!')
    
    // 결제 성공 페이지로 이동하면서 인증서 정보도 함께 전달
    const successParams = new URLSearchParams({
      certificateId: paymentData?.certificateId || '',
      manufacturer: paymentData?.manufacturer || '',
      modelName: paymentData?.modelName || '',
    });
    
    // 토스페이먼츠는 자동으로 successUrl로 리다이렉트하므로 여기서는 처리하지 않음
  }

  // 결제 실패 핸들러
  const handlePaymentFail = (error: any) => {
    console.error('결제 실패:', error)
    toast.error('결제에 실패했습니다.')
  }

  // 인증 상태가 확인되지 않았으면 로딩 상태 표시
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3182F6]"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  // 결제 폼이 표시되는 경우
  if (showPaymentForm && paymentData) {
    return (
      <div className="min-h-screen bg-white font-['Noto_Sans_KR',_'Inter',_sans-serif]">
        <Suspense fallback={null}>
          <ParamsInitializer />
        </Suspense>
        {/* 상단 로고 및 헤더 */}
        <header className="border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPaymentForm(false)
                  setPaymentData(null)
                  router.back()
                }}
                className="p-0 h-auto text-gray-700 hover:text-gray-900 hover:bg-transparent"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>보안 결제</span>
              </div>
            </div>
            
            {/* 토스 로고 스타일 */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">결제하기</h1>
              <p className="text-gray-500 text-sm">안전하고 간편한 결제를 시작해보세요</p>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* 결제 금액 - 토스 스타일 강조 */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-gray-900 mb-3">
              {parseInt(paymentData.amount).toLocaleString()}원
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
              <CheckCircle className="w-4 h-4" />
              {paymentData.manufacturer} {paymentData.modelName} 인증서
            </div>
          </div>

          {/* 주문 정보 - 공식 샘플과 동일한 구조 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-5 text-lg">주문 상품</h3>
            
            {/* 상품 정보 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">인증서 발급</h3>
                  <p className="text-gray-600">
                    {paymentData.manufacturer} {paymentData.modelName} ({paymentData.manufactureYear}년)
                  </p>
                  {paymentData.country && (
                    <p className="text-gray-600">수출국가: {paymentData.country}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {parseInt(paymentData.amount).toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* 금액 정보 */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{parseInt(paymentData.amount).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-gray-900 border-t pt-2">
                <span>총 결제 금액</span>
                <span>{parseInt(paymentData.amount).toLocaleString()}원</span>
              </div>
            </div>

            {/* 주문자 정보 */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">주문자 정보</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">이름:</span> {user?.name || '김토스'}</p>
                <p><span className="font-medium">이메일:</span> {user?.email || 'customer@example.com'}</p>
                <p><span className="font-medium">휴대폰:</span> 010-1234-1234</p>
              </div>
            </div>
          </div>

          {/* 결제 정보 - 공식 샘플과 동일한 구조 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">결제 정보</h2>
            
            {/* 결제 UI */}
            <TossPaymentWidget
              amount={parseInt(paymentData.amount)}
              orderId={generateOrderId()}
              orderName={paymentData.title}
              customerKey={generateCustomerKey()}
              customerEmail={user?.email}
              customerName={user?.name}
              certificateId={paymentData.certificateId}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFail={handlePaymentFail}
            />
          </div>

        </main>
      </div>
    )
  }

  return null
}
