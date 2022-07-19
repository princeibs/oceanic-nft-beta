import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useNftContract } from "../../hooks";
import { Navigation, Footer, Card } from "../../components";
import { useNavigate } from "react-router-dom";
import emptyShelve from "../../assets/image/empty_shelve.jpg";
import "./Profile.scss";

const Profile = () => {
  const [tokens, setTokens] = useState();
  const contract = useNftContract();

  const navigate = useNavigate();

  const processUri = async (uri) => {
    const url = `https://ipfs.infura.io/ipfs/${uri.toString().split("//")[1]}`;
    console.log(url)
    const res = await axios.get(url);
    return res;
  };

  // fetch all NFTs on the smart contract
  const getTokens = async (nftContract) => {
    try {
      const data = await nftContract.getMyTokens();
      const tokens = await Promise.all(
        data.map(async (_token) => {
          const tokenUri = await nftContract.tokenURI(_token);
          const token = await nftContract.marketTokens(_token);
          const cval = await nftContract.convert(token.value);
          const meta = await processUri(tokenUri);
          return {
            tokenId: Number(_token),
            value: ethers.utils.formatEther(token[1].toString()),
            convertedVal: ethers.utils.formatEther(cval.toString()),
            owner: token[2],
            seller: token[3],
            claimed: token[4],
            name: meta.data.name,
            image: meta.data.image,
            description: meta.data.description,
            attributes: meta.data.attributes,
          };
        })
      );
      console.log(tokens);
      setTokens(tokens);
      return tokens;
    } catch (e) {
      console.log(e);
    }
  };

  const sellToken = async (tokenId, _tokenValue) => {
    console.log("sell -> " + tokenId + " for " + _tokenValue);
    const tokenValue = ethers.utils.parseEther(_tokenValue.toString());
    try {
      const tx = await contract.sendTokenToMarket(tokenId, tokenValue);
      await tx.wait(1);
      console.log("Successfully listed token #" + tokenId);
      alert("Successfully listed token");
      navigate("/");
      window.location.reload();
    } catch (e) {
      console.log("Error while trying to list token: " + e);
    }
  };

  useEffect(() => {
    if (contract) {
      getTokens(contract);
    }
  }, [contract]);
  return (
    <>
      <Navigation />
      {tokens ? (
        <div className="app__profile">
          <div className="app__profile-title">All your tokens</div>
          <div className="app__profile-items">
            {tokens.length ? (
              tokens.map((token) => (
                <Card data={token} btnText="Sell" btnAction={sellToken} />
              ))
            ) : (
              <div className="empty-view">
                <div className="e-title">It's empty in here </div>
                <img src={emptyShelve} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="loading-text">Loading</div>
      )}

      <Footer />
    </>
  );
};

export default Profile;
