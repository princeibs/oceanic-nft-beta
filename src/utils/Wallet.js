import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
require("dotenv").config();

export const PROVIDER = new ethers.providers.JsonRpcProvider(process.env.RINKEBY_RPC_URL);

export const useWallet = () => {
  const [defaultAccount, setDefaultAccount] = useState();
  const [signer, setSigner] = useState({});
  const [provider, setProvider] = useState({});

  // let provider, signer;

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((accounts) => accountChangedHandler(accounts[0]));
        // set provider and signer
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        const _signer = _provider.getSigner();
        setProvider(_provider);
        setSigner(_signer);
      } catch (e) {
        console.log("Error trying to connect wallet: " + e);
      }
    } else {
      alert("Please install metamask to continue");
    }
  });

  const accountChangedHandler = (account) => setDefaultAccount(account);
  window.ethereum.on("accountsChanged", accountChangedHandler);

  useEffect(() => {
    connectWallet();
  }, []);

  return { signer, provider, PROVIDER, defaultAccount, connectWallet };
};
