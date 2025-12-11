import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { format, parseISO, addDays, subDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  Building,
  User,
  Film,
  Calendar,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Header } from "@/components/header";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { BookingWithRelations } from "@shared/schema";

export default function CalendarDayView() {
  const [, navigate] = useLocation();
  const params = useParams<{ date?: string }>();
  const { setSelectedDate } = useAuth();

  const initialDate = params.date ? parseISO(params.date) : new Date();
  const [currentDate, setCurrentDate] = useState(initialDate);

  const dateStr = format(currentDate, "yyyy-MM-dd");

  const { data: bookings = [], isLoading } = useQuery<BookingWithRelations[]>({
    queryKey: [`/api/bookings?from=${dateStr}&to=${dateStr}`],
  });

  const sortedBookings = useMemo(() => {
    return [...bookings]
      .filter((b) => b.status !== "cancelled")
      .sort((a, b) => {
        if (a.fromTime && b.fromTime) {
          return a.fromTime.localeCompare(b.fromTime);
        }
        return 0;
      });
  }, [bookings]);

  const cancelledBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "cancelled");
  }, [bookings]);

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleBack = () => {
    navigate("/");
  };

  const handleNewBooking = () => {
    setSelectedDate(currentDate);
    navigate("/");
  };

  const statusColors = {
    planning: "border-l-booking-planning bg-booking-planning/10",
    tentative: "border-l-booking-tentative bg-booking-tentative/10",
    confirmed: "border-l-booking-confirmed bg-booking-confirmed/10",
    cancelled: "border-l-booking-cancelled bg-booking-cancelled/10 opacity-60",
  };

  const statusBadgeColors = {
    planning: "bg-booking-planning text-white",
    tentative: "bg-booking-tentative text-white",
    confirmed: "bg-booking-confirmed text-white",
    cancelled: "bg-booking-cancelled text-white",
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Day View" />

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              data-testid="button-back-to-calendar"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="h-6 w-px bg-border" />

            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevDay}
              data-testid="button-prev-day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[200px]"
                  data-testid="button-date-picker"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(currentDate, "EEEE, MMMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              data-testid="button-next-day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              data-testid="button-today"
            >
              Today
            </Button>
          </div>

          <Button onClick={handleNewBooking} data-testid="button-new-booking">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : sortedBookings.length === 0 && cancelledBookings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No bookings for this day"
                description={`There are no bookings scheduled for ${format(currentDate, "MMMM d, yyyy")}`}
              />
            ) : (
              <div className="space-y-6">
                {sortedBookings.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Active Bookings ({sortedBookings.length})
                    </h3>
                    <div className="grid gap-3">
                      {sortedBookings.map((booking) => (
                        <Card
                          key={booking.id}
                          className={cn(
                            "border-l-4 hover-elevate cursor-pointer",
                            statusColors[booking.status as keyof typeof statusColors]
                          )}
                          onClick={() => navigate(`/?date=${dateStr}&bookingId=${booking.id}`)}
                          data-testid={`day-view-booking-${booking.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className={cn(
                                      "text-xs",
                                      statusBadgeColors[booking.status as keyof typeof statusBadgeColors]
                                    )}
                                  >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm font-mono">
                                    <Clock className="h-3.5 w-3.5" />
                                    {booking.fromTime?.slice(0, 5)} - {booking.toTime?.slice(0, 5)}
                                  </div>
                                </div>

                                <h4 className="font-medium text-lg mb-1">
                                  {booking.customer?.name || "Unknown Customer"}
                                </h4>

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  {booking.project && (
                                    <div className="flex items-center gap-1">
                                      <Film className="h-3.5 w-3.5" />
                                      {booking.project.name}
                                    </div>
                                  )}
                                  {booking.room && (
                                    <div className="flex items-center gap-1">
                                      <Building className="h-3.5 w-3.5" />
                                      {booking.room.name}
                                    </div>
                                  )}
                                  {booking.editor && (
                                    <div className="flex items-center gap-1">
                                      <User className="h-3.5 w-3.5" />
                                      {booking.editor.name}
                                    </div>
                                  )}
                                </div>

                                {booking.notes && (
                                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                    {booking.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {cancelledBookings.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Cancelled Bookings ({cancelledBookings.length})
                    </h3>
                    <div className="grid gap-3 opacity-60">
                      {cancelledBookings.map((booking) => (
                        <Card
                          key={booking.id}
                          className="border-l-4 border-l-booking-cancelled"
                          data-testid={`day-view-cancelled-${booking.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Cancelled
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm font-mono line-through">
                                    <Clock className="h-3.5 w-3.5" />
                                    {booking.fromTime?.slice(0, 5)} - {booking.toTime?.slice(0, 5)}
                                  </div>
                                </div>

                                <h4 className="font-medium line-through">
                                  {booking.customer?.name || "Unknown Customer"}
                                </h4>

                                {booking.cancelReason && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Reason: {booking.cancelReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
