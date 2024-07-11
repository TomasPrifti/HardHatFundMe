const { deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", async function () {
			let fundMe, mockV3Aggregator, accounts, signer;
			const sendValue = ethers.parseEther("1"); // 1 ETH = 1000000000000000000 (18 zeros)

			beforeEach(async function () {
				console.log("Deploying FundMe contract with HardHat...");

				accounts = await ethers.getSigners();
				signer = accounts[0];

				//deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(["all"]);

				const fundMeDeployment = await deployments.get("FundMe");
				fundMe = await ethers.getContractAt(
					fundMeDeployment.abi,
					fundMeDeployment.address,
					signer,
				);

				const mockV3AggregatorDeployment =
					await deployments.get("MockV3Aggregator");
				mockV3Aggregator = await ethers.getContractAt(
					mockV3AggregatorDeployment.abi,
					mockV3AggregatorDeployment.address,
					signer,
				);
			});

			describe("constructor", async function () {
				it("Sets the aggregator address correctly", async function () {
					const response = await fundMe.getPriceFeed();
					assert.equal(response, mockV3Aggregator.target);
				});
			});

			describe("fund", async function () {
				it("Fails if you don't send enough ETH", async function () {
					await expect(fundMe.fund()).to.be.reverted;
				});
				it("Updated the amount funded data structure", async function () {
					await fundMe.fund({ value: sendValue });
					const response = await fundMe.getAddressToAmountFunded(
						signer.address,
					);
					assert.equal(response.toString(), sendValue.toString());
				});
				it("Adds funder to array of funder", async function () {
					await fundMe.fund({ value: sendValue });
					const funder = await fundMe.getFunder(0);
					assert.equal(funder, signer.address);
				});
			});

			describe("withdraw", async function () {
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue });
				});

				it("Withdraw ETH from a single founder", async function () {
					const startingFundMeBalance =
						await ethers.provider.getBalance(fundMe.target);
					const startingDeployerBalance =
						await ethers.provider.getBalance(signer.address);

					const transactionResponse = await fundMe.withdraw();
					const transactionReceipt =
						await transactionResponse.wait(1);
					const { gasUsed, gasPrice } = transactionReceipt;
					const gasCost = gasUsed * gasPrice;

					const endingFundMeBalance =
						await ethers.provider.getBalance(fundMe.target);
					const endingDeployerBalance =
						await ethers.provider.getBalance(signer.address);

					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance + startingDeployerBalance, // It can also be converted with toString()
						endingDeployerBalance + gasCost, // It can also be converted with toString()
					);
				});

				it("allows us to withdraw with multiple funders", async function () {
					for (let i = 1; i < accounts.length; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i],
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}

					const startingFundMeBalance =
						await ethers.provider.getBalance(fundMe.target);
					const startingDeployerBalance =
						await ethers.provider.getBalance(signer.address);

					const transactionResponse = await fundMe.withdraw();
					const transactionReceipt =
						await transactionResponse.wait(1);
					const { gasUsed, gasPrice } = transactionReceipt;
					const gasCost = gasUsed * gasPrice;

					const endingFundMeBalance =
						await ethers.provider.getBalance(fundMe.target);
					const endingDeployerBalance =
						await ethers.provider.getBalance(signer.address);

					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance + startingDeployerBalance, // It can also be converted with toString()
						endingDeployerBalance + gasCost, // It can also be converted with toString()
					);

					// Make sure that the funders are reset properly.
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (let i = 1; i < accounts.length; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address,
							),
							0,
						);
					}
				});

				it("only allows the owner to withdraw", async function () {
					const attacker = accounts[1];
					const attackerConnectedContract =
						await fundMe.connect(attacker);
					await expect(
						attackerConnectedContract.withdraw(),
					).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
				});

				it("cheaperWithdraw testing with a single funder", async function () {
					const startingFundMeBalance =
						await ethers.provider.getBalance(fundMe.target);
					const startingDeployerBalance =
						await ethers.provider.getBalance(signer.address);

					const transactionResponse = await fundMe.cheaperWithdraw();
					const transactionReceipt =
						await transactionResponse.wait(1);
					const { gasUsed, gasPrice } = transactionReceipt;
					const gasCost = gasUsed * gasPrice;

					const endingFundMeBalance =
						await ethers.provider.getBalance(fundMe.target);
					const endingDeployerBalance =
						await ethers.provider.getBalance(signer.address);

					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance + startingDeployerBalance, // It can also be converted with toString()
						endingDeployerBalance + gasCost, // It can also be converted with toString()
					);
				});

				it("cheaperWithdraw testing with multiple funder", async function () {
					for (let i = 1; i < accounts.length; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i],
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}

					const startingFundMeBalance =
						await ethers.provider.getBalance(fundMe.target);
					const startingDeployerBalance =
						await ethers.provider.getBalance(signer.address);

					const transactionResponse = await fundMe.cheaperWithdraw();
					const transactionReceipt =
						await transactionResponse.wait(1);
					const { gasUsed, gasPrice } = transactionReceipt;
					const gasCost = gasUsed * gasPrice;

					const endingFundMeBalance =
						await ethers.provider.getBalance(fundMe.target);
					const endingDeployerBalance =
						await ethers.provider.getBalance(signer.address);

					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance + startingDeployerBalance, // It can also be converted with toString()
						endingDeployerBalance + gasCost, // It can also be converted with toString()
					);

					// Make sure that the funders are reset properly.
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (let i = 1; i < accounts.length; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address,
							),
							0,
						);
					}
				});
			});
		});
