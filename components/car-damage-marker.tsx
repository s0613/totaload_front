'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface CarPart {
  name: string;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
}

// PDF 폼 필드 위치 기반 터치 영역 (퍼센트)
const partRegions: CarPart[] = [
  // 상단 뷰 (중앙)
  { name: 'hood', label: '후드', left: '47.5%', top: '18%', width: '4.9%', height: '8.5%' },
  { name: 'trunk', label: '트렁크', left: '47.5%', top: '78.1%', width: '4.9%', height: '8.5%' },
  // 좌측면
  { name: 'left_front_fender', label: '좌 프론트 펜더', left: '13.5%', top: '22.5%', width: '4.9%', height: '8.5%' },
  { name: 'left_front_door', label: '좌 앞도어', left: '12.1%', top: '38.2%', width: '4.9%', height: '8.5%' },
  { name: 'left_rear_door', label: '좌 뒷도어', left: '12.8%', top: '53.3%', width: '4.9%', height: '8.5%' },
  { name: 'left_rear_fender', label: '좌 리어 펜더', left: '14%', top: '69.8%', width: '4.9%', height: '8.5%' },
  // 우측면
  { name: 'right_front_fender', label: '우 프론트 펜더', left: '81.3%', top: '22.5%', width: '4.9%', height: '8.5%' },
  { name: 'right_front_door', label: '우 앞도어', left: '82.8%', top: '38.2%', width: '4.9%', height: '8.5%' },
  { name: 'right_rear_door', label: '우 뒷도어', left: '82.3%', top: '53.3%', width: '4.9%', height: '8.5%' },
  { name: 'right_rear_fender', label: '우 리어 펜더', left: '81.2%', top: '69.8%', width: '4.9%', height: '8.5%' },
];

interface CarDamageMarkerProps {
  /** 초기 마킹된 부위 목록 */
  initialMarkedParts?: string[];
  /** 마킹 변경 시 콜백 */
  onMarkingsChanged?: (markedParts: string[]) => void;
  /** 읽기 전용 모드 */
  readOnly?: boolean;
}

export default function CarDamageMarker({
  initialMarkedParts = [],
  onMarkingsChanged,
  readOnly = false,
}: CarDamageMarkerProps) {
  const [markedParts, setMarkedParts] = useState<Set<string>>(
    new Set(initialMarkedParts)
  );

  const toggleMark = useCallback(
    (partName: string) => {
      if (readOnly) return;

      setMarkedParts((prev) => {
        const next = new Set(prev);
        if (next.has(partName)) {
          next.delete(partName);
        } else {
          next.add(partName);
        }
        onMarkingsChanged?.(Array.from(next));
        return next;
      });
    },
    [readOnly, onMarkingsChanged]
  );

  const markedPartLabels = Array.from(markedParts)
    .map((name) => partRegions.find((p) => p.name === name)?.label ?? name)
    .sort();

  return (
    <div className="w-full">
      {/* 범례 */}
      {!readOnly && (
        <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          <span className="text-sm text-gray-700">
            도막 수치가 높은 부위를 클릭하여 X 표시하세요
          </span>
        </div>
      )}

      {/* 다이어그램 */}
      <div
        className="relative w-full"
        style={{ aspectRatio: '792 / 612' }}
      >
        {/* 배경 이미지 */}
        <Image
          src="/images/car_accident_diagram.png"
          alt="차량 다이어그램"
          fill
          className="object-contain"
          priority
        />

        {/* 터치 영역 오버레이 */}
        {partRegions.map((part) => {
          const isMarked = markedParts.has(part.name);
          return (
            <button
              key={part.name}
              onClick={() => toggleMark(part.name)}
              disabled={readOnly}
              className={`absolute flex items-center justify-center rounded transition-all
                ${
                  isMarked
                    ? 'bg-red-500/30 border-2 border-red-500'
                    : readOnly
                    ? 'border-transparent'
                    : 'border border-blue-300/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400/50 cursor-pointer'
                }
                ${readOnly && !isMarked ? 'pointer-events-none' : ''}
              `}
              style={{
                left: part.left,
                top: part.top,
                width: part.width,
                height: part.height,
              }}
              title={part.label}
            >
              {isMarked && (
                <span className="text-red-600 text-lg font-bold">X</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 마킹된 부위 목록 */}
      {markedParts.size > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-semibold text-red-700">
              마킹된 부위 ({markedParts.size}개)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {markedPartLabels.map((label) => (
              <span
                key={label}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
