import axios from "axios";
import { ethers } from "ethers";
import React from "react";
import { Card } from "..";
import "./Main.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import emptyShelve from "../../assets/image/empty_shelve.jpg"

const Main = ({ contract }) => {
  const [tokens, setTokens] = useState();

  const navigate = useNavigate();

  const processUri = async (uri) => {
    const res = await axios.get(
      `https://ipfs.infura.io/ipfs/${uri.toString().split("//")[1]}`
    );
    return res;
  };

  // fetch all NFTs on the smart contract
  const getTokens = async (nftContract) => {
    try {
      const data = await nftContract.getAllMarketTokens();
      const tokens = await Promise.all(
        data.map(async (token) => {
          const tokenUri = await nftContract.tokenURI(token[0]);
          console.log(`URI [${token[0]}] -> ${tokenUri}`);
          const cval = await nftContract.convert(token[1]);
          const meta = await processUri(tokenUri);
          return {
            tokenId: Number(token[0]),
            value: ethers.utils.formatEther(token[1].toString()),
            convertedVal: ethers.utils.formatEther(cval.toString()),
            owner: token[2],
            seller: token[3].toLowerCase(),
            claimed: token[4],
            name: meta.data.name,
            image: meta.data.imageUrl,
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

  const buyToken = async (tokenId, _tokenValue) => {
    console.log(`buy ${tokenId} for ${_tokenValue}`);
    const tokenValue = ethers.utils.parseEther(_tokenValue.toString());
    try {
      const tx = await contract.buyToken(tokenId, { value: tokenValue });
      await tx.wait(1);
      console.log(`successfully bought #${tokenId} for ${tokenValue}`);
      alert("Successfully bought token");
      navigate("/");
      window.location.reload();
    } catch (e) {
      console.log("error while buying token: " + e);
    }
  };

  useEffect(() => {
    if (contract) {
      getTokens(contract);
    }
  }, [contract]);

  return (
    <>
      {tokens ? (
        <div className="app__main">
          <div className="app__main-title">All tokens currently on sale</div>
          <div className="app__main-items">
            {tokens.length ? (
              tokens.map((token) => (
                <Card data={token} btnText="Buy" btnAction={buyToken} />
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
        <div className="loading-text">Loading...</div>
      )}
    </>
  );
};

export default Main;
