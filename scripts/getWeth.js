const { getNamedAccounts, ethers } = require("hardhat");

const AMOUNT = ethers.utils.parseEther("0.02");

async function getWeth(){
    const { deployer } = await getNamedAccounts();

    // abi -> IWeth.sol, compiled
    // weth address 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2


    const iWeth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        deployer
    ); // get contract AT this address

    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);
    const wethBalance = await iWeth.balanceOf(deployer);
    console.log(`Got ${(wethBalance/(10**18)).toString()} WETH`);
    // received 20000000000000000 WETH in wei => 0.02 WETH in wei => 0.02*10**18 

}

module.exports = { getWeth, AMOUNT };