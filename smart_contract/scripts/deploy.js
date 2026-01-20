const hre = require("hardhat");

async function main() {
  const Transactions = await hre.ethers.getContractFactory("Transactions");
  const transactionsContract = await Transactions.deploy();

  // ✅ ethers v6 way
  await transactionsContract.waitForDeployment();

  console.log(
    "Transactions deployed to:",
    await transactionsContract.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
