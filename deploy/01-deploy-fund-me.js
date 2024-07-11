/*
// This is another method to declare the deploy function.
// "hre" is the HardHat Runtime Environment.
function deployFunc(hre) {
	console.log('test-1');
}
module.exports.default = deployFunc;
*/

const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

// "hre" is the HardHat Runtime Environment.
module.exports = async ({getNamedAccounts, deployments}) => {
	console.log("Starting deploying...");

	const {deploy, log} = deployments;
	const {deployer} = await getNamedAccounts();
	const chainId = network.config.chainId;

	// When going for localhost or hardhat network, we want to use mock.
	// What if we change Chain?

	//const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	let ethUsdPriceFeedAddress;
	if (developmentChains.includes(network.name)) {
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	const args = [ethUsdPriceFeedAddress]; // "priceFeedAddress"
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(fundMe.address, args);
	}
	console.log("-------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
// Now use the following command to deploy only fundme.
// npx hardhat deploy --tags fundme
