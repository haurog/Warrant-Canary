

var web3 = new Web3(window.ethereum);
// contract address on Rinkeby:
const wcAddress = '0xF06c47b7FeB65aF49dDD78c1816BD4f31c2d56F1'

// Load ABI
let jsonFile = "./../build/contracts/WarrantCanary.json";
var json = await $.getJSON(jsonFile);
let wcABI = json.abi;


const WarrantCanary = new web3.eth.Contract(wcABI, wcAddress);
WarrantCanary.setProvider(window.ethereum);


async function checkNetworkInMetamask() {
  let chainID = await ethereum.request({method: 'eth_chainId'});
  if (chainID != '0x4'){
    window.alert("This dapp only runs on rinkeby test network. Please approve the switch to the correct network");
  }
  console.log(`chain: ${chainID}`);
  await ethereum.request({method: 'wallet_switchEthereumChain',
                          params:[{chainId: '0x4'}]
                        }).cache(e => window.location.reload());
}

function checkIfMetamaskIsAvailable() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('window.ethereum is enabled');
    if (window.ethereum.isMetaMask === true) {
      console.log('MetaMask is active');
      let mmDetected = document.getElementById('mm-detected');
      mmDetected.innerHTML += 'MetaMask Is Available!';
    } else {
      console.log('MetaMask is not available');
      let mmDetected = document.getElementById('mm-detected');
      mmDetected.innerHTML += 'MetaMask Not Available!';
    }
  } else {
    console.log('window.ethereum is not found');
    let mmDetected = document.getElementById('mm-detected');
    mmDetected.innerHTML += '<p>MetaMask Not Available!<p>';
    alert("you have no metamask installed");
  }
}

window.addEventListener('load', function() {
  checkIfMetamaskIsAvailable();
})




const mmEnable = document.getElementById('mm-connect');

mmEnable.onclick = async () => {
  await ethereum.request({ method: 'eth_requestAccounts'});
  var mmCurrentAccount = document.getElementById('mm-current-account');
  mmCurrentAccount.innerHTML = 'Current Account: ' + ethereum.selectedAddress;
  await checkNetworkInMetamask();
}

const createButton = document.getElementById('create-button');

createButton.onclick = async () => {
  const createExpirationInput = document.getElementById('create-button-expiration-input').value;
  const createPurposeInput = document.getElementById('create-button-purpose-input').value;
  const createtrustedThirdPartyInput = document.getElementById('create-button-trustedThirdParty-input').value;

  await WarrantCanary.methods.createWarrantCanary(
    createExpirationInput,
    createPurposeInput,
    createtrustedThirdPartyInput
    ).send({from: ethereum.selectedAddress});
}

const getWarrantCanaryButton = document.getElementById('getWarrantCanary-button');

getWarrantCanaryButton.onclick = async () => {
  const expirationInput = document.getElementById('getWarrantCanary-button-ID-input').value;
  var stateofWC = await WarrantCanary.methods.warrantCanaries(expirationInput).call();
  console.log(stateofWC)

  const displayValue = document.getElementById('getWarrantCanary-display-value');

  displayValue.innerHTML = (
    `<div> Warrant Canary ID: ${expirationInput} </div>
    <div> Expiration time: ${stateofWC.expirationTime} </div>
    <div> Last updated in block: ${stateofWC.lastUpdatedInBlock} </div>
    <div> Purpose: ${stateofWC.purpose} </div>
    <div> Owner: ${stateofWC.warrantCanaryOwner} </div>
    <div> Trusted third party: ${stateofWC.trustedThirdParty} </div>
    <div> Enclosed Funds: ${stateofWC.enclosedFunds} </div>`);
}

