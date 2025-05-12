
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
        DistanceMatrixService: new () => {
          getDistanceMatrix: (
            request: {
              origins: string[];
              destinations: string[];
              travelMode: google.maps.TravelMode;
            },
            callback: (
              response: {
                rows: {
                  elements: {
                    distance: {
                      text: string;
                      value: number;
                    };
                    duration: {
                      text: string;
                      value: number;
                    };
                    status: string;
                  }[];
                }[];
                originAddresses: string[];
                destinationAddresses: string[];
              },
              status: string
            ) => void
          ) => void;
        };
        TravelMode: {
          DRIVING: string;
          BICYCLING: string;
          TRANSIT: string;
          WALKING: string;
        };
      };
    };
  }
}

export {};
