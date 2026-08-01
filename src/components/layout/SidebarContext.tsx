"use client";

import { createContext, useContext, useState } from "react";

interface SidebarContextType {
  visible: boolean;
  setVisible: (v: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  visible: true,
  setVisible: () => {},
  toggleSidebar: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const toggleSidebar = () => setVisible((v) => !v);
  return (
    <SidebarContext.Provider value={{ visible, setVisible, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
