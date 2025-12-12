import { useEffect, useState } from "react";
import { UserNav } from "./UserNav";
import { AdminPayload } from "@/lib/adminAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PanelLeft, Search, Bell, Sun, Moon, Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeSettings } from "./ThemeSettings";
import { useTheme } from "@/contexts/theme-context";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [user, setUser] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const pathname = usePathname();
  const { colorMode, setColorMode } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/admin/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("admin-search");
        searchInput?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname === "/admin/login") {
    return null;
  }

  const toggleColorMode = () => {
    setColorMode(colorMode === "dark" ? "light" : "dark");
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-40">
      <div className="flex h-14 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-4" />
        <div className="max-w-md w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="admin-search"
              placeholder="Search..."
              className={`pl-9 pr-16 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg transition-all ${
                searchFocused
                  ? "ring-2 ring-gray-200 dark:ring-gray-600 bg-white dark:bg-gray-700"
                  : ""
              }`}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[10px] font-medium">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleColorMode}
            className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {colorMode === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <ThemeSettings />
            </PopoverContent>
          </Popover>
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full ml-2" />
          ) : user ? (
            <div className="ml-2">
              <UserNav user={user} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
