import { registerPlugin } from '@capacitor/core';

export interface AutoBillingPlugin {
  // Accessibility
  isAccessibilityEnabled(): Promise<{ enabled: boolean }>;
  openAccessibilitySettings(): Promise<void>;

  // Notification Listener
  isNotificationListenerEnabled(): Promise<{ enabled: boolean }>;
  openNotificationListenerSettings(): Promise<void>;

  // Foreground Service
  startForegroundService(): Promise<{ success: boolean }>;
  stopForegroundService(): Promise<{ success: boolean }>;

  // Battery Optimization
  isIgnoringBatteryOptimizations(): Promise<{ ignoring: boolean }>;
  requestIgnoreBatteryOptimizations(): Promise<void>;

  // Clipboard
  isClipboardMonitorActive(): Promise<{ active: boolean }>;

  // Service Status
  getAllServiceStatus(): Promise<{
    foregroundService: boolean;
    accessibilityService: boolean;
    notificationListener: boolean;
    clipboardMonitor: boolean;
    batteryOptimizationIgnored: boolean;
    _errors?: Record<string, string>;
    _allOk?: boolean;
  }>;
  getServiceStatus(): Promise<{ running: boolean }>;

  // Transactions
  getPendingTransactions(): Promise<{ transactions: AutoCapturedTx[] }>;
  clearPendingTransactions(): Promise<void>;

  // Export
  exportXlsx(options: { base64: string; filename: string }): Promise<void>;
}

export interface AutoCapturedTx {
  id: string;
  amount: number;
  merchant: string;
  date: string;
  time: string;
  platform: string;
  type: string;
  source: string;
  category: string;
  note: string;
}

const AutoBilling = registerPlugin<AutoBillingPlugin>('AutoBilling');
export default AutoBilling;
