import { CommonIdentityProvider, SwapAppActorProvider, ResultTypes, SpecifiedTokenInterfaceType } from "../../modules/Types/CommonTypes";
import { Principal } from '@dfinity/principal';
import { SliSwapApp_backend, createActor } from "../../../../declarations/SliSwapApp_backend";
import { GetRandomString, GetResultFromVariant, SeedToIdentity } from "../../modules/Utils/CommonUtils";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";
import { Get2DimArray, GetRandomIdentity } from "../../modules/Utils/CommonUtils";
import { Actor, HttpAgent, makeNonceTransform} from '@dfinity/agent';
import { Dip20Interface, SwapAppActorInterface } from "../../modules/Types/Interfaces";
import {AuthClient} from '@dfinity/auth-client';
import { GlobalDataProvider } from "../../modules/Types/CommonTypes";
import fetch from 'isomorphic-fetch';

//import fetch from 'node-fetch';

// import { createAgent } from "@dfinity/utils";
// import { createActor } from "../../../../declarations/SliSwapApp_backend";


function showTabpage(evt, idName) {

    if (RelatedHtmlPageExist() == false) {
       
        return;
    }

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(idName).style.display = "block";
    evt.currentTarget.className += " active";
  }

async function UpdateVisibilityForDynamicRows(tokenSymbol, shouldShow) {
    if (RelatedHtmlPageExist() == false) {
       
        return;
    }
    //const tableRows = document.querySelectorAll('#TableSli tr');
    const tableRows = document.querySelectorAll('#Table_'  + tokenSymbol + ' tr');

    tableRows.forEach(tr => {
        if (tr.id.startsWith('row_' + tokenSymbol + "_Metadata")) {
            if (shouldShow) {
                tr.style.display = '';
            }
            else {
                tr.style.display = 'none';
            }
        }
    });
}

async function UpdateUiFromModel(){

    document.getElementById("sli-icrc1-canister-id").
        value =GlobalDataProvider.Icrc1_Sli_CanisterId;

    document.getElementById("sliTokenLogo").
        innerHTML = GlobalDataProvider.Icrc1_Sli_TokenLogo;

    document.getElementById("sliTokenSymbol").
        innerHTML = GlobalDataProvider.Icrc1_Sli_TokenSymbol;

    document.getElementById("sliTokenName").
        innerHTML = GlobalDataProvider.Icrc1_Sli_TokenName;

    document.getElementById("sliTokenDecimals").
        innerHTML = GlobalDataProvider.Icrc1_Sli_TokenDecimals;

    document.getElementById("sliTokenTotalSupply").
        innerHTML = GlobalDataProvider.Icrc1_Sli_TokenTotalSupply;

    document.getElementById("sliTokenTransferFee").
        innerHTML = GlobalDataProvider.Icrc1_Sli_TokenTransferFee;

    document.getElementById("sli-icrc1-deposited-in-swap-app").
        value = GlobalDataProvider.Icrc1_Sli_Deposited_In_SwapApp;

    document.getElementById("glds-icrc1-canister-id").
        value =GlobalDataProvider.Icrc1_Glds_CanisterId;

    document.getElementById("gldsTokenLogo").
        innerHTML = GlobalDataProvider.Icrc1_Glds_TokenLogo;

    document.getElementById("gldsTokenSymbol").
        innerHTML = GlobalDataProvider.Icrc1_Glds_TokenSymbol;

    document.getElementById("gldsTokenName").
        innerHTML = GlobalDataProvider.Icrc1_Glds_TokenName;

    document.getElementById("gldsTokenDecimals").
        innerHTML = GlobalDataProvider.Icrc1_Glds_TokenDecimals;

    document.getElementById("gldsTokenTotalSupply").
        innerHTML = GlobalDataProvider.Icrc1_Glds_TokenTotalSupply;

    document.getElementById("gldsTokenTransferFee").
        innerHTML = GlobalDataProvider.Icrc1_Glds_TokenTransferFee;

    document.getElementById("glds-icrc1-deposited-in-swap-app").
        value = GlobalDataProvider.Icrc1_Glds_Deposited_In_SwapApp;

    document.getElementById("sli_SwapWallets_NumberOfFreeWallets")
    .value = GlobalDataProvider.ApprovedWallets_Sli_Free;

    document.getElementById("sli_SwapWallets_NumberOfUsedWallets")
    .value = GlobalDataProvider.ApprovedWallets_Sli_InUse;

    document.getElementById("glds_SwapWallets_NumberOfFreeWallets")
    .value = GlobalDataProvider.ApprovedWallets_Glds_Free;

    document.getElementById("glds_SwapWallets_NumberOfUsedWallets")
    .value = GlobalDataProvider.ApprovedWallets_Glds_InUse;

    await UpdateVisibilityForDynamicRows("sli", true);
    await UpdateVisibilityForDynamicRows("glds", true);
}


