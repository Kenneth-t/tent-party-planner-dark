
import React, { useEffect, useState } from 'react';
import { format, addHours, isBefore, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DateTimePickerProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

// We'll use a serverless function to fetch the calendar data instead of client-side API key
const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}) => {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFormattedDate = (date: Date | undefined) => {
    if (!date) return "Selecteer een datum";
    return format(date, "dd-MM-yyyy", { locale: nl });
  };

  const getPickupDateTime = (date: Date | undefined, timeString: string) => {
    if (!date) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hours, minutes);
    return addHours(selectedDateTime, 24);
  };

  const pickupDateTime = getPickupDateTime(selectedDate, selectedTime);

  // Fetch booked dates using a serverless function
  useEffect(() => {
    const fetchBookedDates = async () => {
      setIsLoading(true);
      try {
        // Instead of direct API call, we'll mock the response for now
        // In production, this would call a serverless function
        
        // Mock data - in real implementation replace with actual API call to your serverless function
        const mockBookedDates = [
          new Date(2025, 4, 15), // May 15, 2025
          new Date(2025, 4, 20), // May 20, 2025
          new Date(2025, 4, 21), // May 21, 2025
          new Date(2025, 4, 25), // May 25, 2025
        ];
        
        setBookedDates(mockBookedDates);
        
        // Default to today unless it's booked or in the past
        const today = new Date();
        const isTodayAvailable = !mockBookedDates.some(d => isSameDay(d, today)) && !isBefore(today, new Date().setHours(0, 0, 0, 0));
        const fallback = getNextAvailableDate(mockBookedDates);
        onDateChange(isTodayAvailable ? today : fallback);

      } catch (err) {
        console.error("Failed to fetch calendar events", err);
        toast({
          title: "Fout bij het laden van agenda",
          description: "Beschikbare datums konden niet worden opgehaald. We tonen alle dagen als beschikbaar.",
          variant: "destructive"
        });
        
        // If there's an error, we'll just show all dates as available
        setBookedDates([]);
        onDateChange(new Date());
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedDates();
  }, []);

  // Utility: find first non-booked date from today onward
  const getNextAvailableDate = (booked: Date[]): Date => {
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      if (
        !booked.some(b => isSameDay(b, d)) &&
        !isBefore(d, new Date().setHours(0, 0, 0, 0))
      ) return new Date(d);
      d.setDate(d.getDate() + 1);
    }
    return new Date(); // fallback
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    const isBlocked = bookedDates.some(d => isSameDay(d, date)) || isBefore(date, new Date().setHours(0, 0, 0, 0));
    if (isBlocked) {
      toast({
        title: "Datum niet beschikbaar",
        description: "Deze datum is al geboekt.",
        variant: "destructive"
      });
      return;
    }
    onDateChange(date);
  };

  const disableDates = (date: Date) =>
    isBefore(date, new Date().setHours(0, 0, 0, 0)) ||
    bookedDates.some(d => isSameDay(d, date));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kies datum & tijd</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Leverdatum
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full justify-start text-left font-normal h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Laden...
                  </span>
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? getFormattedDate(selectedDate) : "Kies een datum"}
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={disableDates}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={nl}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label htmlFor="time" className="text-sm font-medium">
            Levertijd
          </label>
          <Select value={selectedTime} onValueChange={onTimeChange}>
            <SelectTrigger id="time" className="h-12">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Selecteer een tijd" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedDate && (
        <div className="bg-secondary/50 rounded-lg p-4 mt-4">
          <p className="text-sm">
            Je huurt de tent voor 24u, we komen de tent ten laatste op{" "}
            <span className="text-party-light">
              {pickupDateTime 
                ? format(pickupDateTime, "dd-MM-yyyy", { locale: nl }) 
                : "..."}
            </span>{" "}
            om{" "}
            <span className="text-party-light">
              {pickupDateTime ? format(pickupDateTime, "HH:mm") : "..."}
            </span>{" "}
            ophalen.
          </p>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
