import axios from 'axios';
import { PinataSDK } from 'pinata';
import { countriesList } from '../lib/utils';
import { getSTData } from '@/hooks/use-ST';

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINIATE_SERVER_URL,
  pinataGateway: import.meta.env.VITE_PINIATE_GATEWAY_URL,
});





// Types for the API
export interface ClaimData {
  contract: string;
  issuer: string;
  name: string;
}

export interface InvestorDetails {
  accreditedInvestorStatus: boolean;
  countryOfResidence: string;
  countryCode: string;
  email: string;
  fullName: string;
  identityDocuments: {
    identityProof: string;
    proofOfAddress: string;
    proofOfIncome: string;
    bankProof: string;
    otherDocs: string[];
  };
  walletAddress: string;
}

export interface ClaimStatus {
  amlVerified: boolean;
  kycVerified: boolean;
  termsAccepted: boolean;
  jurisdictionCompliant: boolean;
  accreditationVerified: boolean;
}

export interface KYCSubmissionData {
  investorId: string;
  tokenAddress: string;
  token:any;
  investorAddress: string;
  investorIdentityAddress: string;
  claimData: {
    data: ClaimData[];
  };
  InvestorDetails: InvestorDetails;
  claimStatus: ClaimStatus;
  status: string;
}

export interface STData {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  issuerAddress: string;
  claimData: {
    data: ClaimData[];
  };
  // Add other token properties as needed
}


// Mock function to get ST (Security Token) data
// export const getSTData = async (): Promise<STData> => {
//   // This should be replaced with your actual API call
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve({
//         tokenAddress: '0x97C1E24C5A5D5F5b5e5D5c5B5a5F5E5d5C5b5A5f',
//         tokenName: 'Green Brew Bond',
//         tokenSymbol: 'GBB',
//         issuerAddress: '0x1234567890ABCDEFabcdef1234567890ABCDEF12',
//         claimData: {
//           data: [
//             {
//               contract: '0x1234567890ABCDEFabcdef1234567890ABCDEF12',
//               issuer: 'Veriff Identity',
//               name: 'KYC',
//             },
//             {
//               contract: '0x1234567890ABCDEFabcdef1234567890ABCDEF12',
//               issuer: 'Veriff AML',
//               name: 'AML',
//             },
//             {
//               contract: '0x1234567890ABCDEFabcdef1234567890ABCDEF12',
//               issuer: 'Veriff Accreditation',
//               name: 'Accreditation',
//             },
//           ],
//         },
//       });
//     }, 1000);
//   });
// };


const blobUrlToFile = async (blobUrl: string, filename: string, type: string): Promise<File> => {
  const response = await fetch(blobUrl)
  const blob = await response.blob()
  return new File([blob], filename, { type })
}
// Function to upload documents to IPFS (mock implementation)
const uploadToIPFS = async (
  file: File | Blob,
  documentType: string
): Promise<any> => {
  // This should be replaced with your actual IPFS upload logic
  console.log('uploading to ipfs', file, documentType);


  const fileBlob = await blobUrlToFile(file.url!, file.name!, file.type!)

  const form = new FormData()
  form.append("file", fileBlob)

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINIATE_SERVER_URL}`, // ✅ Replace with your real JWT
        // ❗ DO NOT set Content-Type
      },
      body: form,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Upload failed:", data) // Now shows real error
      throw new Error(data.error || "Upload failed")
    }

    console.log("File uploaded successfully:", data)
    return `https://ipfs.io/ipfs/${data.IpfsHash}`

  } catch (err) {
    console.error("Error during upload:", err)
  }
 
};

// Function to get country code from country name
const getCountryCode = (country: string): string => {
  // Find the country in the comprehensive list
  const countryData = countriesList.find(c => 
    c.name.toLowerCase() === country.toLowerCase() ||
    c.name.toLowerCase().replace(/\s+/g, '-') === country.toLowerCase()
  );
  
  // Return phone code based on country code (simplified mapping)
  if (countryData) {
    const phoneCodes: Record<string, string> = {
      'US': '+1', 'CA': '+1', // North America
      'GB': '+44', 'IE': '+353', // UK and Ireland
      'AU': '+61', 'NZ': '+64', // Australia and New Zealand
      'DE': '+49', 'AT': '+43', 'CH': '+41', // German speaking countries
      'FR': '+33', 'BE': '+32', 'LU': '+352', // French speaking countries
      'IT': '+39', 'ES': '+34', 'PT': '+351', // Southern Europe
      'NL': '+31', 'SE': '+46', 'NO': '+47', 'DK': '+45', 'FI': '+358', // Northern Europe
      'JP': '+81', 'KR': '+82', 'CN': '+86', 'SG': '+65', // Asia
      'IN': '+91', 'PK': '+92', 'BD': '+880', // South Asia
      'BR': '+55', 'AR': '+54', 'MX': '+52', 'CO': '+57', // Latin America
      'ZA': '+27', 'NG': '+234', 'KE': '+254', // Africa
      'RU': '+7', 'UA': '+380', 'PL': '+48', // Eastern Europe
      'TR': '+90', 'SA': '+966', 'AE': '+971', // Middle East
    };
    return phoneCodes[countryData.code] || '+1';
  }
  
  return '+1'; // Default fallback
};

