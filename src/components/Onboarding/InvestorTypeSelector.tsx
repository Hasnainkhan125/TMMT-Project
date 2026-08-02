import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface InvestorTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const InvestorTypeSelector: React.FC<InvestorTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Which type of investor are you? *</h3>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
        <div className="flex items-center space-x-2 p-4 border border-purple-300 rounded-lg bg-purple-50">
          <RadioGroupItem value="individual" id="individual" />
          <Label htmlFor="individual" className="font-medium">Individual</Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
          <RadioGroupItem value="institution" id="institution" />
          <Label htmlFor="institution" className="font-medium">Institution</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
