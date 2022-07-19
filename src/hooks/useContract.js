import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../utils/Wallet";
require("dotenv").config();

export const useContract = (abi, contractAddress) => {
  const [contract, setContract] = useState();
  const {
    signer: _signer,
    provider: _provider,
    PROVIDER: _PROVIDER,
  } = useWallet();

  const signer = Object.keys(_signer).length > 0 ? _signer : null;
  const provider = Object.keys(_provider).length > 0 ? _provider : _PROVIDER;

  const getContract = useCallback(async () => {
    try {
      let rawContract = new ethers.Contract(contractAddress, abi, provider);
      let connectedContract = signer
        ? rawContract.connect(signer)
        : rawContract;
      if (connectedContract) {
        setContract(connectedContract);
      } else {
        console.log("Connecting contract...");
      }
    } catch (e) {
      console.log("Error getting contract: " + e);
    }
  }, [abi, contractAddress, signer, provider]);

  useEffect(() => {
    if (contractAddress) getContract();
  }, [contractAddress, getContract, _provider, _signer]);

  return contract;
};