// async function UpdateValues_Internal(tokenSymbol, tokenInfo, fee, totalSupply, balanceInDappWallet) {

//     let hasData = tokenInfo.MetaDataPresent == true;
//     if (hasData == false) {
//         await UpdateVisibilityForDynamicRows(tokenSymbol, false);
//         return;
//     }

//     document.getElementById(tokenSymbol + "-icrc1-canister-id").
//         value = tokenInfo.CanisterId;

//     document.getElementById(tokenSymbol + "TokenLogo").
//         innerHTML = tokenInfo.Logo;

//     document.getElementById(tokenSymbol + "TokenSymbol").
//     innerHTML = tokenInfo.Symbol;

//     document.getElementById(tokenSymbol + "TokenName").
//     innerHTML = tokenInfo.Name;

//     document.getElementById(tokenSymbol + "TokenDecimals").
//     innerHTML = tokenInfo.Decimals;

//     document.getElementById(tokenSymbol + "TokenTotalSupply").
//     innerHTML = totalSupply;

//     document.getElementById(tokenSymbol + "TokenTransferFee").
//     innerHTML = fee;

//     document.getElementById(tokenSymbol +"-icrc1-deposited-in-swap-app").
//     value = balanceInDappWallet;
//     await UpdateVisibilityForDynamicRows(tokenSymbol, true);
// }



