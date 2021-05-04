const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
	.use(require('chai-as-promised'))
	.should();

function tokens(n) {
	return web3.utils.toWei(n, 'Ether')
}

contract('TokenFarm', (accounts) => {
	let daiToken, dappToken, tokenFarm;
	let [owner, investor] = accounts

	before(async () => {
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

		// transfer all (1 Million) dapp tokens to TokenFarm
		await dappToken.transfer(tokenFarm.address, tokens('1000000'));
		// transfer 100 mock DAI tokens to investor (second account in this case)
		await daiToken.transfer(investor, tokens('100'), {from: owner});
	})

	describe('Mock DAI deployment', async () => {
		it('has a name', async () => {
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('Dapp Token deployment', async () => {
		it('has a name', async () => {
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})

	describe('Token Farm deployment', async () => {
		it('has a name', async () => {
			const name = await tokenFarm.name()
			assert.equal(name, 'DApp Token Farm')
		})

		it('contract has 1M dapp tokens', async () => {
			const balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance, tokens('1000000'))
		})
	})

	describe('Farming Tokens', async () => {
		it('rewards investor for staking DAI token', async () => {
			let result

			// check investor balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'),
				'Incorrect Investor DAI balance before staking')
			
			// stake DAI tokens
			await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
			await tokenFarm.stakeTokens(tokens('100'), {from: investor})

			// check investor balance after staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'),
				'Incorrect Investor DAI balance after staking')

			// check if tokenFarm's DAI balance has been incremented
			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'),
				'Incorrect TokenFarm DAI balance after staking')

			// check investor staking balance after staking
			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'),
				'Incorrect Investor DAI staking balance after staking')

			// check if investor IS STAKING after staking operation
			result = await tokenFarm.isStaking(investor)
			assert.equal(result, true,
				"Incorrect Investor's isStaking status after staking operation")


			// ISSUE TOKENS

			// ensure that only owner can issue tokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected
			// issue tokens now (from owner)
			await tokenFarm.issueTokens({ from: owner })

			// check balances after issuing
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'),
				'Incorrect Investor dapp balance after issuing')


			// UNSTAKE TOKENS

			await tokenFarm.unstakeTokens({ from: investor })

			// check investor DAI balance after unstaking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'),
				'Correct Investor DAI balance after un-staking')

			// check DAI balance of tokenFarm smart contract
			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'),
				'Correct DAI balance of tokenFarm smart contract after un-staking')

			// check staking DAI balance of investor in smart contract
			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'),
				'Correct staking DAI balance of investor in contract after un-staking')

		})
	})
})