
import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface TentOption {
  id: string;
  name: string;
  price: number;
  features: {
    tent: boolean;
    discobar: boolean;
    lighting: boolean;
    smokeMachine: boolean;
  };
}

interface TentConfiguratorProps {
  selectedTent: TentOption;
  tentOptions: TentOption[];
  onTentChange: (tent: TentOption) => void;
}

const TentConfigurator: React.FC<TentConfiguratorProps> = ({
  selectedTent,
  tentOptions,
  onTentChange,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kies je feesttent</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tentOptions.map((tent) => (
          <div 
            key={tent.id}
            onClick={() => onTentChange(tent)}
            className={cn(
              "relative border rounded-xl p-6 cursor-pointer transition-all duration-300",
              "hover:bg-secondary/50",
              selectedTent.id === tent.id 
                ? "tent-option-selected" 
                : "border-gray-700"
            )}
          >
            <div className="flex flex-col space-y-4">
              <h3 className="text-xl font-medium">{tent.name}</h3>
              
              <span className="font-bold text-2xl text-party-light">
                €{tent.price} <span className="text-sm text-muted-foreground">per 24u</span>
              </span>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Tent</span>
                </li>
                <li className="flex items-center">
                  {tent.features.discobar ? (
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>Discobar</span>
                </li>
                <li className="flex items-center">
                  {tent.features.lighting ? (
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>Lighting</span>
                </li>
                <li className="flex items-center">
                  {tent.features.smokeMachine ? (
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>Smoke machine</span>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TentConfigurator;
