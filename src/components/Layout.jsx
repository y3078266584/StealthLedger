import { useState, useEffect } from 'react';
import { Menu, LayoutDashboard, ListFilter, Tags, PiggyBank, Settings, Upload, Clipboard } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: '仪表板', labelEn: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: '交易记录', labelEn: 'Transactions', icon: ListFilter },
  { id: 'categories', label: '分类管理', labelEn: 'Categories', icon: Tags },
  { id: 'budget', label: '预算管理', labelEn: 'Budget', icon: PiggyBank },
  { id: 'import', label: '导入账单', labelEn: 'Import', icon: Upload },
  { id: 'settings', label: '设置', labelEn: 'Settings', icon: Settings },
];

export default function Layout({ children, activePage, onNavigate, pageKey }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pt-[var(--safe-top)] animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-[var(--safe-top)] bottom-0 left-0 z-50 w-60
        flex flex-col
        bg-white/80 backdrop-blur-xl
        border-r border-slate-200/50
        transition-transform duration-300 ease-out
        shadow-xl md:shadow-none
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-200/50" />
              <Clipboard className="relative w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight">影记</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Stealth Ledger</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 relative group
                  ${isActive
                    ? 'bg-indigo-50/80 text-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                )}
                <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'
                }`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100/80">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <span className="font-mono">v1.1.1</span>
            <span className="text-slate-300">·</span>
            <span>数据仅存储在本地</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100/80 transition-colors"
            aria-label="打开菜单"
          >
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-[15px] font-semibold text-slate-800 tracking-tight">
            {NAV_ITEMS.find((n) => n.id === activePage)?.label || ''}
          </h2>
          <span className="ml-auto text-[10px] text-slate-400 font-mono bg-slate-100/80 px-2 py-0.5 rounded-full border border-slate-200/50">
            v1.1.1
          </span>
        </header>

        {/* Content */}
        <main key={pageKey || activePage} className="flex-1 overflow-y-auto p-4 md:p-6 animate-slideUp-sm">
          {children}
        </main>
      </div>
    </div>
  );
}