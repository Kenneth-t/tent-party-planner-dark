import React from 'react';
import { TentOption } from './TentConfigurator';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { PartyPopper } from 'lucide-react';

interface BookingSummaryProps {
  tentOption: TentOption;
  selectedDate: Date | undefined;
  selectedTime: string;
  address: string;
  comments: string;
  deliveryCost: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  tentOption,
  selectedDate,
  selectedTime,
  address,
  comments,
  deliveryCost,
  onSubmit,
  isSubmitting
}) => {
  const isFormComplete = !!selectedDate && !!selectedTime && !!address;
  const total = tentOption.price + deliveryCost;

  return (
    <div className="space-y-6">
      <div className="bg-secondary rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Reserveringsoverzicht</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tent type</span>
            <span className="font-medium">{tentOption.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Datum</span>
            <span className="font-medium">
              {selectedDate 
                ? format(selectedDate, "dd MMMM yyyy", { locale: nl }) 
                : "Niet geselecteerd"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tijd</span>
            <span className="font-medium">{selectedTime || "Niet geselecteerd"}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Adres</span>
            <span className="font-medium max-w-[60%] text-right">
              {address || "Niet ingevuld"}
            </span>
          </div>
          
          {comments && (
            <div className="pt-2">
              <span className="text-muted-foreground">Opmerkingen</span>
              <p className="text-sm mt-1 bg-background/50 rounded p-2">{comments}</p>
            </div>
          )}

          <div className="border-t border-gray-700 my-4"></div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Basisprijs</span>
            <span>€{tentOption.price.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Leveringskost</span>
            <span>
              {deliveryCost === 0
                ? "Gratis"
                : `€${deliveryCost.toFixed(2)} (eerste 30 km gratis)`}
            </span>
          </div>

          <div className="border-t border-gray-700 my-4"></div>

          <div className="flex justify-between text-lg">
            <span>Totaal</span>
            <span className="font-bold text-party-light">€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onSubmit}
        disabled={!isFormComplete || isSubmitting}
        className="w-full h-14 text-lg font-medium bg-party hover:bg-party-dark transition-colors"
      >
        {isSubmitting ? (
          "Bezig met verzenden..."
        ) : (
          <>
            <PartyPopper className="mr-2 h-5 w-5" />
            Reserveer nu
          </>
        )}
      </Button>
      
      {!isFormComplete && (
        <p className="text-sm text-muted-foreground text-center">
          Vul alle verplichte velden in om door te gaan
        </p>
      )}
    </div>
  );
};

export default BookingSummary;