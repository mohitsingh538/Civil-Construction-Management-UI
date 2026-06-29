import { Sparkles } from 'lucide-react';
import AnimatedPressable from '@/app/components/ui/AnimatedPressable';

interface Props {
  onOpenReader: () => void;
}

export function AiInvoiceReaderButton({ onOpenReader }: Props) {
  return (
    <AnimatedPressable
      type="button"
      onClick={onOpenReader}
      className="w-full px-3 py-2.5 mt-3 rounded-xl text-[#9CA3AF] text-sm font-medium flex items-center justify-center gap-2 border border-white/[0.06]"
      style={{
        background: '#141420',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <Sparkles className="w-4 h-4 text-[#818CF8] opacity-80" />
      Use AI Invoice Reader
    </AnimatedPressable>
  );
}
