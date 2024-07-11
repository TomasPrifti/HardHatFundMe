const { ethers } = require("hardhat");

async function main() {
	const accounts = await ethers.getSigners();
	const signer = accounts[0];
	
	const fundMe = await ethers.getContractAt("FundMe", signer);
	console.log(`Contract FundMe at ${fundMe.target}`);

	console.log("Withdrawing from Contract...");
	const transactionResponse = await fundMe.withdraw();
	await transactionResponse.wait(1);

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
