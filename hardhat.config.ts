import * as dotenv from "dotenv"

import { HardhatUserConfig, task } from "hardhat/config"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "hardhat-deploy"

dotenv.config()

const COINMARKETCAP_API_KEY =
    process.env.COINMARKETCAP_API_KEY || "66c9c713-b4a8-4fc3-869c-f55c871963df"
const RINKEBY_RPC_URL =
    process.env.RINKEBY_RPC_URL ||
    "https://eth-rinkeby.alchemyapi.io/v2/Rx2k2ZbXDORox2s90H8-VE-xVG5Kx9kR"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "88ab0ad9b8cbfa3ff35cf227dca1698a030f5e91352a9038046364822310a736"
const ETHERSCAN_API_KEY =
    process.env.ETHERSCAN_API_KEY || "NAVZFDJHJ1T9S8MSH2N6G4TKDDTIJ7I8H4"

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL || "",
            accounts: [PRIVATE_KEY],
            chainId: 4,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
}

export default config
