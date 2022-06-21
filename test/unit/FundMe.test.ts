import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers, deployments } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain"

describe("FundMe", function () {
    let fundMe: FundMe
    let mockV3Aggregator: MockV3Aggregator
    const fundValue = ethers.utils.parseEther("1")
    let deployer: SignerWithAddress
    beforeEach(async function () {
        const accounts = await ethers.getSigners()
        // const account = accounts[0]
        deployer = accounts[0]
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async function () {
        it("sets the aggregator correctly", async function () {
            const response = await fundMe.getPriceFeed()
            expect(response).to.equal(mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("fails if not enough ETH sent", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("updates amount funded data struct", async function () {
            await fundMe.fund({ value: fundValue })
            expect(
                await fundMe.getAddressToAmountFunded(deployer.address)
            ).to.equal(fundValue)
        })

        it("adds funder to array of funders", async function () {
            await fundMe.fund({ value: fundValue })
            const funder = await fundMe.getFunder(0)
            expect(funder).to.equal(deployer.address)
        })
    })

    describe("withdraw", function () {
        beforeEach(async function () {
            await fundMe.fund({ value: fundValue })
        })

        it("withdraw eth from a single funder", async function () {
            const fundMeStartingBal = await fundMe.provider.getBalance(
                fundMe.address
            )
            const deployerStartingBal = await fundMe.provider.getBalance(
                deployer.address
            )
            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)

            const { gasUsed, effectiveGasPrice } = txReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            expect(endingFundMeBalance).to.be.equal(0)
            expect(fundMeStartingBal.add(deployerStartingBal)).to.be.equal(
                endingDeployerBalance.add(gasCost)
            )
        })

        it("allows us to withdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: fundValue })
            }
            const fundMeStartingBal = await fundMe.provider.getBalance(
                fundMe.address
            )
            const deployerStartingBal = await fundMe.provider.getBalance(
                deployer.address
            )
            const txResponse = await fundMe.withdraw()
            const txReceipt = await txResponse.wait(1)

            const { gasUsed, effectiveGasPrice } = txReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            expect(endingFundMeBalance).to.be.equal(0)
            expect(fundMeStartingBal.add(deployerStartingBal)).to.be.equal(
                endingDeployerBalance.add(gasCost)
            )

            // funders reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                expect(
                    await fundMe.getAddressToAmountFunded(accounts[i].address)
                ).to.be.equal(0)
            }
        })

        it("only allows owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            await expect(
                fundMe.connect(attacker).withdraw()
            ).to.be.revertedWith("FundMe__NotOwner")
        })

        it("allows us to cheaper withdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: fundValue })
            }
            const fundMeStartingBal = await fundMe.provider.getBalance(
                fundMe.address
            )
            const deployerStartingBal = await fundMe.provider.getBalance(
                deployer.address
            )
            const txResponse = await fundMe.cheaperWithdraw()
            const txReceipt = await txResponse.wait(1)

            const { gasUsed, effectiveGasPrice } = txReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            expect(endingFundMeBalance).to.be.equal(0)
            expect(fundMeStartingBal.add(deployerStartingBal)).to.be.equal(
                endingDeployerBalance.add(gasCost)
            )

            // funders reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                expect(
                    await fundMe.getAddressToAmountFunded(accounts[i].address)
                ).to.be.equal(0)
            }
        })
    })
})
