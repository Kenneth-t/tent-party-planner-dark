
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
  onAddressSelect: (address: AddressData) => void;
  value: string;
}

// We can define a constant for the API key, which makes it easier to replace in a CI/CD pipeline
// You should still restrict this key in the Google Cloud Console
const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY'; 

const AddressInput: React.FC<AddressInputProps> = ({ onAddressSelect, value }) => {
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    // Check if script is already in the document
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

          onAddressSelect(addressData);
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
      <Input
        ref={autoCompleteRef}
        id="address"
        type="text"
        placeholder="Begin met typen voor suggesties..."
        value={value}
        onChange={(e) => onAddressSelect({ fullAddress: e.target.value })}
      />
      {!isScriptLoaded && !scriptError && (
        <p className="text-xs text-muted-foreground">Adres suggesties worden geladen...</p>
      )}
      {scriptError && (
        <p className="text-xs text-destructive">{scriptError}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Vul een volledig adres in waar de tent geleverd moet worden
      </p>
    </div>
  );
};

export default AddressInput;
