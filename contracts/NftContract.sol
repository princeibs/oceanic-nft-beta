// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftContract is ERC721URIStorage, Ownable {
    AggregatorV3Interface internal priceFeed;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter public _marketTokensCount;
    Counters.Counter public _marketTokensSold;

    mapping(uint256 => MarketToken) public marketTokens;
    modifier isOwner(uint256 _tokenId) {
        require(msg.sender == ownerOf(_tokenId));
        _;
    }

    event TokenMinted(address indexed creator, uint256 _tokenId);
    event BuyToken(uint256 _tokenId);
    event ClaimContractFunds();
    event MarketTokenCreated(
        uint256 _tokenId,
        uint256 value,
        address payable owner,
        address payable seller,
        bool claimed
    );

    struct MarketToken {
        uint256 _tokenId;
        uint256 value;
        address payable owner;
        address payable seller;
        bool claimed;
    }

    constructor() ERC721("Oceanic", "OCN") {
        priceFeed = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
    }

    // create a MarketToken
    function createMarketToken(uint256 _tokenId, uint256 tokenValue) private {
        require(tokenValue > 0, "token value too low");
        marketTokens[_tokenId] = MarketToken(
            _tokenId,
            tokenValue,
            payable(address(this)),
            payable(msg.sender),
            false
        );

        emit MarketTokenCreated(
            _tokenId,
            tokenValue,
            payable(address(this)),
            payable(msg.sender),
            false
        );
    }

    // put up token for sale
    function sendTokenToMarket(uint256 _tokenId, uint256 tokenValue)
        public
        isOwner(_tokenId)
    {
        createMarketToken(_tokenId, tokenValue);
        _marketTokensCount.increment();
        _transfer(msg.sender, address(this), _tokenId);
    }

    // mint a new token
    function mintToken(string calldata tokenURI, uint256 tokenValue) public {
        require(tokenValue > 0, "token value too low");
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        sendTokenToMarket(newTokenId, tokenValue);
        emit TokenMinted(msg.sender, newTokenId);
    }

    // buy token from market
    function buyToken(uint256 _tokenId) public payable {
        uint256 cost = marketTokens[_tokenId].value;
        address payable seller = marketTokens[_tokenId].seller;
        require(msg.sender != seller, "seller cannot buy own token");
        require(msg.value >= cost, "funds not enough for purchase");

        _buyToken(_tokenId, msg.sender);
        (bool success, ) = seller.call{value: cost}("");
        require(success, "Transfer not successful");
    }

    // actually buy the token ^_^
    function _buyToken(uint256 _tokenId, address newOwner) private {
        marketTokens[_tokenId].claimed = true;
        marketTokens[_tokenId].owner = payable(newOwner);
        marketTokens[_tokenId].seller = payable(address(0));

        _marketTokensSold.increment();
        _transfer(address(this), newOwner, _tokenId);

        emit BuyToken(_tokenId);
    }

    // get all tokens user owns
    function getMyTokens() public view returns (uint256[] memory) {
        uint256 index;
        uint256 totalTokensCount = _tokenIdCounter.current();
        uint256[] memory myTokens = new uint256[](balanceOf(msg.sender));

        for (uint256 i = 0; i < totalTokensCount; ) {
            if (ownerOf(i) == msg.sender) {
                myTokens[index] = i;
                index++;
            }
            ++i;
        }
        return myTokens;
    }

    // return if `_tokenId` is not in market
    function tokenInMarket(uint256 _tokenId) public view returns (bool) {
        require(_exists(_tokenId), "Operator query for nonexistent token");
        return !marketTokens[_tokenId].claimed;
    }

    // get all tokens available for sale in market
    function getAllMarketTokens() public view returns (MarketToken[] memory) {
        uint256 unclaimedTokensCount = _marketTokensCount.current() -
            _marketTokensSold.current();
        uint256 index = 0;

        MarketToken[] memory allMarketTokens = new MarketToken[](
            unclaimedTokensCount
        );
        for (uint256 i = 0; i < _tokenIdCounter.current(); ) {
            if (tokenInMarket(i)) {
                allMarketTokens[index] = marketTokens[i];
                index++;
            }
            ++i;
        }
        return allMarketTokens;
    }

    // check contract balance
    function contractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    // claim contract funds
    function claimContractFunds() public payable onlyOwner {
        payable(msg.sender).transfer(contractBalance());
        emit ClaimContractFunds();
    }

    // return count of total tokens minted
    function getTokensLength() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // convert eth amount to USD value
    function convert(int256 ethAmount) public view returns (int256) {
        (, int256 _price, , , ) = priceFeed.latestRoundData();
        int256 price = (_price * 10**18) / 10**8;
        return (price * ethAmount) / 10**18;
    }

    receive() external payable {}
}
