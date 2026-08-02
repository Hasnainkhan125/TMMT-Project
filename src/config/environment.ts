// Environment configuration
export const config = {
    kyc: {
      apiUrl: process.env.NEXT_PUBLIC_KYC_API_URL || "https://ig.gov-cloud.ai/pi-entity-instances-service/v2.0",
      schemaId: process.env.NEXT_PUBLIC_KYC_SCHEMA_ID || "6863bc732ec4242da906ec0d",
      authToken: process.env.NEXT_PUBLIC_KYC_AUTH_TOKEN || "",
    },
    ipfs: {
      gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/",
      uploadUrl: process.env.NEXT_PUBLIC_IPFS_UPLOAD_URL || "https://api.pinata.cloud/pinning/pinFileToIPFS",
    },
  }
  