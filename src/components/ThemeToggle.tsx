import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme-context";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`cursor-pointer rounded-lg p-2 text-foreground/60 transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.95] ${className ?? ""}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
