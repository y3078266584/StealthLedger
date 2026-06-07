import { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, ListFilter, Tags, PiggyBank, Settings, Upload, Clipboard } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: '仪表板', icon: LayoutDashboard },
  { id: 'transactions', label: '交易记录', icon: ListFilter },
  { id: 'categories', label: '分类管理', icon: Tags },
  { id: 'budget', label: '预算管理', icon: PiggyBank },
  { id: 'import', label: '导入账单', icon: Upload },
  { id: 'settings', label: '设置', icon: Settings },
];

export default function Layout({ children, activePage, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* 移动端遮罩 */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 pt-[var(--safe-top)] transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 侧边栏 */}
      <aside className={`
        fixed md:static top-[var(--safe-top)] bottom-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200/60
        flex flex-col transition-transform duration-300 shadow-2xl md:shadow-none
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Clipboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">影记</h1>
              <p className="text-[10px] text-slate-400 font-medium">Stealth Ledger</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${activePage === item.id
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <item.icon className={`w-5 h-5 ${activePage === item.id ? 'text-indigo-500' : ''}`} />
              {item.label}
              {activePage === item.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 text-center">v1.0.1 · 数据仅存储在本地</div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-base font-semibold text-slate-700">
            {NAV_ITEMS.find((n) => n.id === activePage)?.label || ''}
          </h2>
          <span className="ml-auto text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">v1.0.1</span>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
