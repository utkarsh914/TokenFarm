pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
	
	string public name = "DApp Token Farm";
	address public owner;
	DappToken public dappToken;
	DaiToken public daiToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	// events
	event Staked(
		address _address,
		uint daiTokenBalance,
		uint dappTokenBalance,
		uint stakingBalance
	);

	event Unstaked(
		address _address,
		uint daiTokenBalance,
		uint dappTokenBalance,
		uint stakingBalance
	);

	constructor(DappToken _dappToken, DaiToken _daiToken) public {
		owner = msg.sender;
		dappToken = _dappToken;
		daiToken = _daiToken;
	}


	function stakeTokens(uint _amount) public {
		require(_amount > 0, "Amount cannot be zero");

		address staker = msg.sender;
		// transfer DAI tokens to this contract for staking
		daiToken.transferFrom(staker, address(this), _amount);
		// update staking balance
		stakingBalance[staker] = stakingBalance[staker] + _amount;
		// add this user to stakers arr *ONLY* if they haven't staked already
		if (hasStaked[staker] == false)
			stakers.push(staker);
		
		// update staking status
		hasStaked[staker] = true;
		isStaking[staker] = true;

		// emit daitoken, dapptoken, and staking balance
		emit Staked(
			staker,
			daiToken.balanceOf(staker),
			dappToken.balanceOf(staker),
			stakingBalance[staker]
		);
	}

	// unstakes all whole token balance that is staked currently
	function unstakeTokens() public {
		address staker = msg.sender;
		uint balance = stakingBalance[staker];
		require(balance > 0, "Balance cannot be zero");
		
		// transfer DAI tokens to staker from this contract
		daiToken.transfer(staker, balance);
		// update staking balance
		stakingBalance[staker] = 0;
		// update staking status
		isStaking[staker] = false;

		// emit daitoken, dapptoken, and staking balance
		emit Unstaked(
			staker,
			daiToken.balanceOf(staker),
			dappToken.balanceOf(staker),
			0
		);
	}


	// issuing tokens
	function issueTokens() public {
		require(msg.sender == owner, "Caller must be the owner");

		// issue tokens to all stakers
		for (uint i = 0; i < stakers.length; i++) {
			address recepient = stakers[i];
			uint balance = stakingBalance[recepient];
			if (balance > 0) {
				// issue same amount of dapp tokens, as their DAI tokens currently staked
				dappToken.transfer(recepient, balance);
			}
		}
	}
}