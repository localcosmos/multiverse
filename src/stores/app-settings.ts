import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

type ColorScheme = "light" | "dark" | null;

export const useAppSettingsStore = defineStore("app-settings", () => {
  const stored = localStorage.getItem("setting_bookworm");
  const bookworm = ref<boolean>(stored !== null ? JSON.parse(stored) : false);

  const setBookworm = (value: boolean) => {
    bookworm.value = value;
    localStorage.setItem("setting_bookworm", JSON.stringify(value));
  };

  // null = follow system preference
  const storedScheme = localStorage.getItem("setting_colorScheme") as ColorScheme;
  const colorScheme = ref<ColorScheme>(storedScheme);

  const systemPrefersDark = ref<boolean>(
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );

  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    systemPrefersDark.value = e.matches;
  });

  const isDark = computed<boolean>(() => {
    if (colorScheme.value === "dark") return true;
    if (colorScheme.value === "light") return false;
    return systemPrefersDark.value;
  });

  watch(isDark, (dark) => {
    document.documentElement.classList.toggle("dark", dark);
    document.body.classList.toggle("dark", dark);
    const platform = typeof device !== 'undefined' ? device.platform : 'browser';
    if (platform === 'iOS' || platform === 'Android') {
      window.statusbar?.setBackgroundColor(dark ? '#000000' : '#ffffff');
    }
  }, { immediate: true });

  const setColorScheme = (value: ColorScheme) => {
    colorScheme.value = value;
    if (value === null) {
      localStorage.removeItem("setting_colorScheme");
    } else {
      localStorage.setItem("setting_colorScheme", value);
    }
  };

  type ViewMode = "list" | "grid";
  const taxonProfilesViewMode = ref<ViewMode>("grid");

  return { bookworm, setBookworm, colorScheme, isDark, setColorScheme, taxonProfilesViewMode };
});