async function UpdateValues() {


    if (RelatedHtmlPageExist() == false || StopRequested() == true) {
        return;
    }

    GlobalDataProvider.SwapApp_CanisterId_Text =  CommonIdentityProvider.SwapAppPrincipalText;

    let swapAppCanisterIdTextBox = document.getElementById("swap-app-canister-id");
    if (swapAppCanisterIdTextBox) {
        swapAppCanisterIdTextBox.value = CommonIdentityProvider.SwapAppPrincipalText;
    }
    else {
        swapAppCanisterIdTextBox.value = "unknown";
    }
    let swapAppPrincipal = Principal.fromText(CommonIdentityProvider.SwapAppPrincipalText);

    //let sliMetadata = await GetTokensInfos();
    if (StopRequested() == true) { return; }
 
    let sliToken = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Icrc1Sli);   
    let gldsToken = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Icrc1Glds);

    if (sliToken != undefined && sliToken.MetaDataPresent == true){
        GlobalDataProvider.Icrc1_Sli_TokenLogo = sliToken.Logo;
        GlobalDataProvider.Icrc1_Sli_TokenSymbol = sliToken.Symbol;
        GlobalDataProvider.Icrc1_Sli_TokenName = sliToken.Name;
        GlobalDataProvider.Icrc1_Sli_TokenDecimals = sliToken.Decimals;
        GlobalDataProvider.Icrc1_Sli_CanisterId = sliToken.CanisterId;
    }

    if (gldsToken != undefined && gldsToken.MetaDataPresent == true){
        GlobalDataProvider.Icrc1_Glds_TokenLogo = gldsToken.Logo;
        GlobalDataProvider.Icrc1_Glds_TokenSymbol = gldsToken.Symbol;
        GlobalDataProvider.Icrc1_Glds_TokenName = gldsToken.Name;
        GlobalDataProvider.Icrc1_Glds_TokenDecimals = gldsToken.Decimals;
        GlobalDataProvider.Icrc1_Glds_CanisterId = gldsToken.CanisterId;
    }

    const promise_Sli1 =  async ()=> {
        if (sliToken == undefined || sliToken.MetaDataPresent != true){
            return 0.0;
        }
        var sliFee = GetResultFromVariant(await SliSwapApp_backend.SliIcrc1_GetCurrentTransferFee()).ResultValue;
        sliFee = new TokenBalance(sliFee, sliToken.Decimals);
        return sliFee.GetBalance();
    };

    const promise_Sli2 =   async ()=> {
        if (sliToken == undefined || sliToken.MetaDataPresent != true){
            return 0.0;
        }
        return (await sliToken.GetTotalSupply()).GetBalance();
    };

    const promise_Sli3 =   async ()=>  {
        if (sliToken == undefined || sliToken.MetaDataPresent != true){
            return 0.0;
        }
        var sliBalanceInAppWallet = await sliToken.GetBalanceForPrincipal(swapAppPrincipal);
        return sliBalanceInAppWallet.GetBalance();
    };


    const promise_Glds1 =   async ()=>  {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true){
            return 0.0;
        }
        var gldsFee = GetResultFromVariant(await SliSwapApp_backend.GldsIcrc1_GetCurrentTransferFee()).ResultValue;
        gldsFee = new TokenBalance(gldsFee, gldsToken.Decimals);
        return gldsFee.GetBalance();
    };

    const promise_Glds2 =   async ()=>  {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true){
            return 0.0;
        }
        return (await gldsToken.GetTotalSupply()).GetBalance();

    };

    const promise_Glds3 =   async ()=>  {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true){
            return 0.0;
        }
        var gldsBalanceInAppWallet = await gldsToken.GetBalanceForPrincipal(swapAppPrincipal);
        return gldsBalanceInAppWallet.GetBalance();
    };

    const [sliFee_, sliTotalSupply_, sliBalanceInAppWallet_, gldsFee_, gldsTotalSupply_, gldsBalanceInAppWallet_] = await Promise.all(
            [promise_Sli1(), promise_Sli2(), promise_Sli3(), 
                promise_Glds1(), promise_Glds2(), promise_Glds3()
            ]
    );

    if (StopRequested() == true) { return; }

    GlobalDataProvider.Icrc1_Sli_TokenTransferFee = sliFee_;
    GlobalDataProvider.Icrc1_Sli_TokenTotalSupply = sliTotalSupply_;
    GlobalDataProvider.Icrc1_Sli_Deposited_In_SwapApp = sliBalanceInAppWallet_;

    GlobalDataProvider.Icrc1_Glds_TokenTransferFee = gldsFee_;
    GlobalDataProvider.Icrc1_Glds_TokenTotalSupply = gldsTotalSupply_;
    GlobalDataProvider.Icrc1_Glds_Deposited_In_SwapApp = gldsBalanceInAppWallet_;

    let numberOfApprovedSliWallets = await SliSwapApp_backend.GetNumberOfSliApprovedWallets();
    let numberOfApprovedGldsWallets = await SliSwapApp_backend.GetNumberOfGldsApprovedWallets();

    GlobalDataProvider.ApprovedWallets_Sli_Free = numberOfApprovedSliWallets[0];
    GlobalDataProvider.ApprovedWallets_Sli_InUse = numberOfApprovedSliWallets[1];

    GlobalDataProvider.ApprovedWallets_Glds_Free = numberOfApprovedGldsWallets[0];
    GlobalDataProvider.ApprovedWallets_Glds_InUse = numberOfApprovedGldsWallets[1];
    
    console.log("Number of app sli wallets");
    console.log(numberOfApprovedSliWallets);
    await UpdateUiFromModel();
    // if (sliToken != undefined && sliToken.MetaDataPresent == true)
    // {
    //     UpdateValues_Internal("sli", sliToken, sliFee_, sliTotalSupply_,
    //     sliBalanceInAppWallet_);
    // }

    // if (gldsToken != undefined && gldsToken.MetaDataPresent == true){

    //     UpdateValues_Internal("glds", gldsToken, gldsFee_, gldsTotalSupply_,
    //     gldsBalanceInAppWallet_);
        
    // }

}


async function setSliIcrcCanisterId() {
    let inputElementSliCanisterId = document.getElementById("sli-icrc1-canister-id");
    if (inputElementSliCanisterId) {
        let canisterId = inputElementSliCanisterId.value;
        try {
            Principal.fromText(canisterId);
        } catch (error) {
            alert('This is not a valid canister-id');
            return;
        }
        let result = await SwapAppActorProvider.SliIcrc1_SetCanisterId(canisterId);

        if (result.Result == ResultTypes.err) {
            alert(result.ResultText);
            return;
        }
        if (result.Result == ResultTypes.ok) {
            UpdateValues();
        }
    }
}

