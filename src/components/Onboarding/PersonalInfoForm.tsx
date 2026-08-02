import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { countriesList } from '@/lib/utils';

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  nationality: string;
  birthPlace: string;
  idExpiration: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  sourceOfWealth: string;
  sourceOfFunds: string;
  taxId: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfoData;
  onChange: (data: Partial<PersonalInfoData>) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-purple-900 mb-2">Identity</h3>
        <p className="text-purple-800 text-sm">
          Please fill in your identity, residency, and investor information as required by the
          Issuer to comply with KYC/AML regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name *</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Novacek"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Select value={data.nationality} onValueChange={(value) => handleChange('nationality', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
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

        <div className="space-y-2">
          <Label htmlFor="birthPlace">Birth place *</Label>
          <Input
            id="birthPlace"
            value={data.birthPlace}
            onChange={(e) => handleChange('birthPlace', e.target.value)}
            placeholder="Enter birth place"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idExpiration">ID Card/Passport expiration *</Label>
          <Input
            id="idExpiration"
            type="date"
            value={data.idExpiration}
            onChange={(e) => handleChange('idExpiration', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone number *</Label>
          <Input
            id="phoneNumber"
            value={data.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Address Information</h4>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter your address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter city"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={data.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Enter state"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip code *</Label>
            <Input
              id="zipCode"
              value={data.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="32523"
            />
          </div>
        </div>
      </div>

      <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-4">Investment Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sourceOfWealth">Source of wealth *</Label>
            <Select value={data.sourceOfWealth} onValueChange={(value) => handleChange('sourceOfWealth', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Employment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment">Employment</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="inheritance">Inheritance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceOfFunds">Source of funds *</Label>
            <Select value={data.sourceOfFunds} onValueChange={(value) => handleChange('sourceOfFunds', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sale of property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="property-sale">Sale of property</SelectItem>
                <SelectItem value="business-income">Business income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="taxId">Tax Identification Number *</Label>
            <Input
              id="taxId"
              value={data.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              placeholder="03297023975039"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
