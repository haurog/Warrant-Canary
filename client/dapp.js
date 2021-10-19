

// contract address on Ropsten:
const ssAddress = '0x295eb38E3660d440B1dd54822644E545635f44E1'

// add contract ABI from Remix:

const ssABI =
[
	{
		"inputs": [],
		"name": "retrieve",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "num",
				"type": "uint256"
			}
		],
		"name": "store",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

// Using the 'load' event listener for Javascript to
// check if window.ethereum is available

window.addEventListener('load', function() {

  if (typeof window.ethereum !== 'undefined') {
    console.log('window.ethereum is enabled')
    if (window.ethereum.isMetaMask === true) {
      console.log('MetaMask is active')
      let mmDetected = document.getElementById('mm-detected')
      mmDetected.innerHTML += 'MetaMask Is Available!'

      // add in web3 here
      var web3 = new Web3(window.ethereum)

    } else {
      console.log('MetaMask is not available')
      let mmDetected = document.getElementById('mm-detected')
      mmDetected.innerHTML += 'MetaMask Not Available!'
      // let node = document.createTextNode('<p>MetaMask Not Available!<p>')
      // mmDetected.appendChild(node)
    }
  } else {
    console.log('window.ethereum is not found')
    let mmDetected = document.getElementById('mm-detected')
    mmDetected.innerHTML += '<p>MetaMask Not Available!<p>'
    alert("you have no metamask installed")
  }
})


var web3 = new Web3(window.ethereum)

// Grabbing the button object,

const mmEnable = document.getElementById('mm-connect');

// since MetaMask has been detected, we know
// `ethereum` is an object, so we'll do the canonical
// MM request to connect the account.
//
// typically we only request access to MetaMask when we
// need the user to do something, but this is just for
// an example

mmEnable.onclick = async () => {
  await ethereum.request({ method: 'eth_requestAccounts'})
  // grab mm-current-account
  // and populate it with the current address
  var mmCurrentAccount = document.getElementById('mm-current-account');
  mmCurrentAccount.innerHTML = 'Current Account: ' + ethereum.selectedAddress
}

// grab the button for input to a contract:

const ssSubmit = document.getElementById('ss-input-button');

ssSubmit.onclick = async () => {
  // grab value from input

  const ssInputValue = document.getElementById('ss-input-box').value;
  console.log(ssInputValue)

  var web3 = new Web3(window.ethereum)

  // instantiate smart contract instance

  const simpleStorage = new web3.eth.Contract(ssABI, ssAddress)
  simpleStorage.setProvider(window.ethereum)

  await simpleStorage.methods.store(ssInputValue).send({from: ethereum.selectedAddress})

}

const ssGetValue = document.getElementById('ss-get-value')

ssGetValue.onclick = async () => {

  var web3 = new Web3(window.ethereum)

  const simpleStorage = new web3.eth.Contract(ssABI, ssAddress)
  simpleStorage.setProvider(window.ethereum)

  var value = await simpleStorage.methods.retrieve().call()

  console.log(value)

  const ssDisplayValue = document.getElementById('ss-display-value')

  ssDisplayValue.innerHTML = 'Current Simple Storage Value: ' + value

}

