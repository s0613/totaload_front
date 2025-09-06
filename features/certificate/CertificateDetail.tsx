"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CertificateService, Certificate } from "./CertificateService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, AlertTriangle, Heart, Share2, Star } from "lucide-react";

interface CertificateDetailProps {
  certificateId: number;
}

export default function CertificateDetail({ certificateId }: CertificateDetailProps) {
  const router = useRouter();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('vehicle');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!certificateId || isNaN(certificateId)) {
          throw new Error('유효하지 않은 인증서 ID입니다.');
        }

        const data = await CertificateService.getCertificateById(certificateId);
        setCertificate(data);
      } catch (error) {
        console.error('인증서 조회 실패:', error);
        
        let errorMessage = '인증서 정보를 불러오는데 실패했습니다.';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          const apiError = error as any;
          if (apiError.response?.status === 404) {
            errorMessage = '요청하신 인증서를 찾을 수 없습니다.';
          } else if (apiError.response?.status === 401) {
            errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
          } else if (apiError.response?.status === 403) {
            errorMessage = '해당 인증서에 접근할 권한이 없습니다.';
          } else if (apiError.response?.status >= 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          } else if (apiError.response?.data?.message) {
            errorMessage = apiError.response.data.message;
          }
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  // 인증서 상태 계산
  const isExpired = certificate ? new Date(certificate.expireDate) < new Date() : false;
  const daysUntilExpiry = certificate ? 
    Math.ceil((new Date(certificate.expireDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isValid = !isExpired;
  const isExpiringSoon = isValid && daysUntilExpiry <= 30;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">인증서 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/certificates')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로 돌아가기
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="ml-3"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">인증서를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 인증서 정보가 존재하지 않거나 삭제되었습니다.</p>
          <Button onClick={() => router.push('/certificates')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const handleIssueCertificate = () => {
    if (!certificate) {
      toast.error('인증서 정보가 없습니다.');
      return;
    }

    // 결제 진행 알림
    toast.info('결제 페이지로 이동합니다...');

    // 결제 페이지로 이동 (인증서 정보를 쿼리 파라미터로 전달)
    const paymentParams = new URLSearchParams({
      certificateId: certificate.id.toString(),
      manufacturer: certificate.manufacturer,
      modelName: certificate.modelName,
      manufactureYear: certificate.manufactureYear.toString(),
      amount: '70000', // 인증서 발급 비용
      service: 'certificate_issue',
      // 추가 정보
      vin: certificate.vin || '',
      country: certificate.country || '',
      orderName: `${certificate.manufacturer} ${certificate.modelName} 인증서 발급`
    });
    
    router.push(`/payments?${paymentParams.toString()}`);
  };

  // 차량 이미지들 (실제로는 certificate에서 가져오거나 기본 이미지 사용)
  const vehicleImages = [
    "/placeholder.jpg", // 메인 이미지
    "/placeholder.jpg", // 실내
    "/placeholder.jpg", // 외관
    "/placeholder.jpg", // 엔진룸
    "/placeholder.jpg"  // 트렁크
  ];

  // 품질 등급 계산 (A, B, C 등급)
  const getQualityGrade = () => {
    if (!certificate) return 'A';
    const age = new Date().getFullYear() - certificate.manufactureYear;
    const mileage = certificate.mileage;
    
    if (age <= 3 && mileage <= 50000) return 'A';
    if (age <= 5 && mileage <= 100000) return 'B';
    return 'C';
  };

  const getQualityScore = () => {
    const grade = getQualityGrade();
    return grade === 'A' ? 95 : grade === 'B' ? 85 : 75;
  };

  // 예상 인증서 발급 시간
  const getEstimatedTime = () => {
    return "약 2-3분";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 네비게이션 */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
            <div className="flex-1" />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 이미지 갤러리 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="relative aspect-[4/3] bg-white rounded-lg overflow-hidden shadow-sm border">
              <img
                src={vehicleImages[selectedImage]}
                alt={`${certificate?.manufacturer} ${certificate?.modelName}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  인증차량
                </span>
              </div>
            </div>

            {/* 썸네일 이미지들 */}
            <div className="flex space-x-2 overflow-x-auto">
              {vehicleImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`차량 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div className="space-y-6">
            {/* 상품명 및 기본 정보 */}
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{certificate?.manufacturer}</span>
                <span>•</span>
                <span>{certificate?.manufactureYear}년</span>
                <span>•</span>
                <span>{certificate?.mileage?.toLocaleString()}km</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {certificate?.manufacturer} {certificate?.modelName}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    품질등급 {getQualityGrade()} ({getQualityScore()}점)
                  </span>
                </div>
              </div>
            </div>

            {/* 가격 정보 (인증서 발급비용) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">인증서 발급</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">70,000 WON</div>
              <div className="text-sm text-gray-500">
                • 디지털 인증서 즉시 발급
              </div>
              <div className="text-sm text-gray-500">
                • PDF 다운로드 가능
              </div>
            </div>


            {/* 인증서 발급 버튼 */}
            <div className="space-y-3">
              <Button
                onClick={handleIssueCertificate}
                className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                인증서 발급하기
              </Button>
              
              {!isValid && (
                <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  ⚠️ 인증서가 만료되었습니다. 재검사 후 발급이 가능합니다.
                </div>
              )}
              
              {isValid && daysUntilExpiry <= 30 && (
                <div className="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                  ⚠️ {daysUntilExpiry}일 후 만료 예정입니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단: 상세 정보 탭 */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'vehicle', label: '차량정보' },
                { id: 'inspection', label: '검사내역' },
                { id: 'certificate', label: '인증서정보' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'vehicle' && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">차량 기본사항</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="제조사" value={certificate?.manufacturer || '-'} />
                  <InfoItem label="모델명" value={certificate?.modelName || '-'} />
                  <InfoItem label="제조년도" value={`${certificate?.manufactureYear || '-'}년`} />
                  <InfoItem label="차대번호(VIN)" value={certificate?.vin || '-'} />
                  <InfoItem label="최초등록일" value={certificate?.firstRegisterDate ? new Date(certificate.firstRegisterDate).toLocaleDateString() : '-'} />
                  <InfoItem label="주행거리" value={`${certificate?.mileage?.toLocaleString() || '-'} km`} />
                </div>
              </div>
            )}

            {activeTab === 'inspection' && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">검사 및 인증 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="검사일자" value={certificate?.inspectDate ? new Date(certificate.inspectDate).toLocaleDateString() : '-'} />
                  <InfoItem label="인증상태" value={isValid ? '유효' : '만료'} />
                  <InfoItem label="검사원 코드" value={certificate?.inspectorCode || '-'} />
                  <InfoItem label="검사원명" value={certificate?.inspectorName || '-'} />
                  <InfoItem label="품질등급" value={getQualityGrade()} />
                  <InfoItem label="품질점수" value={`${getQualityScore()}점`} />
                </div>
              </div>
            )}

            {activeTab === 'certificate' && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">인증서 발급 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="인증번호" value={certificate?.certNumber || '-'} />
                  <InfoItem label="발급일자" value={certificate?.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '-'} />
                  <InfoItem label="유효기간" value={certificate?.expireDate ? new Date(certificate.expireDate).toLocaleDateString() : '-'} />
                  <InfoItem label="발급기관" value="스마트 모빌리티 제 3자 인증 기관" />
                  <InfoItem label="PDF 상태" value={certificate?.pdfFilePath ? '준비됨' : '준비되지 않음'} />
                  <InfoItem label="발급 소요시간" value={getEstimatedTime()} />
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">인증서 안내사항</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    본 인증서는 상기 차량이 지정된 기준에 따라 검사 및 심사를 통과하였음을 확인하기 위해 발급됩니다. 
                    인증의 효력은 유효기간 내에 한하며, 기간 경과 시 재검사를 통해 갱신받아야 합니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// InfoItem 컴포넌트 정의
interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
