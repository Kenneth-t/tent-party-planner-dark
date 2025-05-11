import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

// Define the interface for address data
export interface AddressData {
  fullAddress: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressInputProps {
  onAddressSelect: (address: AddressData, deliveryCost: number) => void;
  value: string;
}

// Constants for delivery logic
const GOOGLE_MAPS_API_KEY = 'AIzaSyCxrJf7q9nTRjJBEOf9vuK2-8HV9L1GCTY'; 
const ORIGIN = 'Lokeren, Belgium';
const FREE_KM = 30;
const COST_PER_KM = 0.35;

const AddressInput: React.FC<AddressInputProps> = ({ onAddressSelect, value }) => {
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [deliveryCost, setDeliveryCost] = useState<number | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      document.body.removeChild(existingScript);
    }

    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    
    googleMapScript.onload = () => {
      setIsScriptLoaded(true);
      setScriptError(null);
    };
    
    googleMapScript.onerror = () => {
      setScriptError('De Google Maps API kon niet worden geladen. Controleer uw API-sleutel.');
      toast({
        title: "API fout",
        description: "Er was een probleem met het laden van adressuggesties.",
        variant: "destructive",
      });
    };
    
    document.body.appendChild(googleMapScript);

    return () => {
      const scriptToRemove = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, []);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (isScriptLoaded && autoCompleteRef.current) {
      try {
        if (!window.google) {
          console.error('Google Maps API not loaded');
          return;
        }

        const autocomplete = new window.google.maps.places.Autocomplete(
          autoCompleteRef.current,
          { types: ['address'], componentRestrictions: { country: 'be' } }
        );

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry) {
            console.error('No details available for input: ', place);
            return;
          }

          // Extract address components
          let streetName = '';
          let streetNumber = '';
          let city = '';
          let postalCode = '';
          let country = '';

          for (const component of place.address_components || []) {
            const componentType = component.types[0];

            switch (componentType) {
              case 'street_number':
                streetNumber = component.long_name;
                break;
              case 'route':
                streetName = component.long_name;
                break;
              case 'locality':
                city = component.long_name;
                break;
              case 'postal_code':
                postalCode = component.long_name;
                break;
              case 'country':
                country = component.long_name;
                break;
            }
          }

          const addressData: AddressData = {
            fullAddress: place.formatted_address || '',
            street: streetName,
            houseNumber: streetNumber,
            city,
            postalCode,
            country,
            latitude: place.geometry?.location?.lat(),
            longitude: place.geometry?.location?.lng(),
          };

          const service = new window.google.maps.DistanceMatrixService();
          service.getDistanceMatrix(
            {
              origins: [ORIGIN],
              destinations: [addressData.fullAddress],
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
              if (status === 'OK') {
                const meters = response.rows[0].elements[0].distance.value;
                const km = meters / 1000;
                const extra = Math.max(0, km - FREE_KM);
                const cost = parseFloat((extra * COST_PER_KM).toFixed(2));
                setDeliveryCost(cost);
                onAddressSelect(addressData, cost); // ✅ Updated here
              } else {
                console.warn('DistanceMatrix failed:', status);
                setDeliveryCost(null);
                onAddressSelect(addressData, 0); // fallback
              }
            }
          );
        });
      } catch (error) {
        console.error('Error initializing Google Maps Autocomplete:', error);
        setScriptError('Er is een fout opgetreden bij het initialiseren van adressuggesties.');
      }
    }
  }, [isScriptLoaded, onAddressSelect]);

  return (
    <div className="space-y-2">
      <Label htmlFor="address">Leveradres</Label>
      <span>Eerste 30km gratis, dan €0,35 per bijkomende km</span>
      <Input
        ref={autoCompleteRef}
        id="address"
        type="text"
        placeholder="Begin met typen voor suggesties..."
        value={value}
        onChange={(e) => onAddressSelect({ fullAddress: e.target.value }, 0)}
      />
      {!isScriptLoaded && !scriptError && (
        <p className="text-xs text-muted-foreground">Adres suggesties worden geladen...</p>
      )}
      {scriptError && (
        <p className="text-xs text-destructive">{scriptError}</p>
      )}
      {deliveryCost !== null && (
        <p className="text-sm text-gray-600">
          {deliveryCost === 0
            ? 'Gratis levering'
            : `Leveringskost € ${deliveryCost.toFixed(2)}. De eerste 30km rond Lokeren zijn gratis, daarna betaal je € 0,35 per extra km.`}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Vul een volledig adres in waar de tent geleverd moet worden om je leveringskost te berekenen.
      </p>
    </div>
  );
};

export default AddressInput;