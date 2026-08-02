import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countriesList } from '@/lib/utils';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Country of residency *
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select your country" />
        </SelectTrigger>
        <SelectContent>
          {countriesList.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
