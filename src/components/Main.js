import React, { Component } from 'react'
import dai from '../dai.png'

class Main extends Component {

	constructor(props) {
		super(props)
		this.state = { value: 0 }
	}

	handleChange = (e) => {
		this.setState({ value: e.target.value })
	}

	handleStakeTokens = async (e) => {
		e.preventDefault()
		let amount
		amount = this.state.value.toString()
		amount = window.web3.utils.toWei(amount, 'Ether')
		await this.props.stakeTokens(amount)
	}

	handleUnstakeTokens = async (e) => {
		e.preventDefault()
		await this.props.unstakeTokens()
	}
	

	render() {
		return (
			<div id="content" className="mt-3">

				<table className="table table-borderless text-muted text-center">
					<thead>
						<tr>
							<th scope="col">Staking Balance</th>
							<th scope="col">Reward Balance</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{window.web3.utils.fromWei(this.props.stakingBalance, 'Ether')} mDAI</td>
							<td>{window.web3.utils.fromWei(this.props.dappTokenBalance, 'Ether')} DAPP</td>
						</tr>
					</tbody>
				</table>

				<div className="card mb-4" >
					<div className="card-body">

						<form className="mb-3" onSubmit={this.handleStakeTokens}>
							
							<div>
								<label className="float-left"><b>Stake Tokens</b></label>
								<span className="float-right text-muted">
									Balance: {window.web3.utils.fromWei(this.props.daiTokenBalance, 'Ether')}
								</span>
							</div>

							<div className="input-group mb-4">
								<input
									type="number"
									value={this.state.value}
									onChange={this.handleChange}
									className="form-control form-control-lg"
									required />
								<div className="input-group-append">
									<div className="input-group-text">
										<img src={dai} height='32' alt=""/>
										&nbsp;&nbsp;&nbsp; mDAI
									</div>
								</div>
							</div>

							<button type="submit" className="btn btn-primary btn-block btn-lg">STAKE!</button>
						</form>

						<button
							type="submit"
							className="btn btn-link btn-block btn-sm"
							onClick={this.handleUnstakeTokens}>
								UN-STAKE...
						</button>
					
					</div>
				</div>

			</div>
		);
	}
}

export default Main;