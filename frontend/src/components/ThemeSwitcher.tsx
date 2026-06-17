import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const getIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'system': return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-surface-elevated transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {getIcon()}
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[120px] bg-surface-elevated border border-border rounded-lg p-1 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50"
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Item 
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none transition-colors ${theme === 'light' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`}
          >
            <Sun className="w-4 h-4" /> Light
          </DropdownMenu.Item>
          <DropdownMenu.Item 
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none transition-colors ${theme === 'dark' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`}
          >
            <Moon className="w-4 h-4" /> Dark
          </DropdownMenu.Item>
          <DropdownMenu.Item 
            onClick={() => setTheme('system')}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none transition-colors ${theme === 'system' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-white/5'}`}
          >
            <Monitor className="w-4 h-4" /> System
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
