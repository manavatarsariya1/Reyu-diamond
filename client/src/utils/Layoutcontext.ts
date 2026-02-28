import { createContext, useContext } from "react";

interface LayoutContextValue {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayout() {
    const ctx = useContext(LayoutContext);
    if (!ctx) throw new Error("useLayout must be used inside DashboardLayout");
    return ctx;
}