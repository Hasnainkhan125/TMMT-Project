import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TokenCardProps {
  token: {
    id: string;
    name: string;
    symbol: string;
    type: string;
    totalSupply: string;
    price: string;
    marketCap: string;
    holders: number;
    compliance: string[];
    image: string;
    verified: boolean;
    apy: string;
  };
}

const TokenCard = ({ token }: TokenCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {token.symbol.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {token.name}
                {token.verified && (
                  <Shield className="w-4 h-4 text-blue-500" />
                )}
              </h3>
              <p className="text-sm text-text-secondary">{token.symbol}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {token.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Price
            </p>
            <p className="font-semibold text-lg text-foreground">${token.price}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              APY
            </p>
            <p className="font-semibold text-lg text-green-600">+{token.apy}%</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Market Cap</span>
            <span className="font-medium">${token.marketCap}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Holders
            </span>
            <span className="font-medium">{token.holders.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Compliance Requirements</p>
          <div className="flex flex-wrap gap-1">
            {token.compliance.slice(0, 2).map((req) => (
              <Badge key={req} variant="secondary" className="text-xs">
                {req}
              </Badge>
            ))}
            {token.compliance.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{token.compliance.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Link to={`/token/${token.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TokenCard;
