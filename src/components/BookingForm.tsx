import React, { useState } from 'react';
import TentConfigurator, { TentOption } from './TentConfigurator';
import DateTimePicker from './DateTimePicker';
import AddressInput, { AddressData } from './AddressInput';
import BookingSummary from './BookingSummary';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createCalendarEvent, TransferEventStatus } from '@/lib/googleCalendar';
import { sendBookingEmail } from '@/lib/emailService';
import { useToast } from '@/hooks/use-toast';

// Tent options
const tentOptions: TentOption[] = [
  {
    id: 'basic',
    name: 'Tent Only',
    price: 250,
    features: {
      tent: true,
      discobar: false,
      lighting: false,
      smokeMachine: false,
    },
  },
  {
    id: 'full',
    name: 'Full Option',
    price: 350,
    features: {
      tent: true,
      discobar: true,
      lighting: true,
      smokeMachine: true,
    },
  },
];

interface BookingFormProps {
  onTentSelect: (tentType: 'basic' | 'full') => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onTentSelect }) => {
  const [selectedTent, setSelectedTent] = useState<TentOption>(tentOptions[0]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [address, setAddress] = useState<AddressData>({ fullAddress: '' });
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleTentChange = (tent: TentOption) => {
    setSelectedTent(tent);
    onTentSelect(tent.id as 'basic' | 'full');
  };

  const handleSubmit = async () => {
    if (!selectedDate || !address.fullAddress || !email || !name) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Vul alle verplichte velden in om door te gaan.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${address.street || ''} ${address.houseNumber || ''}, ${address.postalCode || ''} ${address.city || ''}, ${address.country || ''}`.trim();
      const total = selectedTent.price + deliveryCost;

      // Create calendar event (blocks 2 days)
      const eventId = await createCalendarEvent({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        tentType: selectedTent.name,
        price: selectedTent.price,
        deliveryCost,
        total,
        date: selectedDate,
        time: selectedTime,
        address,
        comments,
        status: TransferEventStatus.TO_APPROVE
      });

      // Send confirmation email to admin (or customer)
      await sendBookingEmail({
        to: "feestindetentverhuur@gmail.com",
        subject: `Nieuwe feesttent reservering - ${name}`,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        tentType: selectedTent.name,
        price: selectedTent.price,
        date: selectedDate,
        time: selectedTime,
        address: address.fullAddress,
        comments,
        eventId
      });

      toast({
        title: "Reservering verzonden!",
        description: "We hebben je aanvraag ontvangen en nemen zo snel mogelijk contact met je op.",
      });

      // Reset form
      setSelectedDate(undefined);
      setAddress({ fullAddress: '' });
      setDeliveryCost(0);
      setComments('');
      setEmail('');
      setName('');
      setPhone('');
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Er is iets misgegaan",
        description: "Probeer het later opnieuw of neem contact met ons op.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <TentConfigurator 
        selectedTent={selectedTent}
        tentOptions={tentOptions}
        onTentChange={handleTentChange}
      />
      
      <DateTimePicker 
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateChange={setSelectedDate}
        onTimeChange={setSelectedTime}
      />
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Jouw gegevens</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Naam *</Label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md h-12 px-3 text-foreground"
              placeholder="Jouw naam"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md h-12 px-3 text-foreground"
              placeholder="jouw@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefoon *</Label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-secondary border border-border rounded-md h-12 px-3 text-foreground"
              placeholder="+32 ..."
              required
            />
          </div>
        </div>
      </div>
      
      <AddressInput 
        onAddressSelect={(addressData, cost) => {
          setAddress(addressData);
          setDeliveryCost(cost);
        }} 
        value={address.fullAddress}
      />
      
      <div className="space-y-2">
        <Label htmlFor="comments">Heb je nog opmerkingen?</Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Bijv. speciale wensen of vragen..."
          className="min-h-[100px] bg-secondary"
        />
      </div>
      
      <BookingSummary 
        tentOption={selectedTent}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        address={address.fullAddress}
        comments={comments}
        deliveryCost={deliveryCost}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default BookingForm;