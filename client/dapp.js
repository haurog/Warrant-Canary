
var web3 = new Web3(window.ethereum);
// contract address on Rinkeby:
const wcAddress = '0xF06c47b7FeB65aF49dDD78c1816BD4f31c2d56F1'
let userAddress;
let WarrantCanary;

window.addEventListener('load', function(event) {
  createContractObject();
  checkIfMetamaskIsAvailable();
  connectToMetamask();
  createContractObject();
})


async function createContractObject() {
  // Load ABI
  let jsonFile = "./../build/contracts/WarrantCanary.json";
  var json = await $.getJSON(jsonFile);
  let wcABI = json.abi;

  window.WarrantCanary = await new web3.eth.Contract(wcABI, wcAddress);
  await window.WarrantCanary.setProvider(window.ethereum);
}

async function checkNetworkInMetamask() {
  let chainID = await ethereum.request({method: 'eth_chainId'});
  if (chainID != '0x4'){
    window.alert("This dapp only runs on rinkeby test network. Please approve the switch to the correct network");
  }
  await ethereum.request({method: 'wallet_switchEthereumChain',
                          params:[{chainId: '0x4'}]
                        });
}

function checkIfMetamaskIsAvailable() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('window.ethereum is enabled');
    if (window.ethereum.isMetaMask === true) {
      console.log('MetaMask is active');
      // let mmDetected = document.getElementById('mm-detected');
      // mmDetected.innerHTML += 'MetaMask Is Available!';
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

async function connectToMetamask() {
  await ethereum.request({ method: 'eth_requestAccounts'});
  var mmCurrentAccount = document.getElementById('mm-current-account');
  mmCurrentAccount.innerHTML = 'Current Account: ' + ethereum.selectedAddress;
  window.userAddress = ethereum.selectedAddress;
  await checkNetworkInMetamask();
}

const mmEnable = document.getElementById('mm-connect');
mmEnable.onclick = async () => {
  connectToMetamask();
}

async function createWarrantCanary() {
  const createExpirationInput = document.getElementById('create-button-expiration-input').value;
  const createPurposeInput = document.getElementById('create-button-purpose-input').value;
  const createtrustedThirdPartyInput = document.getElementById('create-button-trustedThirdParty-input').value;
  const fundsToAddinETH = document.getElementById(`create-button-funds-input`).value;
  const fundsToAddinWei = web3.utils.toWei(fundsToAddinETH, 'ether')

  await window.WarrantCanary.methods.createWarrantCanary(
    createExpirationInput,
    createPurposeInput,
    createtrustedThirdPartyInput
    ).send({from: ethereum.selectedAddress, value: fundsToAddinWei});
}

async function updateExpiration(ID) {
  const newExpirationTime = document.getElementById(`update-expiration-input-${ID}`).value;
  await window.WarrantCanary.methods.updateExpiration(
    ID,
    newExpirationTime
    ).send({from: ethereum.selectedAddress});
}

async function addFunds(ID) {
  const fundsToAddinETH = document.getElementById(`add-funds-input-${ID}`).value;
  const fundsToAddinWei = web3.utils.toWei(fundsToAddinETH, 'ether');
  // console.log("funds to add: " + fundsToAddinETH + "  " + fundsToAddinWei)
  await window.WarrantCanary.methods.addFunds(
    ID
    ).send({from: ethereum.selectedAddress, value: fundsToAddinWei});
}

async function changeTrustedThirdParty(ID) {
  const newTrustedThirdParty = document.getElementById(`change-trusted-third-party-input-${ID}`).value;
  // console.log(newTrustedThirdParty);
  await window.WarrantCanary.methods.changeTrustedThirdParty(
    ID,
    newTrustedThirdParty
    ).send({from: ethereum.selectedAddress});
}

async function withdrawSomeFunds(ID) {
  const fundsToWithdrawInETH = document.getElementById(`withdrawSome-button-funds-input-${ID}`).value;
  const fundsToWithdrawInWei = web3.utils.toWei(fundsToWithdrawInETH, 'ether');
  await window.WarrantCanary.methods.withdrawSomeFunds(
    ID,
    fundsToWithdrawInWei
    ).send({from: ethereum.selectedAddress});
}

async function withdrawAllFunds(ID) {
  await window.WarrantCanary.methods.withdrawAllFunds(
    ID
    ).send({from: ethereum.selectedAddress});
}


async function getAWarrantCanary(ID, location) {
  var stateofWC = await window.WarrantCanary.methods.warrantCanaries(ID).call();
  const displayValue = document.getElementById(location);
  displayValue.innerHTML += (
    `<div id="warrant-canary-${ID}" class="warrant-canary col-md-3 float-left">
    <div class="float-right"><h4>${ID}</h4></div>
    <div class="purpose"> ${stateofWC.purpose} </div>
    <div> Expiration: ${stateofWC.expirationTime} </div>
    <div> Last updated: ${stateofWC.lastUpdatedInBlock} </div>
    <div> Owner: ${stateofWC.warrantCanaryOwner} </div>
    <div> Third party: ${stateofWC.trustedThirdParty} </div>
    <div> Funds: ${stateofWC.enclosedFunds} </div>
    <div>
      <button onclick="updateExpiration(${ID})" >Update Expiration</button>
      <input id="update-expiration-input-${ID}" type="number" placeholder="Expiration Time"/>
    </div>
    <div>
      <button onclick="addFunds(${ID})">Add Funds</button>
      <input id="add-funds-input-${ID}" type="number" placeholder="ETH to add"/>
    </div>
    <div>
      <button onclick="changeTrustedThirdParty(${ID})">Change Trusted Third Party</button>
      <input id="change-trusted-third-party-input-${ID}" type="string" placeholder="Address of the New Third Party"/>
    </div>
    <div>
      <button onclick="withdrawSomeFunds(${ID})">Withdraw Some Funds</button>
      <input id="withdrawSome-button-funds-input-${ID}" type="number" placeholder="Funds to Withdraw in ETH"/>
    </div>
    <div>
      <button onclick="withdrawAllFunds(${ID})">Withdraw All Funds</button>
    </div>
    <br/>
    </div> `
    );
}

const getWarrantCanaryButton = document.getElementById('getWarrantCanary-button');
getWarrantCanaryButton.onclick = async () => {
  const expirationInput = document.getElementById('getWarrantCanary-button-ID-input').value;
  const displayValue = document.getElementById('warrant-canaries');
  displayValue.innerHTML ="";
  getAWarrantCanary(expirationInput, 'warrant-canaries');
}

async function getAllAssociatedWarrantCanaries() {
  let IDsOwned = await window.WarrantCanary.methods.getIDsOwned(window.userAddress).call();
  let IDsTrusted = await window.WarrantCanary.methods.getIDsTrusted(window.userAddress).call();
  const displayLocation = document.getElementById('warrant-canaries');
  displayLocation.innerHTML = "";
  displayLocation.innerHTML += `<div><h2> Owned Warrant Canaries </h2><div>
                                <div id="owned-warrant-canaries" class="row"></div>`;

  IDsOwned.forEach(function(element) {getAWarrantCanary(element, 'owned-warrant-canaries')});
  displayLocation.innerHTML += `<div><h2> Trusted Third Party</h2><div>
  <div id="trusted-warrant-canaries" class="row"></div>`;
  IDsTrusted.forEach(function(element) {getAWarrantCanary(element, 'trusted-warrant-canaries')});
}



