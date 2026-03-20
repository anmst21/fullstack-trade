export type Tab = 'book' | 'trades';

interface TabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="flex items-center border-b border-white/5">
      {(['book', 'trades'] as Tab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={[
            'relative px-4 py-3 text-base font-medium transition-colors',
            active === tab
              ? 'text-[#fafafa] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#A1FF00]'
              : 'text-[#a7a7b7] hover:text-[#fafafa]',
          ].join(' ')}
        >
          {tab === 'book' ? 'Order Book' : 'Trades'}
        </button>
      ))}

      <button className="ml-auto px-4 py-3 text-[#a7a7b7] hover:text-[#fafafa] transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>
    </div>
  );
}
