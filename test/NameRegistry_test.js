const assertThrows = require("./utils/assertThrows")
const { getLog } = require("./utils/txHelpers")
const timeTravel = require("./utils/timeTravel")

const MockKey = artifacts.require("../test/mock/MockKey.sol")
const NameRegistry = artifacts.require("./NameRegistry.sol")
const StakingManager = artifacts.require(
  "staked-access/contracts/StakingManager.sol"
)

contract("NameRegistry", accounts => {
  const [
    owner,
    sender, // a regular sender
    sender2, // a sender who has failed to approve a transfer of KEY
    sender3, // a sender with no KEY
    serviceProvider
  ] = accounts.slice(0)

  const now = new Date().getTime() / 1000

  let stakingManager
  let nameRegistry
  let token
  let serviceID

  before(async () => {
    // instantiation fails with invalid token address
    // deploy a mock token contract and instantiate staking manager
    token = await MockKey.new()
    stakingManager = await StakingManager.new(token.address)
    assert.notEqual(stakingManager, null)
    assert.notEqual(stakingManager, undefined)
    const contractOwner = await stakingManager.owner()
    assert.equal(contractOwner, owner)

    nameRegistry = await NameRegistry.new(stakingManager.address)
    assert.notEqual(nameRegistry, null)
    assert.notEqual(nameRegistry, undefined)
    const contractOwner2 = await nameRegistry.owner()
    assert.equal(contractOwner2, owner)

    serviceID = await nameRegistry.getStakingServiceID.call()

    // initialize senders' funds
    await token.freeMoney(sender, 4000)
    await token.freeMoney(sender2, 2000)
    await token.freeMoney(sender3, 1000)

    // approve staking manager to spend on behalf of senders
    await token.approve(stakingManager.address, 2000, { from: sender })
    await token.approve(stakingManager.address, 5000, { from: sender2 })
    await token.approve(stakingManager.address, 1000, { from: sender3 })
  })

  context("Name registration", () => {
    it("checks whether a name has been revoked or not", async () => {
      const exists = await nameRegistry.nameExists.call("cbruguera")
      assert.isFalse(exists)
    })

    it("cannot register without staking", async () => {
      await assertThrows(nameRegistry.registerName("wont.work"))
    })

    it("allows registering name after staking", async () => {
      const tx = await stakingManager.stake(1000, serviceID, { from: sender })
      //const stakeBalance = await stakingManager.balances.call(sender, serviceID)
      assert.notEqual(getLog(tx, "KEYStaked"), null) // generated event

      await nameRegistry.registerName("cbruguera", { from: sender })
      const exists = await nameRegistry.nameExists.call("cbruguera")
      assert.isTrue(exists)
    })

    it("does not allow re-registering a name", async () => {
      const tx = await stakingManager.stake(1000, serviceID, { from: sender2 })
      await assertThrows(
        nameRegistry.registerName("cbruguera", { from: sender2 })
      )
    })

    it("is able to resolve a registered name", async () => {
      const resolved = await nameRegistry.resolveName.call("cbruguera")
      // resolved name corresponds to original sender address
      assert.equal(resolved, sender)
    })

    it("revoked name (withdrawn stake) resolves to 0x0 address", async () => {
      // sender withdraws stake
      await stakingManager.withdraw(1000, serviceID, { from: sender })
      const resolved = await nameRegistry.resolveName.call("cbruguera")
      assert.equal(resolved, 0)
    })

    it("another address can take the name after revoked", async () => {
      await nameRegistry.registerName("cbruguera", { from: sender2 })
      const resolved = await nameRegistry.resolveName.call("cbruguera")
      assert.equal(resolved, sender2)
    })

    it("it allows setting a custom stake minimum", async () => {
      let minimum = await stakingManager.stakeMinimum.call(serviceID)
      assert.equal(minimum, 0)
      await nameRegistry.setMinimumStake(500)
      minimum = await stakingManager.stakeMinimum.call(serviceID)
      assert.equal(minimum, 500)
    })

    it("it does not allow registering if stake is under minimum", async () => {
      await assertThrows(
        stakingManager.stake(400, serviceID, { from: sender3 })
      )
      //await assertThrows(nameRegistry.registerName("borrrlll", { from: sender3 }))
    })

    it("it allows setting a custom stake period", async () => {
      const days = 30
      let period = await stakingManager.stakePeriods.call(serviceID)
      assert.equal(period, 0)
      await nameRegistry.setStakePeriod(days)
      period = await stakingManager.stakePeriods.call(serviceID)
      assert.equal(Number(period), days * 86400)
    })
  })
})
