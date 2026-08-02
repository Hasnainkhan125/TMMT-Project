export interface InvestorFormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    gender: string;
    birthPlace: string;
    phoneNumber: string;
    occupation: string;
    
    idType: 'passport' | 'national_id' | 'drivers_license';
    idNumber: string;
    idDocument?: File;
    
    residentialAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    
    sourceOfWealth: string;
    sourceOfFunds: string;
    taxIdNumber: string;
    walletAddress: string;
    
    investorType: 'individual' | 'institution';
    countryOfResidence: string;
  }
  
  export interface SecurityToken {
    id: string;
    symbol: string;
    name: string;
    description: string;
    type: 'Fund' | 'Debt' | 'Equity';
    status: 'Open' | 'Closed' | 'Upcoming';
    image: string;
    contractAddress: string;
    supply: string;
    pricePerToken: number;
    minInvestment: number;
    maxInvestment: number;
    startDate: string;
    endDate: string;
    creators: string[];
    compliance: string[];
    claimsRequired: string[];
    whitepaper?: string;
    prospectus?: string;
  }
  
  export interface InvestorHolding {
    tokenId: string;
    symbol: string;
    name: string;
    quantity: number;
    currentPrice: number;
    totalValue: number;
    purchasePrice: number;
    gainLoss: number;
    gainLossPercentage: number;
    lastUpdated: string;
    performance: {
      day: number;
      week: number;
      month: number;
      year: number;
    };
  }
  
  export interface TransferRequest {
    id: string;
    type: 'sent' | 'received';
    tokenSymbol: string;
    tokenName: string;
    quantity: number;
    fromAddress: string;
    toAddress: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    requestDate: string;
    completedDate?: string;
    reason?: string;
  }
  
  export interface InvestmentOrder {
    id: string;
    tokenSymbol: string;
    tokenName: string;
    quantity: number;
    pricePerToken: number;
    totalAmount: number;
    paymentMethod: 'USDT' | 'USD' | 'ETH' | 'EUR';
    status: 'pending' | 'confirmed' | 'minted' | 'cancelled' | 'refunded';
    orderDate: string;
    confirmationDate?: string;
    transactionHash?: string;
  }