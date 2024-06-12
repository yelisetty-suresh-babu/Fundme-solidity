const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // Replace with your deployed contract address
    const fundMeAddress = "0x8E223D1e0883C0AFCb0D09ab9D63611E536305d9";

    // Replace with the owner's address and private key
    const ownerAddress = "0xd328398d75610c55A3da1f19450ABb75405bFc13";
    const ownerPrivateKey = process.env.PRIVATE_KEY;

    // Initialize a wallet instance with the owner's private key
    const ownerWallet = new ethers.Wallet(ownerPrivateKey, ethers.provider);

    // Get the contract's ABI and bytecode
    const FundMe = await ethers.getContractFactory("FundMe");

    // Get the deployed contract instance
    const fundMe = await FundMe.attach(fundMeAddress);

    console.log(
        `Attempting to withdraw funds from contract at address ${fundMeAddress} using account ${ownerAddress}`
    );

    // Call the withdraw function from the owner's address
    const transactionResponse = await fundMe.connect(ownerWallet).withdraw();
    const transactionReceipt = await transactionResponse.wait(1);

    console.log(
        `Withdrawal complete! Transaction hash: ${transactionReceipt.transactionHash}`
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
