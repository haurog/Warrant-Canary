
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

  // subscribe to events
  window.WarrantCanary.events.allEvents((err, events)=>{
    // console.log(err, events);
    let ID = events.returnValues[0];
    console.log("ID: " + ID);
    if (document.getElementById(`warrant-canary-${ID}`)) {
      displayAWarrantCanary(ID);
    }
  })
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

// This is really ugly code, but it works ....
async function displayAWarrantCanary(ID) {
  var stateofWC = await window.WarrantCanary.methods.warrantCanaries(ID).call();
  // console.log("userAddress: " + window.userAddress);
  timeNow = Math.floor(new Date().getTime() / 1000);
  console.log(timeNow);
  let interactionRights = "Anyone";
  if (stateofWC.warrantCanaryOwner.toLowerCase() == window.userAddress) {interactionRights = "Owner"};
  if (stateofWC.trustedThirdParty.toLowerCase() == window.userAddress) {interactionRights = "Trusted"};
  const displayLocation = document.getElementById(`warrant-canary-${ID}`);
  let DateTime = new Date(stateofWC.expirationTime * 1000);
  let funds = web3.utils.fromWei(stateofWC.enclosedFunds, 'ether');
  htmlElement = "";

  htmlElement += (
    `<div><h4>${ID}</h4></div>
    <div class="purpose"> ${stateofWC.purpose} </div>
    <div> Expiration: ${DateTime.toLocaleString()} (${stateofWC.expirationTime})</div>
    <div> Last updated in block: <a href=https://rinkeby.etherscan.io/block/${stateofWC.lastUpdatedInBlock} target="_blank" > ${stateofWC.lastUpdatedInBlock} </a></div>
    <div> Owner: ${stateofWC.warrantCanaryOwner} </div>
    <div> Third party: ${stateofWC.trustedThirdParty}</div>
    <div> Funds: ${funds} ETH</div>`);
  if (interactionRights == "Owner") {
    htmlElement += (
      `<div>
        <button onclick="updateExpiration(${ID})" >Update Expiration</button>
        <input id="update-expiration-input-${ID}" type="number" placeholder="Unix Epoch"/>
      </div>
      <div>
        <button onclick="changeTrustedThirdParty(${ID})">Change Trusted Third Party</button>
        <input id="change-trusted-third-party-input-${ID}" type="string" placeholder="Address"/>
      </div>`);
  }
  htmlElement += (`
    <div>
      <button onclick="addFunds(${ID})">Add Funds</button>
      <input id="add-funds-input-${ID}" type="number" placeholder="ETH to add"/>
    </div>`);
  if (interactionRights == "Owner" || interactionRights == "Trusted") {
    htmlElement += (`
    <div>
      <button onclick="withdrawSomeFunds(${ID})">Withdraw Some Funds</button>
      <input id="withdrawSome-button-funds-input-${ID}" type="number" placeholder="ETH to withdraw"/>
    </div>
    <div>
      <button onclick="withdrawAllFunds(${ID})">Withdraw All Funds</button>
    </div>`);
  }

  const oneWeekInSeconds = 604800;
  if (timeNow + oneWeekInSeconds > stateofWC.expirationTime) {

    if(timeNow > stateofWC.expirationTime) {
      htmlElement += `<div class="expired">Expired</div>`;
    } else {
      expiryMessage = "now";
      expiryInSeconds = stateofWC.expirationTime - timeNow;
      if (Math.floor(expiryInSeconds/(24*3600)) > 0) {
        expiryMessage = `in ${Math.floor(expiryInSeconds/(24*3600))} days`;
      } else if ((Math.floor(expiryInSeconds/(3600)) > 0)){
        expiryMessage = `in ${Math.floor(expiryInSeconds/(3600))} hours`;
      } else if ((Math.floor(expiryInSeconds/(60)) > 0)){
        expiryMessage = `in ${Math.floor(expiryInSeconds/(60))} minutes`;
      }
      console.log(expiryMessage)
      htmlElement += `<div class="expiring_soon">Expiring ${expiryMessage}</div>`;
    }
  }
  displayLocation.innerHTML = htmlElement;
}

async function getAllWarrantCanaries() {
  let IDcount = await window.WarrantCanary.methods.IDcount.call().call();
  console.log("IDcount: " + IDcount)
  const displayLocation = document.getElementById('warrant-canaries');
  displayLocation.innerHTML += `<div><h2> All Warrant Canaries </h2><div>
                                <div id="all-warrant-canaries" class="row"></div>`;

  tmpHTMLElement = "";

  tmpHTMLElement += `<div><h2> All Warrant Canaries </h2><div>
  <div id="all-warrant-canaries" class="row">`;

  for(i=0; i < IDcount; i++) {
    tmpHTMLElement += `<div id="warrant-canary-${i}" class="warrant-canary col-lg-4 col-md-6 col-xs-12 overflow-scroll"></div>`;
  }
  tmpHTMLElement += `</div>`;

  displayLocation.innerHTML = tmpHTMLElement;

  for(i=0; i < IDcount; i++) {
    displayAWarrantCanary(i);
  }

}



async function getAllAssociatedWarrantCanaries() {
  let IDsOwned = await window.WarrantCanary.methods.getIDsOwned(window.userAddress).call();
  let IDsTrusted = await window.WarrantCanary.methods.getIDsTrusted(window.userAddress).call();
  IDsOwned = [...IDsOwned]; // clone array to make it writable
  IDsTrusted = [...IDsTrusted]; // clone array to make it writable
  IDsOwned.sort();
  IDsTrusted.sort();

  const displayLocation = document.getElementById('warrant-canaries');
  displayLocation.innerHTML = "";
  tmpHTMLElement = "";

  if (IDsOwned.length > 0) {
    tmpHTMLElement += `<div><h2> Owned Warrant Canaries </h2><div>
                                  <div id="owned-warrant-canaries" class="row">`;
    for(i=0; i<IDsOwned.length; i++){
      tmpHTMLElement += `<div id="warrant-canary-${IDsOwned[i]}" class="warrant-canary col-lg-4 col-md-6 col-xs-12 overflow-scroll"></div>`;
    }
    tmpHTMLElement += `</div>`;
  }

  if (IDsTrusted.length > 0) {
    tmpHTMLElement += `<div><h2> As a Trusted Third Party</h2><div>
                      <div id="trusted-warrant-canaries" class="row">`;
    for(i=0; i<IDsTrusted.length; i++){
      tmpHTMLElement += `<div id="warrant-canary-${IDsTrusted[i]}" class="warrant-canary col-lg-4 col-md-6 col-xs-12 overflow-scroll"></div>`;
    }
    tmpHTMLElement += `</div>`;
  }

  displayLocation.innerHTML = tmpHTMLElement;
  IDsOwned.forEach(function (element) {displayAWarrantCanary(element) });
  IDsTrusted.forEach(function (element) {displayAWarrantCanary(element) });

}




