interface ModeSelectorProps {
  activeTab: 'patient' | 'laboratory';
  onTabChange: (tab: 'patient' | 'laboratory') => void;
  isTransitioning: boolean;
}

export function ModeSelector({
  activeTab,
  onTabChange,
  isTransitioning,
}: ModeSelectorProps) {
  return (
    <div className='flex justify-center mb-6'>
      <div className='mode-selector'>
        <button
          onClick={() => onTabChange('patient')}
          className={`mode-button ${activeTab === 'patient' ? 'active' : ''}`}
          disabled={isTransitioning}
        >
          Patient
        </button>
        <button
          onClick={() => onTabChange('laboratory')}
          className={`mode-button ${
            activeTab === 'laboratory' ? 'active' : ''
          }`}
          disabled={isTransitioning}
        >
          Laboratory
        </button>
      </div>
    </div>
  );
}
