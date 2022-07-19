import { useContract } from "./useContract";
import NftContract from "../contracts/NftContract-artifact.json";
import NftContractAddress from "../contracts/NftContract-address.json";

export const useNftContract = () =>
  useContract(NftContract.abi, NftContractAddress.NftContract);
