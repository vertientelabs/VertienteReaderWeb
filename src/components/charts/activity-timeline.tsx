'use client';

interface TimelineItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: 'success' | 'danger' | 'warning' | 'primary';
}

interface ActivityTimelineProps {
  items: TimelineItem[];
}

const dotColors = {
  success: 'bg-[#30D158]',
  danger: 'bg-[#FF453A]',
  warning: 'bg-[#FF9F0A]',
  primary: 'bg-[#0A84FF]',
};

export default function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 mt-1 rounded-full flex-shrink-0 ${dotColors[item.type]}`} />
            <div className="w-px h-full bg-white/10 mt-1" />
          </div>
          <div className="flex-1 min-w-0 pb-3">
            <p className="text-sm font-medium text-[var(--text-primary)]">{item.action}</p>
            <p className="text-xs text-[var(--text-tertiary)] truncate">{item.detail}</p>
          </div>
          <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0 mt-0.5">{item.time}</span>
        </div>
      ))}
    </div>
  );
}
