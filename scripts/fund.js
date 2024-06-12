const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
    const { deployer } = await getNamedAccounts();

    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding the contract .....");
    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    });
    const transactionReciept = await transactionResponse.wait(1);

    console.log("contract funded....");
};

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
