pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'selfkey-staking/contracts/StakingManager.sol';


contract NameRegistry is Ownable {

    StakingManager public staking;
    mapping(bytes32 => address) private registry;  // should be private!?

    event NameRegistered(bytes32 name, address _address);

    constructor(address stakingAddress) public {
        staking = StakingManager(stakingAddress);
    }

    /**
     *  Returns the staking Service ID associated with this contract.
     */
    function getStakingServiceID() public view returns (bytes32){
        return keccak256(address(this));
    }

    /**
     *  Check whether a name is registered or not.
     *  If a name was registered at some point, but presently there is no stake on it,
     *  the name is considered to be revoked and thus "non-existent"
     *  @param name - Name string to check for existence
     */
    function nameExists(bytes32 name) public view returns(bool) {
        return staking.hasStakeAboveMinimum(registry[name], getStakingServiceID()) &&
            registry[name] != address(0);
    }

    /**
     *  Registers a new name.
     *  It requires a stake made by the caller address to the Name Registry Service ID
     *  If the name already exists (and stake is still holding), caller cannot register.
     *  @param name - Name to be registered
     */
    function registerName(bytes32 name) public {
        require(!nameExists(name), "name already registered");
        require(staking.hasStakeAboveMinimum(msg.sender, getStakingServiceID()), "Staking is required");

        registry[name] = msg.sender;

        emit NameRegistered(name, msg.sender);
    }

    /**
     *  Resolves a name to its corresponding address, given that the stake is still holding
     *  @param name - Name to be resolved
     */
    function resolveName(bytes32 name) public view returns(address) {
        if (nameExists(name)) {
            return registry[name];
        } else {
            return address(0);
        }
    }

    /**
     *  Contract owner can set a custom minimum stake for registering names
     *  @param minimum - amount of tokens to be set as minimum stake
     */
    function setMinimumStake(uint256 minimum) public onlyOwner {
        staking.setServiceMinimumStake(minimum);
        // TODO: trigger event
    }

    /**
     *  Contract owner can set a custom staking period for locking stakes
     *  @param period - period to set as minimum stake period (in days)
     */
    function setStakePeriod(uint256 period) public onlyOwner {
        staking.setServiceStakePeriod(period);
        // TODO: trigger event
    }
}
