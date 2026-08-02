const { ethers } = require('ethers');
const {
    contracts: { Identity }
} = require('@onchain-id/solidity');
const { useRpcProvider } = require('../utils/useRpcProvider');
const config = require('../../config.json');
const { getContractAt } = require('../utils/ethers');
require('dotenv').config();


async function getIdentity(address, identityFactory, signer = undefined) {
    const config = {
        rpc: 'https://eth-sepolia.g.alchemy.com/v2/NAR07p3fjDxxSkZMETZmz',
        deployer: {
            privateKey: process.env.DEPLOYER
        }
    }
    try {
        if (signer === undefined) {
            signer = useRpcProvider(config.rpc, config.deployer.privateKey);
        }

        console.log('[!] Getting identity for wallet with address:', address);
        const identity = await identityFactory.getIdentity(address);

        if (identity !== ethers.ZeroAddress) {
            console.log('[✓] Identity found:', identity);

            const identityContract = new ethers.ContractFactory(
                Identity.abi,
                Identity.bytecode,
                signer
            );

            return new ethers.Contract(
                identity,
                identityContract.interface.fragments,
                signer
            );
        } else {
            return null;
        }
    } catch (error) {
        console.error('[X] Error getting identity:', error);
        console.error(error);
        return null;
    }
}

module.exports = { getIdentity };