async function setGldsIcrcCanisterId() {
    let inputElementGldsCanisterId = document.getElementById("glds-icrc1-canister-id");
    if (inputElementGldsCanisterId) {
        let canisterId = inputElementGldsCanisterId.value;
        try {
            Principal.fromText(canisterId);
        } catch (error) {
            alert('This is not a valid canister-id');
            return;
        }
        let result = await SwapAppActorProvider.GldsIcrc1_SetCanisterId(canisterId);
       
        if (result.Result == ResultTypes.err) {
            alert(result.ResultText);
            return;
        }
        if (result.Result == ResultTypes.ok) {
            UpdateValues();
        }

    }
}

//This section is called everytime the corresponding html-page 'PageAdminSection.html' is shown
export const admin_section_init = async function initAdminSection() {

    if (typeof admin_section_init.CommonThingsInitialized == 'undefined') {
        admin_section_init.CommonThingsInitialized = false;
    }

    console.log("In admin init");
    admin_section_init.CommonThingsInitialized = false;
    await RemoveButtonClickEvents();
    await AddButtonClickEvents();
  
    await UpdateVisibilityForDynamicRows("sli", true);
    await UpdateVisibilityForDynamicRows("glds", true);
    await UpdateUiFromModel();

    var element = document.getElementById('set-sli-icrc1-canister-id');
    if (element != null) {

        element.removeEventListener('click', async () => { await setSliIcrcCanisterId(); }, true);

        //TODO: UNDO
        if (false && this.SliIcrcCanisterIdWasSet() == true) {
            element.disabled = true;
        }
        else {
            element.disabled = false;
            element.addEventListener('click', async () => { await setSliIcrcCanisterId(); }, true);
        }
    }

    element = document.getElementById('set-glds-icrc1-canister-id');
    if (element != null) {
        element.removeEventListener('click', async () => { await setGldsIcrcCanisterId(); }, true);
        if (false && this.GldsIcrcCanisterIdWasSet() == true) {
            element.disabled = true;
        }
        else {
            element.disabled = false;
            element.addEventListener('click', async () => { await setGldsIcrcCanisterId(); }, true);
        }
    }

    admin_section_init.CommonThingsInitialized = true;
    await UpdateValues();
};


//Helper functions:


