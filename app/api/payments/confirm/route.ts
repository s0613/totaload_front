import { NextRequest, NextResponse } from "next/server"

// 토스페이먼츠 시크릿 키 (환경변수에서 가져옴)
const SECRET_KEY = process.env.TOSS_SECRET_KEY

if (!SECRET_KEY) {
  console.error("TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.")
}

export async function POST(request: NextRequest) {
  try {
    if (!SECRET_KEY) {
      return NextResponse.json(
        { error: "결제 시스템 설정 오류입니다." },
        { status: 500 }
      )
    }

    const { paymentKey, orderId, amount } = await request.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      )
    }

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("토스페이먼츠 API 오류:", responseData)
      return NextResponse.json(
        { 
          error: "결제 승인에 실패했습니다.",
          details: responseData 
        },
        { status: response.status }
      )
    }

    // 결제 승인 성공 시 추가 처리 로직
    // 예: 데이터베이스에 결제 정보 저장, 인증서 발급 요청 등
    
    console.log("결제 승인 성공:", responseData)

    // 성공 응답
    return NextResponse.json({
      success: true,
      paymentKey: responseData.paymentKey,
      orderId: responseData.orderId,
      totalAmount: responseData.totalAmount,
      method: responseData.method,
      approvedAt: responseData.approvedAt,
      status: responseData.status,
      customerEmail: responseData.customerEmail,
      customerName: responseData.customerName,
      orderName: responseData.orderName,
    })

  } catch (error) {
    console.error("결제 승인 처리 중 오류:", error)
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
