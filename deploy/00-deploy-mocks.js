const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async ({getNamedAccounts, deployments}) => {
	console.log("Starting deploying mocks...");

	const {deploy, log} = deployments;
	const {deployer} = await getNamedAccounts();

	if (developmentChains.includes(network.name)) {
		console.log("Local network detected! Deploying mocks...");
		await deploy("MockV3Aggregator", {
			contract: "MockV3Aggregator",
			from: deployer,
			log: true,
			args: [DECIMALS, INITIAL_ANSWER],
		})
		console.log("Mocks Deployed !!");
		console.log("-------------------------------------------");
	}

	console.log("End deploying mocks...");
}

module.exports.tags = ["all", "mocks"];
// Now use the following command to deploy only mocks.
// npx hardhat deploy --tags mocks