async function CreateTheDynamicWalletsNow(specifiedTokenInterfaceType){
    
    let sliSwapAppPrincipal = Principal.fromText(CommonIdentityProvider.SwapAppPrincipalText);
    var dip20CanisterIdToUse = "";
    var transferFeeBigInt = 0;
    var dip20Token = null;
    var numberOfWalletsToCreate = 0;
    let bucketSize = 20;

    switch(specifiedTokenInterfaceType)
    {
        case SpecifiedTokenInterfaceType.Dip20Sli:
            numberOfWalletsToCreate = Number(document.getElementById('sli_SwapWallets_NumberOfWalletsToCreate').value);
            dip20Token = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Dip20Sli);
         
        break;
        case SpecifiedTokenInterfaceType.Dip20Glds:
            numberOfWalletsToCreate = Number(document.getElementById('glds_SwapWallets_NumberOfWalletsToCreate').value);
            dip20Token = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Dip20Glds);
        break;
    }


    if (numberOfWalletsToCreate <= 0){
        return;
    }

    transferFeeBigInt = dip20Token.TransferFee.GetRawBalance();
    dip20CanisterIdToUse = dip20Token.CanisterId;
    let approveAmount = new TokenBalance(0,dip20Token.Decimals).SetBalance(5000).GetRawBalance();

    const indexArray = Get2DimArray(numberOfWalletsToCreate, bucketSize);

    console.time('doSomething');

 

    for(var z=0; z<indexArray.length; z++)
    {
        let innerArr = indexArray[z];
      

        const promises = innerArr.map(async ()=>{
          
            let approvalWalletIdentity = GetRandomIdentity();
            let approvalWalletPrincipal = approvalWalletIdentity.getPrincipal();
            console.log("principal:");
            console.log(approvalWalletPrincipal.toText()); 

            let principalAlreadyOccupied = await SliSwapApp_backend.ApprovedWalletsPrincipalExist(approvalWalletPrincipal);
            if (principalAlreadyOccupied == false){
                
                //(1) Transfer fee amount into the wallet, because the 'approve' call costs fee.
                let transferResult = await dip20Token.TransferTokens(approvalWalletPrincipal,transferFeeBigInt );

                if (transferResult.Result == ResultTypes.ok){

                    let hostToUse = 'https://icp-api.io';

                    const agent = new HttpAgent({    
                        fetch,        
                            identity: approvalWalletIdentity,
                            host: hostToUse
                    
                    });
                    
            
                    let swappingWalletActor = Actor.createActor(
                        Dip20Interface, { agent: agent, canisterId: dip20CanisterIdToUse }
                    );

                    // (2) Approve now transfer delegation
                    var approveResponse = GetResultFromVariant(await swappingWalletActor.approve(sliSwapAppPrincipal, approveAmount));
                    if (approveResponse.Result == ResultTypes.ok){
                        console.log("approve was successful.");

                        // (3) Check the allowance amount
                        var allowanceNumber = await swappingWalletActor.allowance(approvalWalletPrincipal,  sliSwapAppPrincipal);
                        //allowanceNumber = new TokenBalance(allowanceNumber, dip20Token.Decimals).GetBalance();
                        console.log("allowance number:");
                        console.log(allowanceNumber);
                        if (allowanceNumber >= approveAmount){
                            console.log("Adding now the swappingWallet into database");

                            var addApprovalWalletIntoDatabaseResponse;

                            switch(specifiedTokenInterfaceType)
                            {
                                case SpecifiedTokenInterfaceType.Dip20Sli:
                                    addApprovalWalletIntoDatabaseResponse = 
                                    await SwapAppActorProvider.AddApprovalWalletSli(approvalWalletPrincipal);
                                 
                                break;
                                case SpecifiedTokenInterfaceType.Dip20Glds:
                                    addApprovalWalletIntoDatabaseResponse = 
                                    await SwapAppActorProvider.AddApprovalWalletGlds(approvalWalletPrincipal);
                                break;
                            }

                            console.log("result of adding the swappingWallet into database");
                            console.log(addApprovalWalletIntoDatabaseResponse);
                            if (addApprovalWalletIntoDatabaseResponse.Result == ResultTypes.ok){
                                console.log("Adding approval wallet was full success.");
                            }
                        }
                    }
                }
            }       
        });
        //let finalAnswer = 
        await Promise.all(promises);
        //console.log(finalAnswer);

    }

    console.timeEnd('doSomething');

} 




async function AddButtonClickEvents() {
    document.getElementById("ButtonTabpage1").addEventListener('click', async function () {
        showTabpage(event, 'tabContentIcrc1');
    }, false);
  
    document.getElementById("ButtonTabpage2").addEventListener('click', async function () {
        showTabpage(event, 'tabContentSwapWallets');
    }, false);
   
    document.getElementById("sli_SwapWallets_button_createWallets").addEventListener('click', 
    async function () { await CreateTheDynamicWalletsNow(SpecifiedTokenInterfaceType.Dip20Sli);}, false);
    
    document.getElementById("glds_SwapWallets_button_createWallets").addEventListener('click', 
    async function () { await CreateTheDynamicWalletsNow(SpecifiedTokenInterfaceType.Dip20Glds);}, false);

}

async function RemoveButtonClickEvents() {
    document.getElementById("ButtonTabpage1").removeEventListener('click', async function () {
        showTabpage(event, 'tabContentIcrc1');
    }, false);

    document.getElementById("ButtonTabpage2").removeEventListener('click', async function () {
        showTabpage(event, 'tabContentSwapWallets');
    }, false);

    document.getElementById("sli_SwapWallets_button_createWallets").removeEventListener('click', 
        async function () {
        await CreateTheDynamicWalletsNow(SpecifiedTokenInterfaceType.Dip20Sli);}, false);

    document.getElementById("glds_SwapWallets_button_createWallets").removeEventListener('click', 
        async function () {
        await CreateTheDynamicWalletsNow(SpecifiedTokenInterfaceType.Dip20Glds);}, false);
}


function StopRequested() {
    return admin_section_init.CommonThingsInitialized == false || RelatedHtmlPageExist() == false;
}

function RelatedHtmlPageExist() {
    return document.getElementById('DivPageAdminSection') != null;
}



