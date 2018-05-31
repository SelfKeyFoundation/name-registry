const NameRegistry = artifacts.require("./NameRegistry.sol")

module.exports = deployer => {
  const stakingAddress = "0xcd5d8d5612e2bb45e45cbee556b69a3985f6bd8a" // Ropsten KI Token

  deployer.deploy(NameRegistry, stakingAddress)
}
