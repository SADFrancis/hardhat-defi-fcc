
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()


const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli/example";
const PRIVATE_KEY = process.env.PRIVATE_KEY_2 || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKET = process.env.COINMARKET_API_KEY || "key";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://eth-mainnet/example";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.9" }, { version: "0.4.19" },{ version: "0.6.12" }],
  },
  namedAccounts: {
    deployer: {
      default: 0,
      player: 1
    },
  },

  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
      saveDeployments: true,
    },
    hardhat: {
    //url: "http://127.0.0.1:8545/",
      chainId: 31337,
      blockConfirmations: 1,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    // localhost: {
    //   chainId: 1337 || 31337,
    //   blockConfirmations: 1,
    // },
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKET,
  },
  mocha: {
    timeout: 500*1e3 // 500 seconds, counted in milliseconds
  },
  contractSizer: {
    runOnCompile: false,
    only: ["Raffle"],
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
        default: 1,
    },
  },
  etherscan: {
    // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
        goerli: ETHERSCAN_API_KEY,
    },
  },
  
};
