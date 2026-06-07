package com.autobilling.app;

import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;
import com.autobilling.plugin.AutoBillingPlugin;
import com.autobilling.service.BillingForegroundService;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "AutoBilling-Main";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AutoBillingPlugin.class);
        super.onCreate(savedInstanceState);
        setupStatusBar();
        ensureServicesRunning();
    }

    @Override
    public void onResume() {
        super.onResume();
        injectStatusBarHeight();
        ensureServicesRunning();
    }

    private void ensureServicesRunning() {
        try {
            if (!BillingForegroundService.isRunning) {
                Log.i(TAG, "Foreground service not running, starting...");
                BillingForegroundService.start(this);
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not start foreground service", e);
        }
    }

    private void setupStatusBar() {
        Window window = getWindow();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.setSystemBarsAppearance(
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                );
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(Color.TRANSPARENT);
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            );
        }

        WindowCompat.setDecorFitsSystemWindows(window, false);
    }

    private void injectStatusBarHeight() {
        try {
            int statusBarHeight = 0;
            int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
            if (resourceId > 0) {
                statusBarHeight = getResources().getDimensionPixelSize(resourceId);
            }

            float density = getResources().getDisplayMetrics().density;
            int statusBarHeightDp = Math.round(statusBarHeight / density);

            WebView webView = getBridge().getWebView();
            if (webView != null) {
                String js = "document.documentElement.style.setProperty('--status-bar-height', '" + statusBarHeightDp + "px');"
                          + "document.documentElement.style.setProperty('--status-bar-height-raw', '" + statusBarHeight + "px');";
                webView.evaluateJavascript(js, null);
            }
        } catch (Exception e) {
            try {
                WebView webView = getBridge().getWebView();
                if (webView != null) {
                    webView.evaluateJavascript(
                        "document.documentElement.style.setProperty('--status-bar-height', '24px');", null
                    );
                }
            } catch (Exception ignored) {}
        }
    }
}