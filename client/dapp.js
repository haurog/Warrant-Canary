var web3 = new Web3(window.ethereum);
// contract address on Scroll mainnet:
const wcAddress = '0xDEfd37cFE93F8b50Ec4332BdacdaF4eAdfc78be3'
// const wcAddress = '0x51f217fEFC94CBD21C9f36E120C07D5Ba6205849'  // Old address on rinkeby
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
  let jsonFile = "./ABI/WarrantCanary.json";
  var json = await $.getJSON(jsonFile);
  let wcABI = json.abi;

  window.WarrantCanary = await new web3.eth.Contract(wcABI, wcAddress);
  await window.WarrantCanary.setProvider(window.ethereum);

  // subscribe to events
  window.WarrantCanary.events.allEvents((err, events)=>{
    let ID = events.returnValues[0];
    if (document.getElementById(`warrant-canary-${ID}`)) {
      displayAWarrantCanary(ID);
    } else {
      window.WarrantCanary.methods.warrantCanaries(ID).call().then(function(stateOfWC) {
        if(stateOfWC.warrantCanaryOwner.toLowerCase() == window.userAddress) {
          getAllAssociatedWarrantCanaries();
        }
      });
    }
  })
}

async function checkNetworkInMetamask() {
  let chainID = await ethereum.request({method: 'eth_chainId'});
  let targetChainID = '0x82750'  // Scroll Mainnet
  // let targetChainID = '0x8274f'  // Scroll Sepolia Testnet
  if (chainID != targetChainID){
    window.alert("This dapp only runs on scroll network. Please approve the switch to the correct network");
  }
  await ethereum.request({method: 'wallet_switchEthereumChain',
                          params:[{chainId: targetChainID}]
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
    displayAlertMessage("you have no metamask installed");
  }
}

async function connectToMetamask() {
  await ethereum.request({ method: 'eth_requestAccounts'});
  var mmCurrentAccount = document.getElementById('mm-current-account');
  mmCurrentAccount.innerHTML = ethereum.selectedAddress;
  window.userAddress = ethereum.selectedAddress;
  await checkNetworkInMetamask();
}

const mmEnable = document.getElementById('mm-connect');
mmEnable.onclick = async () => {
  connectToMetamask();
}

function displayAlertMessage(message) {
  alert(message);
}

async function checkIfUserCanInteract(ID) {
  let stateOfWC = await window.WarrantCanary.methods.warrantCanaries(ID).call();
  let timeNow = Math.floor(new Date().getTime() / 1000);
  if (timeNow > stateOfWC.expirationTime ||
      stateOfWC.warrantCanaryOwner.toLowerCase() == window.userAddress) {
    return true;
  } else {
    displayAlertMessage("Warrant Canary has not expired yet, therefore as a trusted third party you cannot interact yet.")
    return false;
  }
}

async function checkIfCanDelete(ID) {
  let stateOfWC = await window.WarrantCanary.methods.warrantCanaries(ID).call();
  if (stateOfWC.enclosedFunds == 0) {
    return true;
  } else {
    displayAlertMessage("Warrant Canary still has enclosed funds and can not be deleted.")
    return false;
  }
}


async function createWarrantCanary() {
  const createExpirationInput = document.getElementById('create-button-expiration-input').value;
  if (createExpirationInput == 0) {
    displayAlertMessage("You have not defined an expiration time for the Warrant Canary.");
    return;
  }

  const createPurposeInput = document.getElementById('create-button-purpose-input').value;
  if (createPurposeInput == 0) {
    displayAlertMessage("You have not defined a purpose for the Warrant Canary.");
    return;
  }

  const zeroAddress = '0x0000000000000000000000000000000000000000';
  let createTrustedThirdPartyInput = document.getElementById('create-button-trustedThirdParty-input').value;
  if (createTrustedThirdPartyInput == 0) {
    createTrustedThirdPartyInput = zeroAddress;
  } else if (createTrustedThirdPartyInput == ethereum.selectedAddress) {
    displayAlertMessage("The trusted third party cannot be the same address as the owner.");
    return;
  }

  let fundsToAddInETH = document.getElementById(`create-button-funds-input`).value;
  if (!fundsToAddInETH) {
    fundsToAddInETH = '0';
  }
  if (fundsToAddInETH != '0' && createTrustedThirdPartyInput == zeroAddress) {
    displayAlertMessage("You can only add funds if a trusted third party is set as well.");
    return;
  }


  const fundsToAddInWei = web3.utils.toWei(fundsToAddInETH, 'ether')

  let gasAmount = await window.WarrantCanary.methods.createWarrantCanary(
    createExpirationInput,
    createPurposeInput,
    createTrustedThirdPartyInput
    ).estimateGas({ from: ethereum.selectedAddress, value: fundsToAddInWei});
  console.log("Gas amount create new: ", gasAmount)
  let data = window.WarrantCanary.methods.createWarrantCanary(
    createExpirationInput,
    createPurposeInput,
    createTrustedThirdPartyInput
    ).encodeABI();
  console.log("data create: ", data)
  await window.WarrantCanary.methods.createWarrantCanary(
    createExpirationInput,
    createPurposeInput,
    createTrustedThirdPartyInput
    ).send({from: ethereum.selectedAddress,
      value: fundsToAddInWei,
      type: 1,
      data: data,
      });
}

async function updateExpiration(ID) {
  const newExpirationTime = document.getElementById(`update-expiration-input-${ID}`).value;
  let gasAmount = await window.WarrantCanary.methods.updateExpiration(ID, newExpirationTime).estimateGas({ from: ethereum.selectedAddress});
  console.log("Gas amount update expiration: ", gasAmount)
  let data = window.WarrantCanary.methods.updateExpiration(ID, newExpirationTime).encodeABI();
  console.log("data update expiration: ", data)

  await window.WarrantCanary.methods.updateExpiration(
    ID,
    newExpirationTime
    ).send({from: ethereum.selectedAddress,
      type: 1,
      data: data,
      });
}

async function addFunds(ID) {
  const fundsToAddInETH = document.getElementById(`add-funds-input-${ID}`).value;
  const fundsToAddInWei = web3.utils.toWei(fundsToAddInETH, 'ether');
  let gasAmount = await window.WarrantCanary.methods.addFunds(ID).estimateGas({ from: ethereum.selectedAddress});
  console.log("Gas amount add funds: ", gasAmount)
  let data = window.WarrantCanary.methods.addFunds(ID).encodeABI();
  console.log("data add funds: ", data)
  await window.WarrantCanary.methods.addFunds(
    ID
    ).send({from: ethereum.selectedAddress,
      value: fundsToAddInWei,
      type: 1,
      data: data,
      });
}

async function changeTrustedThirdParty(ID) {
  const newTrustedThirdParty = document.getElementById(`change-trusted-third-party-input-${ID}`).value;
  let gasAmount = await window.WarrantCanary.methods.changeTrustedThirdParty(ID, newTrustedThirdParty).estimateGas({ from: ethereum.selectedAddress});
  console.log("Gas amount change third party: ", gasAmount)
  let data = window.WarrantCanary.methods.changeTrustedThirdParty(ID, newTrustedThirdParty).encodeABI();
  console.log("data change third party: ", data)
  await window.WarrantCanary.methods.changeTrustedThirdParty(
    ID,
    newTrustedThirdParty
    ).send({from: ethereum.selectedAddress,
      type: 1,
      data: data,
      });
}

async function withdrawSomeFunds(ID) {
  if (await checkIfUserCanInteract(ID)) {
    const fundsToWithdrawInETH = document.getElementById(`withdrawSome-button-funds-input-${ID}`).value;
    const fundsToWithdrawInWei = web3.utils.toWei(fundsToWithdrawInETH, 'ether');
    let gasAmount = await window.WarrantCanary.methods.withdrawSomeFunds(ID, fundsToWithdrawInWei).estimateGas({ from: ethereum.selectedAddress});
    console.log("Gas amount withdraw some: ", gasAmount)
    let data = window.WarrantCanary.methods.withdrawSomeFunds(ID, fundsToWithdrawInWei).encodeABI();
    console.log("data withdraw some: ", data)
    await window.WarrantCanary.methods.withdrawSomeFunds(
      ID,
      fundsToWithdrawInWei
      ).send({from: ethereum.selectedAddress,
        type: 1,
        data: data,
        });
  }
}

async function withdrawAllFunds(ID) {
  if (await checkIfUserCanInteract(ID)) {
    let gasAmount = await window.WarrantCanary.methods.withdrawAllFunds(ID).estimateGas({ from: ethereum.selectedAddress});
    console.log("Gas amount withdraw all: ", gasAmount)
    let data = window.WarrantCanary.methods.withdrawAllFunds(ID).encodeABI();
    console.log("data withdraw all: ", data)
    await window.WarrantCanary.methods.withdrawAllFunds(
      ID
      ).send({from: ethereum.selectedAddress,
        type: 1,
        data: data,
        });
  }
}

async function deleteWarrantCanary(ID) {
  if (await checkIfCanDelete(ID) && await checkIfUserCanInteract(ID)) {
    let gasAmount = await window.WarrantCanary.methods.deleteWarrantCanary(ID).estimateGas({ from: ethereum.selectedAddress});
    console.log("Gas amount delete: ", gasAmount)
    let data = window.WarrantCanary.methods.deleteWarrantCanary(ID).encodeABI();
    console.log("data delete: ", data)
    await window.WarrantCanary.methods.deleteWarrantCanary(
      ID
      ).send({from: ethereum.selectedAddress,
        type: 1,
        data: data,
        });
  }
}

function checkIfDeleted(stateOfWC) {
  const zeroAddress = '0x0000000000000000000000000000000000000000'
  if (stateOfWC.warrantCanaryOwner == zeroAddress &&
      stateOfWC.trustedThirdParty == zeroAddress &&
      stateOfWC.expirationTime == 0 &&
      stateOfWC.lastUpdatedInBlock == 0 &&
      stateOfWC.purpose == ""
     )
  {return true;}
  else {return false;}
}

// This is really ugly code, but it works ....
async function displayAWarrantCanary(ID) {
  let stateOfWC = await window.WarrantCanary.methods.warrantCanaries(ID).call();
  timeNow = Math.floor(new Date().getTime() / 1000);
  console.log(timeNow);
  let interactionRights = "Anyone";
  if (stateOfWC.warrantCanaryOwner.toLowerCase() == window.userAddress) {interactionRights = "Owner"};
  if (stateOfWC.trustedThirdParty.toLowerCase() == window.userAddress) {interactionRights = "Trusted"};
  const displayLocation = document.getElementById(`warrant-canary-${ID}`);
  let DateTime = new Date(Number(stateOfWC.expirationTime) * 1000);
  let funds = web3.utils.fromWei(stateOfWC.enclosedFunds, 'ether');

  const deleted = checkIfDeleted(stateOfWC);

  let expiryMessage = "";
  const oneWeekInSeconds = 604800;
  if (!deleted && timeNow + oneWeekInSeconds > stateOfWC.expirationTime) {
    if(timeNow > stateOfWC.expirationTime) {
      expiryMessage = `<label class="expired">Expired</label>`;
    } else {
      expiryMessage = "now";
      expiryInSeconds = Number(stateOfWC.expirationTime) - timeNow;
      if (Math.floor(expiryInSeconds/(24*3600)) > 0) {
        expiryMessage = `in ${Math.floor(expiryInSeconds/(24*3600))} days`;
      } else if ((Math.floor(expiryInSeconds/(3600)) > 0)){
        expiryMessage = `in ${Math.floor(expiryInSeconds/(3600))} hours`;
      } else if ((Math.floor(expiryInSeconds/(60)) > 0)){
        expiryMessage = `in ${Math.floor(expiryInSeconds/(60))} minutes`;
      }
      expiryMessage = `<label class="expiring_soon">Expiring ${expiryMessage}</label>`;
    }
  }


  htmlElement = "";
  if (!deleted) {
    htmlElement += (
      `<div><label class=ID>${ID}</label><label class=warning> ${expiryMessage} </label></div>
      <div class="purpose"> ${stateOfWC.purpose} </div>
      <div class="important_info"> Expiration: ${DateTime.toLocaleString()} (${stateOfWC.expirationTime})</div>
      <div class="important_info"> Funds: ${funds} ETH</div>
      <div> Updated: <a href=https://scrollscan.io/block/${stateOfWC.lastUpdatedInBlock} target="_blank" > ${stateOfWC.lastUpdatedInBlock} </a></div>
      <div> Owner: ${stateOfWC.warrantCanaryOwner} </div>
      <div> Third party: ${stateOfWC.trustedThirdParty}</div>
      `);
    if (interactionRights == "Owner") {
      htmlElement += (
      `<div>
        <button class="button_small" onclick="updateExpiration(${ID})" >Update Expiration</button>
        <input class="input" id="update-expiration-input-${ID}" type="number" placeholder="Unix Epoch"/>
      </div>
      <div>
        <button class="button_small" onclick="changeTrustedThirdParty(${ID})">Change Third Party</button>
        <input class="input" id="change-trusted-third-party-input-${ID}" type="string" placeholder="Address"/>
      </div>`);
    }
    if (!deleted) {
      htmlElement += (`
      <div>
        <button class="button_small" onclick="addFunds(${ID})">Add Funds</button>
        <input class="input" id="add-funds-input-${ID}" type="number" placeholder="ETH to add"/>
      </div>`);
    }
    if (interactionRights == "Owner" || interactionRights == "Trusted") {
      htmlElement += (`
      <div>
        <button class="button_small" onclick="withdrawSomeFunds(${ID})">Withdraw Some Funds</button>
        <input class="input" id="withdrawSome-button-funds-input-${ID}" type="number" placeholder="ETH to withdraw"/>
      </div>
      <div>
        <button class="button_small" onclick="withdrawAllFunds(${ID})">Withdraw All Funds</button>
      </div>
      <div>
        <button class="button_small" onclick="deleteWarrantCanary(${ID})">Delete</button>
      </div>`);
    }
  } else {
    htmlElement += (
      `<div><h4>${ID}</h4></div>
       <div class="deleted">This warrant canary has been deleted</div>`);
  }


  displayLocation.innerHTML = htmlElement;
}

async function getAllWarrantCanaries() {
  let IDcount = await window.WarrantCanary.methods.IDcount.call().call();
  const displayLocation = document.getElementById('warrant-canaries');
  displayLocation.innerHTML += `<div><h2> All Warrant Canaries </h2><div>
                                <div id="all-warrant-canaries" class="row"></div>`;

  tmpHTMLElement = "";

  tmpHTMLElement += `<div><h2> All Warrant Canaries </h2><div>
  <div id="all-warrant-canaries" class="row">`;

  for(i=0; i < IDcount; i++) {
    tmpHTMLElement += `<div id="warrant-canary-${i}" class="warrant-canary col-xl-4 col-lg-6 col-xs-12 overflow-scroll"></div>`;
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
  IDsOwned.sort(function(a, b) {return a - b;});
  IDsTrusted.sort(function(a, b) {return a - b;});

  const displayLocation = document.getElementById('warrant-canaries');
  displayLocation.innerHTML = "";
  tmpHTMLElement = "";

  if (IDsOwned.length > 0) {
    tmpHTMLElement += `<div><h2> Owned Warrant Canaries </h2><div>
                                  <div id="owned-warrant-canaries" class="row">`;
    for(i=0; i<IDsOwned.length; i++){
      tmpHTMLElement += `<div id="warrant-canary-${IDsOwned[i]}" class="warrant-canary col-xl-4 col-lg-6 col-xs-12 overflow-scroll"></div>`;
    }
    tmpHTMLElement += `</div>`;
  }

  if (IDsTrusted.length > 0) {
    tmpHTMLElement += `<br><div><h2> As a Trusted Third Party</h2><div>
                      <div id="trusted-warrant-canaries" class="row">`;
    for(i=0; i<IDsTrusted.length; i++){
      tmpHTMLElement += `<div id="warrant-canary-${IDsTrusted[i]}" class="warrant-canary col-xl-4 col-lg-6 col-xs-12 overflow-scroll"></div>`;
    }
    tmpHTMLElement += `</div>`;
  }

  displayLocation.innerHTML = tmpHTMLElement;
  IDsOwned.forEach(function (element) {displayAWarrantCanary(element) });
  IDsTrusted.forEach(function (element) {displayAWarrantCanary(element) });
}




