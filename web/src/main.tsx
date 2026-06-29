
  import { createRoot } from "react-dom/client";
  import { Capacitor } from "@capacitor/core";
  import { StatusBar, Style } from "@capacitor/status-bar";
  import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Dynamic viewport height — prevents 100vh overflow on mobile browsers/Android
  const setAppHeight = () => {
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  };
  window.addEventListener('resize', setAppHeight);
  setAppHeight();

  // Native platform configuration
  if (Capacitor.isNativePlatform()) {
    document.documentElement.classList.add('capacitor-native');

    // Draw WebView edge-to-edge; top inset is handled once via CSS --safe-top.
    StatusBar.setOverlaysWebView({ overlay: true });
    StatusBar.setBackgroundColor({ color: '#00000000' });
    StatusBar.setStyle({ style: Style.Dark });

    // Keyboard — use native resize so inputs are never hidden by the soft keyboard.
    // 'Native' mode lets the OS handle WebView resize; inputs scroll into view automatically.
    Keyboard.setResizeMode({ mode: KeyboardResize.Native }).catch(() => {});

    // Keep keyboard accessory bar visible so users can dismiss easily
    Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {});

    // Update --app-height when keyboard shows/hides to keep layout correct
    Keyboard.addListener('keyboardWillShow', (info) => {
      const newHeight = window.innerHeight - info.keyboardHeight;
      document.documentElement.style.setProperty('--app-height', `${newHeight}px`);
    }).catch(() => {});

    Keyboard.addListener('keyboardWillHide', () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }).catch(() => {});
  }

  createRoot(document.getElementById("root")!).render(<App />);
  