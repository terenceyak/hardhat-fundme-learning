"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
describe("FundMe", function () {
    let fundMe;
    let mockV3Aggregator;
    const fundValue = hardhat_1.ethers.utils.parseEther("1");
    let deployer;
    beforeEach(async function () {
        const accounts = await hardhat_1.ethers.getSigners();
        // const account = accounts[0]
        deployer = accounts[0];
        await hardhat_1.deployments.fixture(["all"]);
        fundMe = await hardhat_1.ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await hardhat_1.ethers.getContract("MockV3Aggregator", deployer);
    });
    describe("constructor", async function () {
        it("sets the aggregator correctly", async function () {
            const response = await fundMe.priceFeed();
            (0, chai_1.expect)(response).to.equal(mockV3Aggregator.address);
        });
    });
    describe("fund", async function () {
        it("fails if not enough ETH sent", async function () {
            await (0, chai_1.expect)(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        });
        it("updates amount funded data struct", async function () {
            await fundMe.fund({ value: fundValue });
            (0, chai_1.expect)(await fundMe.addressToAmountFunded(deployer.address)).to.equal(fundValue);
        });
        it("adds funder to array of funders", async function () {
            await fundMe.fund({ value: fundValue });
            const funder = await fundMe.funders(0);
            (0, chai_1.expect)(funder).to.equal(deployer.address);
        });
    });
    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: fundValue });
        });
        it("withdraw eth from a single funder", async function () {
            const fundMeStartingBal = await fundMe.provider.getBalance(fundMe.address);
            const deployerStartingBal = await fundMe.provider.getBalance(deployer.address);
            const txResponse = await fundMe.withdraw();
            const txReceipt = await txResponse.wait(1);
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer.address);
            (0, chai_1.expect)(endingFundMeBalance).to.be.equal(0);
            // expect(fundMeStartingBal.add(deployerStartingBal)).to.be.equal(
            //     endingDeployerBalance.add(txReceipt.gasUsed)
            // )
        });
    });
});
//# sourceMappingURL=FundMe.test.js.map