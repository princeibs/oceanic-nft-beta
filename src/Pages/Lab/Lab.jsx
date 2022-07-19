import React, { useState } from "react";
import { Navigation, Footer } from "../../components";
import { useNavigate } from "react-router-dom";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useNftContract } from "../../hooks";
import { ethers } from "ethers";
import { useWallet } from "../../utils/Wallet";
import "./Lab.scss";

// initialize IPFS
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const Lab = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [ipfsImage, setIpfsImage] = useState("");
  const [attributes, setAttributes] = useState([]);

  const navigate = useNavigate();
  const contract = useNftContract();
  const { defaultAccount } = useWallet();

  const handleClose = () => {
    setAttributes([]);
    navigate("/");
  };

  const handleSetAttrib = (trait_type, e) => {
    const { value } = e.target;
    const attribObj = { trait_type, value };
    const arr = attributes;
    const index = arr.findIndex((el) => el.trait_type === trait_type);

    // if attribute already exists, update it
    if (index >= 0) {
      arr[index] = { trait_type, value };
      setAttributes(arr);
      return;
    }
    // else create new one and add to list
    setAttributes((prev) => [...prev, attribObj]);
  };

  const uploadToIpfs = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      if (!added.path) {
        alert("Failed to upload image to IPFS");
      }
      const imageUrl = `https://ipfs.infura.io/ipfs/${added.path}`;
      // const imageUrl = `ipfs://${added.path}`;
      console.log("ipfs image -> " + imageUrl);
      setIpfsImage(imageUrl);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const mintToken = async () => {
    if (!name || !description || !price || !ipfsImage) {
      alert("Please complete all fields first!");
      return;
    }
    const data = JSON.stringify({
      title: name,
      type: "object",
      name,
      description,      
      imageUrl: ipfsImage,
      mintedBy: defaultAccount,
      attributes,
    });

    try {
      console.log("Started processing metadata...");
      // save token metadata to IPFS
      const saved = await client.add(data);
      // get IPFS url for uploaded metadata
      // const savedUrl = `https://ipfs.infura.io/ipfs/${saved.path}`;
      const savedUrl = `ipfs://${saved.path}`;
      console.log(`Saved URL -> ${savedUrl}`);

      // Send metadata and mint new token from here
      console.log("Started minting token...");
      const tx = await contract.mintToken(
        savedUrl.toString(),
        ethers.utils.parseEther(price.toString())
      );
      console.log("Successfully minted token.");
      await tx.wait(1); // wait for 1 block confirmation
      navigate("/");
    } catch (e) {
      console.log(`Error while minting token -> ${e}`);
    }
  };

  return (
    <>
      <Navigation />
      <div className="app__lab">
        <div className="app__lab-title">Mint a new token</div>
        <div className="lab-form">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-div">
              <div className="form-title">Name</div>
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Name of sea creature"
              />
            </div>
            <div className="form-div">
              <div className="form-title">Description</div>
              <input
                onChange={(e) => setDescription(e.target.value)}
                type="text"
                placeholder="Description of sea creature"
              />
            </div>
            <div className="form-div">
              <div className="form-title">Price(in ETH)</div>
              <input
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="Price of token"
              />
            </div>
            <div className="form-div">
              <div className="form-title">Image</div>
              <input type="file" onChange={async (e) => uploadToIpfs(e)} />
            </div>
            <div className="form-subtitle">Properties</div>
            <div className="form-div">
              <div className="form-title">Color</div>
              <input
                type="text"
                onChange={(e) => handleSetAttrib("color", e)}
                placeholder="Color of creature"
              />
            </div>
            <div className="form-div">
              <div className="form-title">Weight</div>
              <input
                type="number"
                onChange={(e) => handleSetAttrib("weight", e)}
                placeholder="Weight of creature (in Kilograms)"
              />
            </div>
            <div className="form-div">
              <div className="form-title">Age</div>
              <input
                type="number"
                onChange={(e) => handleSetAttrib("age", e)}
                placeholder="Age of creature (in months)"
              />
            </div>
            <div className="lab-form-bottom">
              <div onClick={handleClose} className="close-btn">
                Close
              </div>
              <button
                // disabled={!ipfsImage}
                className="mint-btn"
                onClick={() => mintToken()}
              >
                Mint
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Lab;
