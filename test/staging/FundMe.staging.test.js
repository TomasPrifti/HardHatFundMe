const { deployments, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", async function () {
			let fundMe, accounts, signer;
			const sendValue = ethers.parseEther("0.05");

			beforeEach(async function () {
				console.log("Deploying FundMe contract with HardHat on a Testnet...");

				accounts = await ethers.getSigners();
				signer = accounts[0];

				const fundMeDeployment = await deployments.get("FundMe");
				fundMe = await ethers.getContractAt(
					fundMeDeployment.abi,
					fundMeDeployment.address, // Deployed at 0x75E049E6194c00cC8c7871BCf9E6F7ACA774DBAe
					signer,
				);
			});

			it("allows people to fund and withdraw", async function () {
				await fundMe.fund({ value: sendValue });
				await fundMe.withdraw();
				const endingBalance = await ethers.provider.getBalance(
					fundMe.target,
				);
				assert.equal(endingBalance.toString(), "0");
			});
		});
