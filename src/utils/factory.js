export const getTokens = async (nftContract) => {
  try {
    const data = await nftContract.getAllMarketTokens();
    const tokens = await Promise.all(
      data.map(async (token) => {
        const tokenUri = await nftContract.tokenURI(token[0]);
        const cval = await nftContract.convert(token[1]);
        const meta = await axios.get(tokenUri);
        return {
          tokenId: Number(token[0]),
          value: ethers.utils.formatEther(token[1].toString()),
          convertedVal: ethers.utils.formatEther(cval.toString()),
          owner: token[2],
          seller: token[3],
          claimed: token[4],
          name: meta.data.name,            
          image: (meta.data.image).toString().split("//")[0],
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