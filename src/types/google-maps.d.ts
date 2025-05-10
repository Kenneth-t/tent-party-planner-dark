
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              types?: string[];
              componentRestrictions?: {
                country: string;
              };
            }
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              geometry?: {
                location?: {
                  lat: () => number;
                  lng: () => number;
                };
              };
              formatted_address?: string;
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
            };
          };
        };
      };
    };
  }
}

export {};
