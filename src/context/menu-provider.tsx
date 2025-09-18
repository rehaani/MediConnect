"use client";

import * as React from "react";

type MenuContextType = {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
};

export const MenuContext = React.createContext<MenuContextType>({
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: () => {},
});

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <MenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      {children}
    </MenuContext.Provider>
  );
};
