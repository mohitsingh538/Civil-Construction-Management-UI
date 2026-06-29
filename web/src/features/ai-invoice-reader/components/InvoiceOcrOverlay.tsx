import { useMemo } from 'react';
import type { OcrTextBox } from '@core/ai-invoice';

interface Props {
  imageUrl: string;
  boxes: OcrTextBox[];
  className?: string;
}

export function InvoiceOcrOverlay({ imageUrl, boxes, className = '' }: Props) {
  const sorted = useMemo(
    () => [...boxes].sort((a, b) => b.confidence - a.confidence),
    [boxes],
  );

  return (
    <div className={`relative w-full overflow-hidden rounded-xl ${className}`}>
      <img
        src={imageUrl}
        alt="Invoice scan"
        className="w-full h-auto block"
        draggable={false}
      />
      <div className="absolute inset-0 pointer-events-none">
        {sorted.map((box, i) => (
          <div
            key={`${box.text}-${i}`}
            className="absolute border-2 rounded-sm"
            style={{
              left: `${box.x * 100}%`,
              top: `${box.y * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 100}%`,
              borderColor:
                box.confidence >= 0.85
                  ? 'rgba(16,185,129,0.9)'
                  : box.confidence >= 0.65
                    ? 'rgba(99,102,241,0.85)'
                    : 'rgba(245,158,11,0.8)',
              backgroundColor:
                box.confidence >= 0.85
                  ? 'rgba(16,185,129,0.12)'
                  : 'rgba(99,102,241,0.1)',
            }}
            title={`${box.text} (${Math.round(box.confidence * 100)}%)`}
          />
        ))}
      </div>
    </div>
  );
}
