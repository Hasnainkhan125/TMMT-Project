import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Apple } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-10 space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payments</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pay Visa Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Application ID</Label>
            <Input placeholder="Enter application ID" />
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-black text-white flex items-center gap-2"><Apple className="w-4 h-4" /> Apple Pay</Button>
            <Button variant="outline">Card</Button>
            <Button variant="outline">Bank Transfer</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsPage;


