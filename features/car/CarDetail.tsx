"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CertificateService } from "../certificate/CertificateService";
import { api } from "@/lib/apiClient";

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  country: string;
  image?: string;
  options?: string[];
  engine?: string;
  transmission?: string;

  /* 추가 필드 */
  finalGrade?: string;
  finalScore?: number;
  registrationDate?: string;
  manufactureYear?: number;
  fuelType?: string;
  displacement?: string;
  inspectionNation?: string;
  inspectionCenter?: string;
  evaluatorNo?: string;
  evaluatorName?: string;
  inspectionDate?: string;
  issueNumber?: string;
  issueDate?: string;
  validityPeriod?: string;
  issuingAuthority?: string;
  rentalUse?: boolean;
  fuelMod?: boolean;
  commercialUse?: boolean;
  seatMod?: boolean;
  officialUse?: boolean;
  mufflerMod?: boolean;
  tireStatus?: string;
  boltLoose?: boolean;
  evaluatorComment?: string;

  /* 히스토리(손상 부위·사진 등) */
  historyDiagram?: string;          // 차량 상단 뷰 다이어그램 이미지
  historyImages?: string[];         // 개별 파손 사진
}

interface CarDetailProps {
  vehicle: Vehicle; // vehicle을 필수로 변경
}

export default function CarDetail({ vehicle }: CarDetailProps) {
  const router = useRouter();
  const [showCertificate, setShowCertificate] = useState(false);
  
  if (!vehicle)
    return (
      <div className="w-full text-center py-10 text-lg">차량 정보를 찾을 수 없습니다.</div>
    );

  return (
    <div className="mx-auto w-full max-w-6xl bg-white p-6 shadow-lg">
      {/* ────────────────── 헤더 ────────────────── */}
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          {/* 뒤로가기 화살표 */}
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => router.back()}
            className="mr-2 rounded-full p-2 hover:bg-gray-100"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide">
              AUTOMOBILE QUALITY REPORT
            </h1>
            <h2 className="text-sm text-gray-600 mt-1">CERTIFIED BY Q.LOAD</h2>
          </div>
        </div>
        {/* 인증서(PDF) 다운로드 버튼 - 헤더 우측 */}
        <button
          type="button"
          onClick={() => setShowCertificate(true)}
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          인증서 발급
        </button>
      </header>
      {/* ────────────────── 본문 ────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* ① 좌측 영역 : 차량 사진 + Vehicle / Inspection 정보 */}
        <section className="space-y-6">
          {/* 차량 사진 */}
          <div className="aspect-video overflow-hidden rounded-md border">
            {vehicle.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vehicle.image}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                차량 이미지
              </div>
            )}
          </div>

          {/* Vehicle information */}
          <InfoPanel title="Vehicle information">
            <InfoRow
              label="Maker / Car Name"
              sub="제조사 / 차량명"
              value={`${vehicle.make ?? "-"} / ${vehicle.model ?? "-"}`}
            />
            <InfoRow
              label="Chassis / VIN Code"
              sub="차대번호"
              value={vehicle.vin ?? "-"}
            />
            <InfoRow
              label="Initial Registration Date"
              sub="최초 등록일"
              value={vehicle.registrationDate ?? "2020-06-01"}
            />
            <InfoRow
              label="Year of Manufacture"
              sub="제조연도"
              value={`${vehicle.manufactureYear ?? vehicle.year ?? "-"}`}
            />
            <InfoRow
              label="Fuel Type"
              sub="사용 연료"
              value={vehicle.fuelType ?? "LPG"}
            />
            <InfoRow
              label="Car Displacement"
              sub="배기량"
              value={vehicle.displacement ?? "1,999 cc"}
            />
            <InfoRow
              label="Mileage"
              sub="주행거리"
              value={`${vehicle.mileage?.toLocaleString() ?? "-"} km`}
            />
          </InfoPanel>

          {/* Inspection Details */}
          <InfoPanel title="Inspection Details">
            <InfoRow
              label="Nation of Inspection"
              sub="검사 국가"
              value={vehicle.inspectionNation ?? "Republic of Korea"}
            />
            <InfoRow
              label="Inspection Center"
              sub="검사 센터"
              value={
                vehicle.inspectionCenter ??
                "KCIE | 한국 자동차산업 수출협동조합"
              }
            />
            <InfoRow
              label="Evaluator No."
              sub="평가사 번호"
              value={vehicle.evaluatorNo ?? "rnrnrkrk1234"}
            />
            <InfoRow
              label="Date of Inspection"
              sub="검사 일자"
              value={vehicle.inspectionDate ?? "2025-05-31"}
            />
            <InfoRow
              label="Issue Number"
              sub="발급 번호"
              value={vehicle.issueNumber ?? "D2505231445522ITK"}
            />
            <InfoRow
              label="Date of Issuance"
              sub="발급 일자"
              value={vehicle.issueDate ?? "2025-05-31"}
            />
            <InfoRow
              label="Validity Period"
              sub="유효 기간"
              value={vehicle.validityPeriod ?? "2026-05-31"}
            />
            <InfoRow
              label="Issuing Authority"
              sub="발급 기관"
              value={
                vehicle.issuingAuthority ??
                "KCIE | 한국 자동차산업 수출협동조합"
              }
            />
          </InfoPanel>
        </section>

        {/* ② 우측 영역 : Grade / History / Mod 항목 */}
        <section className="space-y-6">
          {/* Grade */}
          <div className="rounded-md border p-4">
            <h3 className="mb-4 text-lg font-semibold">Grade</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm font-medium">Final Grade<br />최종 등급</p>
                <p className="mt-1 text-3xl font-bold">
                  {vehicle.finalGrade ?? "A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Final Score<br />최종 점수</p>
                <p className="mt-1 text-3xl font-bold">
                  {vehicle.finalScore ?? 95}
                </p>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="rounded-md border p-4">
            <h3 className="mb-4 text-lg font-semibold">History</h3>
            <div className="flex flex-wrap gap-4">
              {/* 차량 손상 다이어그램 */}
              {vehicle.historyDiagram ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={vehicle.historyDiagram}
                  alt="History Diagram"
                  className="h-40 w-28 object-contain"
                />
              ) : (
                <div className="flex h-40 w-28 items-center justify-center text-gray-400">
                  Diagram
                </div>
              )}

              {/* 개별 사진 */}
              {(vehicle.historyImages ?? []).map((src, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  src={src}
                  alt={`History ${idx + 1}`}
                  className="h-20 w-20 object-cover"
                />
              ))}
            </div>
          </div>

          {/* 사용/개조 정보 */}
          <div className="rounded-md border p-4">
            <div className="grid grid-cols-3 gap-y-2 text-sm">
              <FlagRow label="Rental Use" sub="대여용도 사용" value={vehicle.rentalUse} />
              <FlagRow label="Fuel Mod" sub="연료 개조" value={vehicle.fuelMod} />
              <FlagRow label="Commercial Use" sub="영업용도 사용" value={vehicle.commercialUse} />
              <FlagRow label="Seat Mod" sub="좌석 개조" value={vehicle.seatMod} />
              <FlagRow label="Official Use" sub="관용용도 사용" value={vehicle.officialUse} />
              <FlagRow label="Muffler Mod" sub="마후라 개조" value={vehicle.mufflerMod} />
            </div>

            {/* 타이어·볼트 상태 */}
            <div className="mt-4 space-y-1 text-sm">
              <p>타이어잔량 60% 이하: {vehicle.tireStatus ?? "B, D, F, G"}</p>
              <p>볼트풀림: {vehicle.boltLoose ? "C" : "-"}</p>
            </div>
          </div>
        </section>
      </div>

      {/* ────────────────── 평가사 코멘트 및 다운로드 ────────────────── */}
      <section className="mt-8">
        <h3 className="mb-2 text-lg font-semibold">Evaluator Comment</h3>
        <div className="min-h-[48px] rounded-md border p-3 text-sm">
          {vehicle.evaluatorComment ??
            "이 차량은 전반적으로 우수한 상태를 유지하고 있습니다."}
        </div>
        {/* 다운로드 버튼은 헤더로 이동했으므로 이곳에서는 제거 */}
      </section>

      {/* ────────────────── 각주 (필요 시) ────────────────── */}
      <footer className="mt-10 border-t pt-4 text-xs leading-relaxed text-gray-500">
        Inspected by 평가관 (NO.{vehicle.evaluatorNo ?? "rnrnrkrk1234"}) on{" "}
        {vehicle.inspectionDate ?? "2025.05.31"} 18:00<br />
        1. This evaluation report is based on data prepared by the quality
        evaluator on the date of inspection.<br />
        2. This evaluation report is valid for 60&nbsp;days (2&nbsp;months) from
        the date of issuance.<br />
        3. The issuance of this evaluation can be checked on the KAQI website.
      </footer>

      {/* 인증서 발급 모달 */}
      {showCertificate && (
        <IssuanceCertificate
          vehicle={vehicle}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

/* ────────────────── 인증서 발급 모달 컴포넌트 ────────────────── */



interface IssuanceCertificateProps {
  vehicle: Vehicle;
  onClose: () => void;
}

function IssuanceCertificate({ vehicle, onClose }: IssuanceCertificateProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<any | null>(null); // CertificateResponse 대신 any 사용

  const handleIssueCertificate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CertificateService.issueCertificateRequest(parseInt(vehicle.id));
      setCertificate(response);
    } catch (err) {
      console.error('인증서 발급 에러:', err);
      
      // 에러 메시지 처리
      let errorMessage = '인증서 발급에 실패했습니다.';
      
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('인증')) {
          errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        } else if (err.message.includes('403') || err.message.includes('권한')) {
          errorMessage = '인증서 발급 권한이 없습니다. 관리자에게 문의해주세요.';
        } else if (err.message.includes('404')) {
          errorMessage = '인증서 발급 서비스를 찾을 수 없습니다.';
        } else if (err.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('시간이 초과')) {
          errorMessage = '요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificate) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📥 PDF 다운로드 시작:', certificate.certNumber);
      
      // downloadCertificate 메서드가 없으므로 PDF 열기 사용
      await CertificateService.openCertificatePdf(certificate.pdfFilePath);
      console.log('✅ PDF 열기 완료');
      onClose();
    } catch (err) {
      console.error('❌ PDF 다운로드 실패:', err);
      setError(err instanceof Error ? err.message : 'PDF 다운로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">인증서 발급</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
            disabled={isLoading}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">인증서 발급 실패</p>
                <p className="mt-1">{error}</p>
                {error.includes('로그인이 필요합니다') && (
                  <button
                    onClick={() => {
                      onClose();
                      // router.push('/login'); // ← 기존 코드에서 로그인 페이지로 이동
                      // 에러 발생 시 루트로 이동하지 않도록 수정, 로그만 남김
                      console.log('로그인 필요 에러 발생, 페이지 이동 없음');
                    }}
                    className="mt-2 rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                  >
                    로그인 페이지로 이동
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!certificate ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p><strong>차량 정보:</strong></p>
              <p>• 제조사: {vehicle.make}</p>
              <p>• 모델: {vehicle.model}</p>
              <p>• VIN: {vehicle.vin}</p>
              <p>• 주행거리: {vehicle.mileage?.toLocaleString()} km</p>
            </div>
            
            {/* 개발 환경에서 API 정보 표시 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
                <p><strong>개발 정보:</strong></p>
                <p>• API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}</p>
                <p>• 인증 상태: {'로그인 상태 확인 불가'}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={handleIssueCertificate}
                disabled={isLoading}
                className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '발급 중...' : '인증서 발급'}
              </button>
              {error && (
                <button
                  onClick={() => {
                    setError(null);
                    handleIssueCertificate();
                  }}
                  disabled={isLoading}
                  className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  다시 시도
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              <p><strong>인증서 발급 완료!</strong></p>
              <p>인증번호: {certificate.certNumber}</p>
              <p>발급일자: {certificate.issueDate}</p>
              <p>유효기간: {certificate.expireDate}</p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isLoading}
                className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? '다운로드 중...' : 'PDF 다운로드'}
              </button>
              
              {/* 대체 다운로드 방법: 서버에서 PDF 경로를 제공하는 경우 */}
              {certificate.pdfFilePath && (
                <button
                  onClick={() => {
                    // 새 창에서 PDF 열기
                    window.open(certificate.pdfFilePath, '_blank');
                  }}
                  className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  새 창에서 PDF 보기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────── 보조 컴포넌트 ────────────────── */

interface InfoPanelProps {
  title: string;
  children: React.ReactNode;
}
function InfoPanel({ title, children }: InfoPanelProps) {
  return (
    <div className="rounded-md border">
      <div className="rounded-t-md bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-2 text-sm font-semibold text-white">
        {title}
      </div>
      <div className="divide-y text-sm">{children}</div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  sub: string;
  value: string;
}
function InfoRow({ label, sub, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-x-4 px-4 py-2">
      <div className="font-medium">
        {label}
        <br />
        <span className="text-gray-500">{sub}</span>
      </div>
      <div>{value}</div>
    </div>
  );
}

interface FlagRowProps {
  label: string;
  sub: string;
  value: boolean | undefined;
}
function FlagRow({ label, sub, value }: FlagRowProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 font-medium">
        {label}
        <br />
        <span className="text-gray-500">{sub}</span>
      </span>
      <span className="ml-auto">{value ? "O" : "X"}</span>
    </div>
  );
}
