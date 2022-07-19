const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const { Contract } = require("ethers");

async function main() {
  const NftContractFactory = await ethers.getContractFactory("NftContract");
  console.log("Deploying 'NftContract'...");
  const nftContract = await NftContractFactory.deploy();
  await nftContract.deployed();
  console.log(`Successfully deployed "NftContract" to ${nftContract.address}`);
  storeContractData(nftContract);
}

async function storeContractData(nftContract) {
  const dir = __dirname + "/../src/contracts";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(
    dir + "/NftContract-address.json",
    JSON.stringify({ NftContract: nftContract.address }, undefined, 2)
  );

  const NftContractArtifact = artifacts.readArtifactSync("NftContract");
  fs.writeFileSync(
    dir + "/NftContract-artifact.json",
    JSON.stringify(NftContractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
