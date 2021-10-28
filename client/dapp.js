
// import WarrantCanary from './../build/contracts/WarrantCanary.json'


// contract address on Ropsten:
// const ssAddress = '0x295eb38E3660d440B1dd54822644E545635f44E1'
const wcAddress = '0xd104E11d5663cca951e023b7873689641e24dc96'

// add contract ABI from Remix:

// fetch("./../build/contracts/WarrantCanary.json")
// .then(response => {
//    return response.json();
// })
// .then(data => console.log(data));

const wcABI =
[
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "warrantCanaryID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "oldTrustedThirdParty",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newTrustedThirdParty",
        "type": "address"
      }
    ],
    "name": "LogChangedTrustedThirdParty",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "warrantCanaryID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "purpose",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "trustedThirdParty",
        "type": "address"
      }
    ],
    "name": "LogCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "warrantCanaryID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldExpirationBlock",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newExpirationBlock",
        "type": "uint256"
      }
    ],
    "name": "LogExpirationUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "warrantCanaryID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "LogFundsAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "warrantCanaryID",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "LogFundsWithdrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "IDcount",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "IDsOwned",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "IDsTrusted",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "warrantCanaries",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "ID",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expirationBlock",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastUpdatedInBlock",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "purpose",
        "type": "string"
      },
      {
        "internalType": "address payable",
        "name": "warrantCanaryOwner",
        "type": "address"
      },
      {
        "internalType": "address payable",
        "name": "trustedThirdParty",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "enclosedFunds",
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
        "name": "expirationBlock_",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "purpose_",
        "type": "string"
      },
      {
        "internalType": "address payable",
        "name": "trustedThirdParty_",
        "type": "address"
      }
    ],
    "name": "createWarrantCanary",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "expirationBlock_",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "purpose_",
        "type": "string"
      }
    ],
    "name": "createWarrantCanarySimple",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "warrantCanaryID_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newExpirationBlock_",
        "type": "uint256"
      }
    ],
    "name": "updateExpiration",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "warrantCanaryID_",
        "type": "uint256"
      }
    ],
    "name": "addFunds",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "warrantCanaryID_",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "newTrustedThirdParty_",
        "type": "address"
      }
    ],
    "name": "changeTrustedThirdParty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "warrantCanaryID_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fundsToWithdraw_",
        "type": "uint256"
      }
    ],
    "name": "withdrawSomeFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "warrantCanaryID_",
        "type": "uint256"
      }
    ],
    "name": "withdrawAllFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "warrantCanaryID_",
        "type": "uint256"
      }
    ],
    "name": "deleteWarrantCanary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "warrantCanaryID_",
        "type": "uint256"
      }
    ],
    "name": "Expiration",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let response = await fetch("./../build/contracts/WarrantCanary.json");

console.log(response.json());

// const wc = JSON.parse(fs.readFileSync('./build/contracts/WarrantCanary.json', 'utf8'));
// console.log(JSON.stringify(contract.abi));

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

const createButton = document.getElementById('create-button');

createButton.onclick = async () => {
  // grab value from input

  const createExpirationInput = document.getElementById('create-button-expiration-input').value;
  console.log(createExpirationInput);
  const createPurposeInput = document.getElementById('create-button-purpose-input').value;
  console.log(createPurposeInput);
  const createtrustedThirdPartyInput = document.getElementById('create-button-trustedThirdParty-input').value;
  console.log(createtrustedThirdPartyInput);

  console.log(createExpirationInput, createPurposeInput)

  var web3 = new Web3(window.ethereum)

  // instantiate smart contract instance

  const warrantCanary = new web3.eth.Contract(wcABI, wcAddress)
  warrantCanary.setProvider(window.ethereum)

  await warrantCanary.methods.createWarrantCanarySimple(
    createExpirationInput,
    createPurposeInput
    ).send({from: ethereum.selectedAddress})

}

const getExpirationButton = document.getElementById('getExpiration-button')

getExpirationButton.onclick = async () => {

  var web3 = new Web3(window.ethereum)

  const simpleStorage = new web3.eth.Contract(ssABI, ssAddress)
  simpleStorage.setProvider(window.ethereum)

  var value = await simpleStorage.methods.retrieve().call()

  console.log(value)

  const ssDisplayValue = document.getElementById('ss-display-value')

  ssDisplayValue.innerHTML = 'Current Simple Storage Value: ' + value

}

