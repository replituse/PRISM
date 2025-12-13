import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Building2, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { SyncButton } from "@/components/sync-button";
import { useAuth } from "@/lib/auth-context";

const routeTitles: Record<string, string> = {
  "/": "Booking",
  "/leaves": "Leaves Entry",
  "/chalan": "Chalan Entry",
  "/chalan/revise": "Chalan Revise",
  "/masters/customers": "Customer Master",
  "/masters/projects": "Project Master",
  "/masters/rooms": "Room Master",
  "/masters/editors": "Editor Master",
  "/reports/conflict": "Conflict Report",
  "/reports/booking": "Booking Report",
  "/reports/editor": "Editor Report",
  "/reports/chalan": "Chalan Report",
  "/utility/user-rights": "User Rights",
  "/utility/users": "User Management",
};

interface HeaderProps {
  title?: string;
  showDatePicker?: boolean;
  showCompanySelector?: boolean;
}

export function Header({ 
  title, 
  showDatePicker = true, 
  showCompanySelector = true 
}: HeaderProps) {
  const { company } = useAuth();
  const [liveDateTime, setLiveDateTime] = useState(new Date());
  const [location] = useLocation();

  const pageTitle = title || routeTitles[location] || "PRISM";

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime12Hour = (date: Date) => {
    return format(date, "h:mm:ss a");
  };

  const formatDayOnly = (date: Date) => {
    return format(date, "EEEE");
  };

  const formatDateLocked = (date: Date) => {
    return format(date, "MMMM do, yyyy");
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b header-light-blue px-4">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      
      <Separator orientation="vertical" className="h-6" />
      
      <span className="font-semibold text-foreground" data-testid="header-page-title">
        {pageTitle}
      </span>
      
      <div className="flex-1" />

      {/* Right side: Day+Time, Date, Company selector, Theme toggle */}
      <div className="flex items-center gap-4">
        {/* Live Day + Time (no box) */}
        <div className="flex items-center gap-1.5 text-sm" data-testid="header-live-time">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {formatDayOnly(liveDateTime)}, {formatTime12Hour(liveDateTime)}
          </span>
        </div>

        {/* Date (no box) */}
        {showDatePicker && (
          <div 
            className="flex items-center gap-1.5 text-sm"
            data-testid="header-locked-date"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDateLocked(liveDateTime)}</span>
          </div>
        )}

        {/* Company Display - shows only logged-in company (read-only) */}
        {showCompanySelector && company && (
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/50 dark:bg-white/10 text-sm"
            data-testid="header-company-display"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{company.name}</span>
          </div>
        )}

        <SyncButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
