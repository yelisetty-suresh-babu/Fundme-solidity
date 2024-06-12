const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect, chai } = require("chai");

// const { solidity } = require("ethereum-waffle");
// chai.use(solidity);

describe("FundMe", () => {
    let fundMe, deployer, MockV3Aggregator;
    const valueFunded = "1000000000000000000";
    beforeEach(async () => {
        // for hardhat deply
        // const accounts=await ethers.getSigners();
        // const accountZero=account[0];
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });
    describe("constructor", () => {
        it("sets the aggregator address correctly", async () => {
            const res = await fundMe.priceFeed();
            const mockAddress = await MockV3Aggregator.getAddress();
            assert.equal(res, mockAddress);
        });
    });
    describe("fund", () => {
        it("fails if we don't send enough Ether", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            );
        });
        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({ value: valueFunded });
            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), valueFunded);
        });
        it("Adds funders to the funder array", async () => {
            await fundMe.fund({ value: valueFunded });
            assert.equal(await fundMe.funders(0), deployer);
        });
    });
    describe("Withdraw", () => {
        beforeEach(async () => {
            await fundMe.fund({ value: valueFunded });
        });

        it("Withdraw the balance ", async () => {
            const startDeployBalance = await ethers.provider.getBalance(
                deployer
            );
            const startfundmeBalance = await ethers.provider.getBalance(
                fundMe.target
            );

            const transactionResponse = await fundMe.withdraw();
            const transactionReciept = await transactionResponse.wait(1);

            const { gasPrice, gasUsed } = transactionReciept;
            const gasUsedPrice = gasPrice * gasUsed;

            const endDeployBalance = await ethers.provider.getBalance(deployer);
            const endfundmeBalance = await ethers.provider.getBalance(
                fundMe.target
            );

            assert.equal(endfundmeBalance.toString(), "0");
            assert.equal(
                (startDeployBalance + startfundmeBalance).toString(),
                (endDeployBalance + gasUsedPrice).toString()
            );
        });
        it("only allows owner to withdraw", async () => {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerconnected = await fundMe.connect(attacker);
            await expect(attackerconnected.withdraw()).to.be.reverted;
        });
    });
});
