const networkConfig = {
    rinkeby: {
        chainId: 4,
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
        blockConfirmations: 6,
    },
    localhost: {
        blockConfirmations: 0,
    },
    hardhat: {
        blockConfirmations: 0,
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
