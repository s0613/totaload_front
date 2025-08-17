"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CertificateService, Certificate } from "./CertificateService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Calendar, FileText, Car, User, AlertTriangle, CheckCircle } from "lucide-react";

interface CertificateDetailProps {
  certificateId: number;
}

export default function CertificateDetail({ certificateId }: CertificateDetailProps) {
  const router = useRouter();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDownloadPdf = async () => {
    try {
      await CertificateService.downloadCertificatePdf(
        certificate.pdfFilePath, 
        `certificate_${certificate.certNumber}.pdf`
      );
      toast.success('PDF 다운로드가 시작되었습니다.');
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      toast.error('PDF 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/certificates')}
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">인증서 상세정보</h1>
                <p className="text-gray-600 mt-1">인증번호: {certificate.certNumber}</p>
              </div>
            </div>
            <Button
              onClick={handleDownloadPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              인증서 발급
            </Button>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 기본 정보 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 인증서 상태 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <h3 className="text-lg font-semibold">인증서 상태</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">상태</span>
                    <span className={`font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {isValid ? '유효' : '만료'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">남은 일수</span>
                    <span className={`font-semibold ${isValid ? 'text-blue-600' : 'text-red-600'}`}>
                      {isValid ? `${daysUntilExpiry}일` : '만료됨'}
                    </span>
                  </div>
                  {isExpiringSoon && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-800 text-sm font-medium">만료 임박</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 인증서 정보 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">인증서 정보</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">발급일</span>
                    <span className="text-sm font-medium">
                      {new Date(certificate.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">만료일</span>
                    <span className="text-sm font-medium">
                      {new Date(certificate.expireDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">검사일</span>
                    <span className="text-sm font-medium">
                      {new Date(certificate.inspectDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">발급기관</span>
                    <span className="text-sm font-medium">{certificate.issuedBy}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 검사원 정보 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold">검사원 정보</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">검사원 코드</span>
                    <span className="text-sm font-mono font-medium">{certificate.inspectorCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">검사원명</span>
                    <span className="text-sm font-medium">{certificate.inspectorName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 우측: 차량 정보 및 상세 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 차량 정보 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Car className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-semibold">차량 정보</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">제조사</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{certificate.manufacturer}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">모델명</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{certificate.modelName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">제조년도</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{certificate.manufactureYear}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">VIN</label>
                      <p className="text-lg font-mono font-semibold text-gray-900 mt-1">{certificate.vin}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">최초등록일</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {new Date(certificate.firstRegisterDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">주행거리</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {certificate.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 인증서 요약 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">인증서 요약</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    본 인증서는 <strong>{certificate.manufacturer} {certificate.modelName}</strong> 차량에 대한 
                    수출자동차품질인증서(ISO 17024)입니다. 해당 차량은 {new Date(certificate.inspectDate).toLocaleDateString()}에 
                    실시된 검사를 통과하여 {new Date(certificate.issueDate).toLocaleDateString()}에 발급되었으며, 
                    {new Date(certificate.expireDate).toLocaleDateString()}까지 유효합니다.
                  </p>
                  
                  {!isValid && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="text-red-800 font-medium">인증서가 만료되었습니다</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        재검사를 받아 인증서를 갱신하시기 바랍니다.
                      </p>
                    </div>
                  )}
                  
                  {isExpiringSoon && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-800 font-medium">인증서 만료 임박</span>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        {daysUntilExpiry}일 후 만료됩니다. 만료일 이전에 재검사를 받으시기 바랍니다.
                      </p>
                    </div>
                  )}

                  {isValid && !isExpiringSoon && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">인증서가 유효합니다</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        {daysUntilExpiry}일 후 만료됩니다. 만료일 이전에 재검사를 받으시기 바랍니다.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}
