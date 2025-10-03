
import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  // Check if menu parameter is set to false in URL
  const urlParams = new URLSearchParams(window.location.search);
  const menuParam = urlParams.get('menu');
  
  // State for menu visibility
  const [menuVisible, setMenuVisible] = useState(() => {
    if (menuParam === 'false') return false;
    if (menuParam === 'true') return true;
    return !isMobile; // Default: visible on desktop, hidden on mobile
  });

  // Update menu visibility when mobile state changes
  useEffect(() => {
    if (menuParam === 'false') {
      setMenuVisible(false);
    } else if (menuParam === 'true') {
      setMenuVisible(true);
    } else {
      setMenuVisible(!isMobile);
    }
  }, [isMobile, menuParam]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // Force hide menu if URL parameter is false
  const forceHideMenu = menuParam === 'false';

  if (forceHideMenu) {
    return (
      <div className="flex h-screen bg-background">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-background p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {menuVisible && <Sidebar onClose={isMobile ? toggleMenu : undefined} />}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuToggle={toggleMenu} 
          showMenuButton={isMobile || !menuVisible} 
        />
        <div className="flex-1 overflow-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
