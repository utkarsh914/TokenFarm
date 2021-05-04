import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

	async componentWillMount() {
		await this.loadWeb3()
		await this.loadBlockChainData()
	}



	loadWeb3 = async () => {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum)
			await window.ethereum.enable()
		}
		else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
		}
		else {
			window.alert("Non ethereum browser detected. Try MetaMask!")
		}
	}



	loadBlockChainData = async () => {

		const web3 = window.web3

		const accounts = await web3.eth.getAccounts()
		this.setState({account: accounts[0]})

		const networkId = await web3.eth.net.getId()

		// load DAI token
		const daiTokenData = DaiToken.networks[networkId]
		if (daiTokenData) {
			const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
			const daiTokenBalance =
				(await daiToken.methods.balanceOf(this.state.account).call()).toString()
			this.setState({ daiToken, daiTokenBalance })
			// console.log({ daiTokenBalance })
		}
		else {
			window.alert("DAI Token contract not deployed to detected network!")
		}

		// load DApp token
		const dappTokenData = DappToken.networks[networkId]
		if (dappTokenData) {
			const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
			const dappTokenBalance =
				(await dappToken.methods.balanceOf(this.state.account).call()).toString()
			this.setState({ dappToken, dappTokenBalance })
			// console.log({ dappTokenBalance })
		}
		else {
			window.alert("DApp Token contract not deployed to detected network!")
		}

		// load Token Farm
		const tokenFarmData = TokenFarm.networks[networkId]
		if (tokenFarmData) {
			const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
			const stakingBalance =
				(await tokenFarm.methods.stakingBalance(this.state.account).call()).toString()
			this.setState({ tokenFarm, stakingBalance })
			// console.log({ stakingBalance })
		}
		else {
			window.alert("Token Farm contract not deployed to detected network!")
		}

		this.setState({ loading: false })
	}



	stakeTokens = async (amount) => {
		this.setState({ loading: true })

		const result_0 = await this.state.daiToken.methods
			.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account })
			
		const result =	await this.state.tokenFarm.methods
			.stakeTokens(amount).send({ from: this.state.account })
		
		const { daiTokenBalance, dappTokenBalance, stakingBalance } =
			result.events.Staked.returnValues
		// console.log({ daiTokenBalance, dappTokenBalance, stakingBalance })
		this.setState({ daiTokenBalance, dappTokenBalance, stakingBalance, loading: false })
	}


	unstakeTokens = async () => {
		this.setState({ loading: true })
		
		const result = await this.state.tokenFarm.methods
			.unstakeTokens().send({ from: this.state.account })
		
		const {daiTokenBalance, dappTokenBalance, stakingBalance} =
			result.events.Unstaked.returnValues
		// console.log({daiTokenBalance, dappTokenBalance, stakingBalance})
		this.setState({ daiTokenBalance, dappTokenBalance, stakingBalance, loading: false })
	}



	constructor(props) {
		super(props)
		this.state = {
			account: '0x0',
			daiToken: {},
			dappToken: {},
			tokenFarm: {},
			daiTokenBalance: '0',
			dappTokenBalance: '0',
			stakingBalance: '0',
			loading: true
		}
	}



	render() {
		let content
		if (this.state.loading) {
			content =
			<div className="d-flex justify-content-center mt-5 pt-5">
				<div className="spinner-border text-primary" role="status" style={{width: "3rem", height: "3rem"}}>
					<span className="sr-only">Loading...</span>
				</div>
			</div>
		}
		else {
			content = <Main
				daiTokenBalance = {this.state.daiTokenBalance}
				dappTokenBalance = {this.state.dappTokenBalance}
				stakingBalance = {this.state.stakingBalance}
				stakeTokens={this.stakeTokens}
				unstakeTokens={this.unstakeTokens}
			/>
		}

		return (
			<div>
				<Navbar account={this.state.account} />
				<div className="container-fluid mt-5">
					<div className="row">
						<main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
							<div className="content mr-auto ml-auto">
								<a
									href="https://utkarsh914.github.io"
									target="_blank"
									rel="noopener noreferrer"
								>
								</a>

								{content}

							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}
}



export default App;
