import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import { Info } from 'lucide-react';

interface RibbonTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode?: boolean;
}

export function RibbonTabs({ activeTab, onTabChange, isDarkMode = false }: RibbonTabsProps) {
  const { inputMessage } = useSpreadsheet();
  const tabs = [
    {
      id: 'home', label: 'Home',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM6 19H18V9.15745L12 3.7029L6 9.15745V19ZM8 15H16V17H8V15Z"></path></svg>
    },
    {
      id: 'insert', label: 'Insert',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 11V8L16 12L12 16V13H8V11H12ZM12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20Z"></path></svg>
    },
    {
      id: 'help', label: 'Help',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"></path></svg>
    },
  ];

  const GOLD_DARK = '#B8860B';
  const CREAM = '#fffdf0';

  return (
    <div
      style={{
        background: isDarkMode ? '#000000' : '#ffffff',
        borderBottom: isDarkMode
          ? '1px solid #374151'
          : '1px solid rgba(184,134,11,0.15)',
      }}
    >
      <div className="flex items-center h-10 px-2 overflow-x-auto gap-1 justify-center">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="ribbon-tab-button px-4 py-2 text-sm relative whitespace-nowrap flex items-center gap-1.5 min-w-[90px] justify-center rounded-none"
                style={{
                  color: isActive
                    ? (isDarkMode ? '#FFD700' : GOLD_DARK)
                    : (isDarkMode ? '#CCCCCC' : '#555555'),
                  background: isActive
                    ? (isDarkMode ? '#1a1a1a' : CREAM)
                    : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s ease',
                  border: isActive
                    ? `1.5px solid ${GOLD_DARK}`
                    : '1.5px solid rgba(184,134,11,0.25)',
                  borderRadius: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDarkMode ? GOLD_DARK : GOLD_DARK;
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = GOLD_DARK;
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(184,134,11,0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#555555';
                    e.currentTarget.style.borderColor = 'rgba(184,134,11,0.25)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
                aria-pressed={isActive}
              >
                <span style={{ color: 'inherit' }}>{tab.icon}</span>
                {tab.label}
                {/* Gold underline for active tab */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-2 right-2 rounded-full"
                    style={{
                      height: 2.5,
                      background: isDarkMode
                        ? '#FFD700'
                        : `linear-gradient(90deg, ${GOLD_DARK}, #FFD700, ${GOLD_DARK})`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Input Message */}
        {inputMessage && (
          <div
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #fffdf0 0%, #fff8d6 100%)',
              border: '1.5px solid rgba(184,134,11,0.3)',
              boxShadow: '0 2px 8px rgba(184,134,11,0.12)',
              maxWidth: '400px',
            }}
          >
            <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD_DARK }} />
            <div className="flex-1 min-w-0 overflow-hidden">
              {inputMessage.title && (
                <span className="font-semibold text-xs mr-1" style={{ color: '#1a1a1a' }}>
                  {inputMessage.title}:
                </span>
              )}
              {inputMessage.message && (
                <span className="text-xs" style={{ color: '#444' }}>
                  {inputMessage.message}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
