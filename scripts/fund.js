const { ethers } = require("hardhat");

async function main() {
	const accounts = await ethers.getSigners();
	const signer = accounts[0];
	
	const fundMe = await ethers.getContractAt("FundMe", signer);
	console.log(`Contract FundMe at ${fundMe.target}`);

	console.log("Funding Contract...");
	const sendValue = ethers.parseEther("0.05");
	const transactionResponse = await fundMe.fund({value: sendValue})
	await transactionResponse.wait(1);
	console.log(`Funded with ${sendValue.toString()}`);
	
	const fundMeBalance = await ethers.provider.getBalance(fundMe.target);
	console.log(`Current balance: ${fundMeBalance.toString()}`);
}

main()
	.then((response) => {
		console.log(response);
		process.exit(0);
	})
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
