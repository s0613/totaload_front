"use client";

import { useParams } from "next/navigation";
import CertificateDetail from "@/features/certificate/CertificateDetail";

export default function CertificateDetailPage() {
  const params = useParams();
  const certificateId = Number(params.id);

  if (!certificateId || isNaN(certificateId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">잘못된 인증서 ID</h2>
          <p className="text-gray-600 mb-4">유효하지 않은 인증서 ID입니다.</p>
        </div>
      </div>
    );
  }

  return <CertificateDetail certificateId={certificateId} />;
}
