const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");

async function main() {
    await getWeth();
    const { deployer } = await getNamedAccounts();
    //Need abi (grab interface from website), address to connect with Aave

    // Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    // Lending Pool: ^

    const lendingPool = await getLendingPool(deployer);
    console.log(`Retrieved Lending Pool Address: ${lendingPool.address}`);
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    // approve use of ERC-20 token usage
    await approveERC20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)

    // deposit
    console.log("Depositing...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("Deposited!")

    // Borrowing...
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer);

    // get conversion rate
    const daiPrice = await getDAIPrice();

    //const trueAmountDaiToBorrow = availableBorrowsETH.toString() * (1 / daiPrice);
    //const trueAmountDaiToBorrowWei = ethers.utils.parseEther(trueAmountDaiToBorrow.toString());


    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice);
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());


    console.log(` You can borrow in USD units: ${amountDaiToBorrow} DAI`);
    console.log(` You can borrow in WEI units ${amountDaiToBorrowWei} DAI`);

    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    await borrowDai(
        daiTokenAddress,
        lendingPool, /* Lending Pool contract */
        amountDaiToBorrowWei,
        deployer);

    await getBorrowUserData(lendingPool, deployer);
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer);
    await getBorrowUserData(lendingPool, deployer);
    
}

async function repay(
    amount,
    daiAddress,
    lendingPool,
    account
) {
    // approve use of ERC-20 token usage, any transaction with ERC20 token requires this
    await approveERC20(daiAddress, lendingPool.address, amount, account);
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
    await repayTx.wait(1);
    console.log("Repaid!");
}
async function borrowDai(
    daiAddress,
    lendingPool,
    amountDaiToBorrow,
    account
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrow,
        1, /* Interest rate mode: Stable or variable */
        0, /* Referral code */
        account
    )

    await borrowTx.wait(1);
    console.log("You've borrowed!");
    
}

async function getDAIPrice() {
    const daiEthPriceFeed = await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4");
    const price = ( await daiEthPriceFeed.latestRoundData() )[1];
    console.log(`Price of ETH/DAI: ${price.toString()}`);
    return price;
}



async function getLendingPool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account);   
    const LendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        LendingPoolAddress,
        account);
    return lendingPool;
}

async function approveERC20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account);
    tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Approved!");

}


async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account);
    
    console.log(`Total Collateral ETH deposited: ${totalCollateralETH}`);
    console.log(`Total ETH Debt: ${totalDebtETH}`);
    console.log(`ETH available to borrow: ${availableBorrowsETH}`);
    return { availableBorrowsETH, totalDebtETH };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });