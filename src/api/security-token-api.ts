import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api/security-token";

export const syncMint = async (tokenAddress: string, investorAddress: string, amount: string, txHash: string) =>
  axios.post(`${BASE_URL}/investors/${investorAddress}/mint`, { tokenAddress, amount, txHash });

export const syncBlacklist = async (tokenAddress: string, investorAddress: string, txHash: string) =>
  axios.post(`${BASE_URL}/investors/${investorAddress}/blacklist`, { tokenAddress, txHash });

export const syncPause = async (tokenAddress: string, txHash: string) =>
  axios.post(`${BASE_URL}/tokens/${tokenAddress}/pause`, { txHash });

// Add more as needed for unpause, freeze, unfreeze, approve/reject order, etc. 