// Function to get country code (ISO format)
const getCountryISO = (country: string): string => {
  // Find the country in the comprehensive list
  const countryData = countriesList.find(c => 
    c.name.toLowerCase() === country.toLowerCase() ||
    c.name.toLowerCase().replace(/\s+/g, '-') === country.toLowerCase()
  );
  
  // Return the ISO country code
  return countryData?.code || 'US';
};

// Main KYC submission function
export const submitKYCVerification = async (
  tokensymbol: string,
  investorType: string,
  country: string,
  agreements: any,
  personalData: any,
  selectedAccount: string,
  uploadedFiles: any[],
  authToken: string
): Promise<{ success: boolean; submissionId: string; data?: any }> => {
  try {
    // Get token data
    const st = await getSTData();
    const filtered = st.filter(token=>token.symbol==tokensymbol)
    let stData;
    if(filtered.length>0){
      stData = filtered[0]
    }
    console.log(stData,"tokens")
    // Upload documents to IPFS
    const documentUploads = await Promise.all(
      uploadedFiles.map(async file => {
        const ipfsHash = await uploadToIPFS(file as any, file.documentType);
        return { type: file.documentType, ipfsHash };
      })
    );
    console.log('documentUploads', documentUploads);

    // Create document mapping
    const identityDoc = documentUploads.find(doc => doc.type === 'identity');
    const addressDoc = documentUploads.find(doc => doc.type === 'address');
    const bankDoc = documentUploads.find(doc => doc.type === 'bank');
    const fundsDoc = documentUploads.find(doc => doc.type === 'funds');

    const claims = stData.claimTopics.map((claim:any) => ({
      name: claim.name,
      issuer: claim.issuer,
      contract: claim.contract,
    }));
    // Prepare the submission data
    const submissionData: KYCSubmissionData = {
      investorId:selectedAccount+stData.symbol+stData.name,
      tokenAddress: stData.address,
      token:stData,
      investorAddress: selectedAccount,
      investorIdentityAddress: '0x0', // This should be generated or provided
      claimData: {
        data: claims,
      },
      InvestorDetails: {
        accreditedInvestorStatus:
          investorType === 'institution' ||
          personalData.sourceOfWealth === 'investment',
        countryOfResidence: getCountryISO(country),
        countryCode: getCountryCode(country),
        email:
          personalData.email ||
          `${personalData.firstName.toLowerCase()}.${personalData.lastName.toLowerCase()}@example.com`,
        fullName: `${personalData.firstName} ${personalData.lastName}`,
        identityDocuments: {
          identityProof: identityDoc?.ipfsHash || 'ipfs://identity_placeholder',
          proofOfAddress: addressDoc?.ipfsHash || 'ipfs://address_placeholder',
          proofOfIncome: fundsDoc?.ipfsHash || 'ipfs://income_placeholder',
          bankProof: bankDoc?.ipfsHash || 'ipfs://bank_placeholder',
          otherDocs: [
            personalData.taxId ? `ipfs://tax_${Date.now()}` : '',
            `ipfs://wealth_${Date.now()}`,
          ].filter(Boolean),
        },
        walletAddress: selectedAccount,
      },
      claimStatus: {
        amlVerified: true,
        kycVerified: true,
        termsAccepted: Object.values(agreements).every(Boolean),
        jurisdictionCompliant: true,
        accreditationVerified: investorType === 'institution',
      },
      status: '1',
    };

    // Make the API call
    // const response = await axios.post(
    //   'https://ig.gov-cloud.ai/pi-entity-instances-service/v2.0/schemas/6863defa2ec4242da906ed9d/instances',
    //   {
    //     data: [submissionData],
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${authToken}`,
    //     },
    //   }
    // );

    const response = await axios.post(
      'http://localhost:5001/api/v1/kyc/submit',
      submissionData,
      // {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${authToken}`,
      //   },
      // }
    );

    return {
      success: true,
      submissionId: `KYC-${Date.now()}`,
      data: response.data,
    };
  } catch (error) {
    console.error('KYC Submission Error:', error);
    throw new Error(
      axios.isAxiosError(error)
        ? `API Error: ${error.response?.data?.message || error.message}`
        : 'Failed to submit KYC verification'
    );
  }
};








