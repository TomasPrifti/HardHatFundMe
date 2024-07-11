const networkConfig = {
	4: {
		name: "rinkeby",
		ethUsdPriceFeed: "",
	},
	11155111: {
		name: "sepolia",
		ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
	},
	// 31337
}

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 2000 * 100_000_000;

module.exports = {
	networkConfig,
	developmentChains,
	DECIMALS,
	INITIAL_ANSWER,
}
