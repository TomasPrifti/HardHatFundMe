// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256) {
        // Sepolia Testnet: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
        // ETH/USD Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        //(uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = priceFeed.latestRoundData();
        (,int256 answer,,,) = priceFeed.latestRoundData();
        // ETH in terms of USD
        // 3000.00000000
        return uint256(answer * 1e10);
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1e18;
        return  ethAmountInUSD;
    }

    function getVersion() internal view returns(uint256) {
        // Sepolia Testnet: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
        // ETH/USD Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        return AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306).version();
    }

    function getDecimals() internal view returns(uint8) {
        // Sepolia Testnet: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
        // ETH/USD Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        return AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306).decimals();
    }
}
