import { useState, useEffect, useCallback } from 'react';
import { Shield, Bell, Monitor, Download, Trash2, Smartphone, Zap, AlertTriangle, Power, Battery, RefreshCw, XCircle, CheckCircle, Clock } from 'lucide-react';
import { getAll, remove } from '../utils/db.js';
import AutoBilling from '../plugin/autoBilling.js';

const SERVICE_LABELS = {
  foregroundService: '后台保活服务',
  accessibilityService: '无障碍服务',
  notificationListener: '通知栏监听',
  clipboardMonitor: '剪贴板监听',
  batteryOptimizationIgnored: '电池优化豁免',
};

export default function Settings({ onExport, onClearAll, autoCaptureEnabled }) {
  const [dataCount, setDataCount] = useState({ transactions: 0, categories: 0, budgets: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [serviceStatus, setServiceStatus] = useState({
    foregroundService: false,
    accessibilityService: false,
    notificationListener: false,
    clipboardMonitor: false,
    batteryOptimizationIgnored: false,
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Auto-clear action feedback after 3s
  useEffect(() => {
    if (actionFeedback) {
      const t = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionFeedback]);
  const [fieldErrors, setFieldErrors] = useState({});

  // Auto-refresh on mount
  useEffect(() => {
    loadDataCounts();
    refreshStatus();
  }, []);

  // Auto-refresh when user returns from system settings (visibility change)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const loadDataCounts = async () => {
    const txs = await getAll('transactions');
    const cats = await getAll('categories');
    const buds = await getAll('budgets');
    setDataCount({ transactions: txs.length, categories: cats.length, budgets: buds.length });
  };

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    setFieldErrors({});

    try {
      const status = await AutoBilling.getAllServiceStatus();
      setServiceStatus({
        foregroundService: status.foregroundService ?? false,
        accessibilityService: status.accessibilityService ?? false,
        notificationListener: status.notificationListener ?? false,
        clipboardMonitor: status.clipboardMonitor ?? false,
        batteryOptimizationIgnored: status.batteryOptimizationIgnored ?? false,
      });

      // Check for per-field errors
      if (status._errors && Object.keys(status._errors).length > 0) {
        setFieldErrors(status._errors);
      }

      if (!status._allOk && status._errors) {
        setStatusError('部分服务状态获取失败，请检查权限设置');
      }
    } catch (e) {
      console.error('Status check failed:', e);
      // Bulk call failed entirely, try individual checks as fallback
      setStatusError('批量查询失败，尝试逐个检查...');
      try {
        let accEn = false, notifEn = false, battEn = false, fgEn = false, clipEn = false;
        try { const r = await AutoBilling.isAccessibilityEnabled(); accEn = r.enabled; } catch {}
        try { const r = await AutoBilling.isNotificationListenerEnabled(); notifEn = r.enabled; } catch {}
        try { const r = await AutoBilling.isIgnoringBatteryOptimizations(); battEn = r.ignoring; } catch {}
        try { const r = await AutoBilling.isClipboardMonitorActive(); clipEn = r.active; } catch {}
        setServiceStatus({
          foregroundService: fgEn,
          accessibilityService: accEn,
          notificationListener: notifEn,
          clipboardMonitor: clipEn,
          batteryOptimizationIgnored: battEn,
        });
        setStatusError('已通过逐个查询恢复部分状态（可能不完整）');
      } catch {
        setStatusError('无法连接到原生服务，请在手机上运行此应用');
      }
    }

    setLastRefresh(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setStatusLoading(false);
  }, []);

  const openAccessibility = async () => {
    try {
      await AutoBilling.openAccessibilitySettings();
    } catch (e) {
      alert('请在手机设置 → 无障碍 → 已安装的服务 中开启');
    }
  };

  const openNotification = async () => {
    try {
      await AutoBilling.openNotificationListenerSettings();
    } catch (e) {
      alert('请在手机设置 → 通知使用权 中开启');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
      setActionFeedback({ type: 'success', text: '导出成功！文件已保存' });
    } catch (e) {
      setActionFeedback({ type: 'error', text: '导出失败，请重试' });
    }
    setExporting(false);
  };

  const handleClearAll = async () => {
    try {
      const count = await onClearAll();
      setShowClearConfirm(false);
      loadDataCounts();
      if (count > 0) {
        setActionFeedback({ type: 'success', text: `已清空 ${count} 条交易记录` });
      }
    } catch (e) {
      setActionFeedback({ type: 'error', text: '清空失败，请重试' });
      setShowClearConfirm(false);
    }
  };

  const openBattery = async () => {
    try {
      await AutoBilling.requestIgnoreBatteryOptimizations();
    } catch (e) {
      alert('请在手机设置 → 电池 → 电池优化 中将本应用设为不优化');
    }
  };

  const startFgService = async () => {
    try {
      await AutoBilling.startForegroundService();
      // Small delay to let foreground service fully start
      setTimeout(() => refreshStatus(), 800);
    } catch (e) {
      setStatusError('启动后台服务失败: ' + e.message);
      setTimeout(() => setStatusError(null), 4000);
    }
  };

  const statusBadge = (enabled) => (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
      enabled ? 'text-green-600 bg-green-50' : 'text-amber-500 bg-amber-50'
    }`}>
      {enabled ? '✓ 运行中' : '未开启'}
    </span>
  );

  const StatusRow = ({ keyName, showStartButton }) => (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          statusLoading ? 'bg-slate-300 animate-pulse' :
          serviceStatus[keyName] ? 'bg-green-500' : 'bg-slate-300'
        }`} />
        <span className="text-sm text-slate-600">
          {SERVICE_LABELS[keyName]}
          {fieldErrors[keyName] && (
            <span className="ml-1 text-[10px] text-red-400" title={fieldErrors[keyName]}>⚠</span>
          )}
        </span>
      </div>
      {keyName === 'foregroundService' && !serviceStatus.foregroundService && !statusLoading ? (
        <button onClick={startFgService} className="text-xs text-indigo-500 font-medium hover:underline">
          启动
        </button>
      ) : (
        statusBadge(serviceStatus[keyName])
      )}
    </div>
  );

  return (
    <div className="space-y-4 max-w-lg">
      {/* Service Status Overview */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Power className="w-4 h-4 text-indigo-500" /> 服务状态
          </h3>
          <div className="flex items-center gap-1">
            {lastRefresh && !statusLoading && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Clock className="w-3 h-3" /> {lastRefresh}
              </span>
            )}
            <button
              onClick={refreshStatus}
              disabled={statusLoading}
              className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-50 transition-colors"
              title="刷新状态"
            >
              <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status error banner */}
        {statusError && (
          <div className={`mb-2 p-2 rounded-lg text-xs flex items-start gap-1.5 ${
            statusError.includes('不完整') || statusError.includes('逐个')
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-600'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="flex-1">{statusError}</span>
            <button
              onClick={() => setStatusError(null)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="space-y-2">
          <StatusRow keyName="foregroundService" showStartButton />
          <StatusRow keyName="accessibilityService" />
          <StatusRow keyName="notificationListener" />
          <StatusRow keyName="clipboardMonitor" />
          <StatusRow keyName="batteryOptimizationIgnored" />
        </div>

        {Object.keys(fieldErrors).length > 0 && (
          <details className="mt-2 text-[10px] text-slate-400">
            <summary className="cursor-pointer hover:text-slate-600">查看错误详情</summary>
            <div className="mt-1 space-y-0.5 pl-2 border-l border-slate-200">
              {Object.entries(fieldErrors).map(([k, v]) => (
                <div key={k}>{SERVICE_LABELS[k] || k}: {v}</div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className={`rounded-xl p-3 text-sm flex items-center gap-2 animate-pulse ${
          actionFeedback.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-600'
        }`}>
          {actionFeedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{actionFeedback.text}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Auto Capture Services */}
      <div className="bg-white rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> 自动捕获服务
        </h3>

        <div className="space-y-3">
          {/* Accessibility */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-700">无障碍服务</div>
                <div className="text-xs text-slate-400">自动识别支付页面并提取金额</div>
              </div>
            </div>
            <button
              onClick={openAccessibility}
              className="text-xs text-indigo-500 font-medium hover:underline"
            >
              {serviceStatus.accessibilityService ? '已开启' : '去开启 →'}
            </button>
          </div>

          {/* Notification Listener */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-700">通知栏监听</div>
                <div className="text-xs text-slate-400">从支付通知中自动提取金额</div>
              </div>
            </div>
            <button
              onClick={openNotification}
              className="text-xs text-indigo-500 font-medium hover:underline"
            >
              {serviceStatus.notificationListener ? '已开启' : '去开启 →'}
            </button>
          </div>

          {/* Battery Optimization */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Battery className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-700">电池优化豁免</div>
                <div className="text-xs text-slate-400">防止系统在后台杀死记账服务</div>
              </div>
            </div>
            <button
              onClick={openBattery}
              className="text-xs text-indigo-500 font-medium hover:underline"
            >
              {serviceStatus.batteryOptimizationIgnored ? '已豁免' : '去设置 →'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-500" /> 数据管理
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm text-slate-600">交易记录</div>
              <div className="text-xs text-slate-400">{dataCount.transactions} 条</div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm text-slate-600">分类</div>
              <div className="text-xs text-slate-400">{dataCount.categories} 个</div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm text-slate-600">预算</div>
              <div className="text-xs text-slate-400">{dataCount.budgets} 条</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 py-2.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-xl hover:bg-indigo-100 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> 导出中...</>
            ) : (
              <><Download className="w-4 h-4" /> 导出数据</>
            )}
          </button>
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 py-2.5 bg-red-50 text-red-500 text-sm font-medium rounded-xl hover:bg-red-100 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> 清空数据
            </button>
          ) : (
            <div className="flex-1 flex gap-1">
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl"
              >
                确认清空
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-2.5 bg-slate-100 text-slate-600 text-sm rounded-xl"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Persistence Guide */}
      <div className="bg-white rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" /> 如何保持服务常驻
        </h3>
        <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
          <p>1. 开启上方三项服务（无障碍 + 通知监听 + 电池豁免）</p>
          <p>2. 后台保活服务会自动启动，通知栏显示"正在后台监听支付行为"</p>
          <p>3. 系统每 15 分钟自动检查服务状态，被杀后自动恢复</p>
          <p>4. 手机重启后自动启动所有监听服务</p>
          <p className="font-medium text-slate-600 mt-2">建议额外设置（各品牌手机路径不同）：</p>
          <p>• 将应用锁定在最近任务列表（防止上滑清除）</p>
          <p>• 允许应用自启动（手机管家 → 自启动管理）</p>
          <p>• 关闭省电模式对此应用的限制</p>
          <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-700 text-[11px]">
              无障碍服务和通知监听仅在支付页面/通知出现时读取金额信息，不会获取任何密码、验证码等敏感数据。所有数据仅存储在本地。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
