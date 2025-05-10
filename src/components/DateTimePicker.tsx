
import React from 'react';
import { format, addDays, addHours } from 'date-fns';
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

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}) => {
  const getFormattedDate = (date: Date | undefined) => {
    if (!date) return "Selecteer een datum";
    return format(date, "dd-MM-yyyy", { locale: nl });
  };

  const getPickupDateTime = (date: Date | undefined, timeString: string) => {
    if (!date) return null;
    
    // Parse the selected time
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Create a new date with the selected date and time
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hours, minutes);
    
    // Add 24 hours to get the pickup time
    return addHours(selectedDateTime, 24);
  };

  const pickupDateTime = getPickupDateTime(selectedDate, selectedTime);
  
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
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? getFormattedDate(selectedDate) : "Kies een datum"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onDateChange}
                disabled={(date) => date < new Date()}
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
