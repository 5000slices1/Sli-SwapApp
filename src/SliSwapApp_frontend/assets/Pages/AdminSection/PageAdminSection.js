import { CommonIdentityProvider, SwapAppActorProvider, ResultTypes, SpecifiedTokenInterfaceType } from "../../modules/Types/CommonTypes";
import { Principal } from '@dfinity/principal';
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { GetRandomString, GetResultFromVariant, SeedToIdentity } from "../../modules/Utils/CommonUtils";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";
import { Get2DimArray, GetRandomIdentity } from "../../modules/Utils/CommonUtils";
import { Actor, HttpAgent } from '@dfinity/agent';
import { Dip20Interface, SwapAppActorInterface } from "../../modules/Types/Interfaces";
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

async function UpdateValues_Internal(tokenSymbol, tokenInfo, fee, totalSupply, balanceInDappWallet) {

    let hasData = tokenInfo.MetaDataPresent == true;
    if (hasData == false) {
        await UpdateVisibilityForDynamicRows(tokenSymbol, false);
        return;
    }

    document.getElementById(tokenSymbol + "-icrc1-canister-id").
        value = tokenInfo.CanisterId;

    document.getElementById(tokenSymbol + "TokenLogo").
        innerHTML = tokenInfo.Logo;

    document.getElementById(tokenSymbol + "TokenSymbol").
    innerHTML = tokenInfo.Symbol;

    document.getElementById(tokenSymbol + "TokenName").
    innerHTML = tokenInfo.Name;

    document.getElementById(tokenSymbol + "TokenDecimals").
    innerHTML = tokenInfo.Decimals;

    document.getElementById(tokenSymbol + "TokenTotalSupply").
    innerHTML = totalSupply;

    document.getElementById(tokenSymbol + "TokenTransferFee").
    innerHTML = fee;

    document.getElementById(tokenSymbol +"-icrc1-deposited-in-swap-app").
    value = balanceInDappWallet;
    await UpdateVisibilityForDynamicRows(tokenSymbol, true);
}



async function UpdateValues() {


    if (RelatedHtmlPageExist() == false || StopRequested() == true) {
        return;
    }

    let swapAppCanisterIdTextBox = document.getElementById("swap-app-canister-id");
    if (swapAppCanisterIdTextBox) {
        swapAppCanisterIdTextBox.value = CommonIdentityProvider.SwapAppPrincipalText;
    }
    else {
        swapAppCanisterIdTextBox.value = "unknown";
    }

    //let sliMetadata = await GetTokensInfos();
    if (StopRequested() == true) { return; }
 
    let sliToken = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Icrc1Sli);   
    let gldsToken = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Icrc1Glds);


    const promise_Sli1 =  async ()=> {
        if (sliToken == undefined || sliToken.MetaDataPresent != true){
            return null;
        }
        var sliFee = GetResultFromVariant(await SliSwapApp_backend.SliIcrc1_GetCurrentTransferFee()).ResultValue;
        sliFee = new TokenBalance(sliFee, sliToken.Decimals);
        return sliFee;
    };

    const promise_Sli2 =   async ()=> {
        if (sliToken == undefined || sliToken.MetaDataPresent != true){
            return null;
        }
        return await sliToken.GetTotalSupply();
    };

    const promise_Sli3 =   async ()=>  {
        if (sliToken == undefined || sliToken.MetaDataPresent != true){
            return null;
        }
        var sliBalanceInAppWallet = GetResultFromVariant(await SliSwapApp_backend.GetIcrc1Balance(
            Principal.fromText(sliToken.CanisterId))).ResultValue;
        sliBalanceInAppWallet = new TokenBalance(sliBalanceInAppWallet, sliToken.Decimals);
        return sliBalanceInAppWallet;
    };


    const promise_Glds1 =   async ()=>  {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true){
            return null;
        }
        var gldsFee = GetResultFromVariant(await SliSwapApp_backend.GldsIcrc1_GetCurrentTransferFee()).ResultValue;
        gldsFee = new TokenBalance(gldsFee, gldsToken.Decimals);
        return gldsFee;
    };

    const promise_Glds2 =   async ()=>  {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true){
            return null;
        }
        return await gldsToken.GetTotalSupply();

    };

    const promise_Glds3 =   async ()=>  {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true){
            return null;
        }
        var gldsBalanceInAppWallet = GetResultFromVariant(await SliSwapApp_backend.GetIcrc1Balance(
            Principal.fromText(gldsToken.CanisterId))).ResultValue;
        gldsBalanceInAppWallet = new TokenBalance(gldsBalanceInAppWallet, gldsToken.Decimals);
        return gldsBalanceInAppWallet;
    };

    const [sliFee_, sliTotalSupply_, sliBalanceInAppWallet_, gldsFee_, gldsTotalSupply_, gldsBalanceInAppWallet_] = await Promise.all(
            [promise_Sli1(), promise_Sli2(), promise_Sli3(), 
                promise_Glds1(), promise_Glds2(), promise_Glds3()
            ]
    );

    if (StopRequested() == true) { return; }

    if (sliToken != undefined && sliToken.MetaDataPresent == true)
    {
        UpdateValues_Internal("sli", sliToken, sliFee_.GetBalance(), sliTotalSupply_.GetBalance(),
        sliBalanceInAppWallet_.GetBalance());
    }

    if (gldsToken != undefined && gldsToken.MetaDataPresent == true){

        UpdateValues_Internal("glds", gldsToken, gldsFee_.GetBalance(), gldsTotalSupply_.GetBalance(),
        gldsBalanceInAppWallet_.GetBalance());
        
    }



    // if (sliToken != undefined && sliToken.MetaDataPresent == true) {
    //     //The call will take some seconds, and meanwhile the current html-page 
    //     //might no longer be shown.
    //     if (StopRequested() == true) { return; }
    //     var sliFee = GetResultFromVariant(await SliSwapApp_backend.SliIcrc1_GetCurrentTransferFee()).ResultValue;
    //     sliFee = new TokenBalance(sliFee, sliToken.Decimals);

    //     if (StopRequested() == true) { return; }
    //     let sliTotalSupply = await sliToken.GetTotalSupply();
       
    //     var sliBalanceInAppWallet = GetResultFromVariant(await SliSwapApp_backend.GetIcrc1Balance(
    //         Principal.fromText(sliToken.CanisterId))).ResultValue;
    //     sliBalanceInAppWallet = new TokenBalance(sliBalanceInAppWallet, sliToken.Decimals);

    //     if (StopRequested() == true) { return; }
    //     UpdateValues_Internal("sli", sliToken, sliFee.GetBalance(), sliTotalSupply.GetBalance(),
    //     sliBalanceInAppWallet.GetBalance()
    //     );
    // }

    // if (gldsToken != undefined && gldsToken.MetaDataPresent == true) {
    //     if (StopRequested() == true) { return; }
    //     var gldsFee = GetResultFromVariant(await SliSwapApp_backend.GldsIcrc1_GetCurrentTransferFee()).ResultValue;
    //     gldsFee = new TokenBalance(gldsFee, gldsToken.Decimals);

    //     if (StopRequested() == true) { return; }
    //     let gldsTotalSupply = await gldsToken.GetTotalSupply();

    //     if (StopRequested() == true) { return; }
    //     var gldsBalanceInAppWallet = GetResultFromVariant(await SliSwapApp_backend.GetIcrc1Balance(
    //         Principal.fromText(gldsToken.CanisterId))).ResultValue;
    //     gldsBalanceInAppWallet = new TokenBalance(gldsBalanceInAppWallet, gldsToken.Decimals);

    //     if (StopRequested() == true) { return; }
    //     UpdateValues_Internal("glds", gldsToken, gldsFee.GetBalance(), gldsTotalSupply.GetBalance(),
    //     gldsBalanceInAppWallet.GetBalance()
    //     );
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

    admin_section_init.CommonThingsInitialized = false;
    await RemoveButtonClickEvents();
    await AddButtonClickEvents();
  
    await UpdateVisibilityForDynamicRows("sli", false);
    await UpdateVisibilityForDynamicRows("glds", false);

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


async function CreateTheDynamicWalletsNow(){
    
    let sliSwapAppPrincipal = Principal.fromText(CommonIdentityProvider.SwapAppPrincipalText);

    let bla =  new TokenBalance(0,8).SetBalance(0.001).GetRawBalance();
    let resultDip20Approve2 = await SwapAppActorProvider.SliDip20Approve(sliSwapAppPrincipal, bla);
    //let resultResponse = await tempActor.approve(sliSwapAppPrincipal, approveBal);
    //let resultResponse = await tempActor.approve(sliSwapAppPrincipal, rawBalanceForApproval);
               
    console.log("transderResponse____");
    console.log(resultDip20Approve2);


    let numberOfWallets = Number(document.getElementById('SwapWallets_NumberOfWalletsToCreate').value);
    let bucketSize = 20;
    const indexArray = Get2DimArray(numberOfWallets, bucketSize);

    console.time('doSomething');

    // let sliDip20CanisterId = await CommonIdentityProvider.WalletsProvider.GetToken(
    //     SpecifiedTokenInterfaceType.Dip20Sli).CanisterId; 

    // let gldsDip20CanisterId = await CommonIdentityProvider.WalletsProvider.GetToken(
    //     SpecifiedTokenInterfaceType.Dip20Glds).CanisterId; 

        let sliDip20CanisterId = "zzriv-cqaaa-aaaao-a2gjq-cai";

        let gldsDip20CanisterId ="7a6j3-uqaaa-aaaao-a2g5q-cai";

        //let sliSwapAppPrincipal = Principal.fromText("jb6ma-jiaaa-aaaal-adlqq-cai");
      
        console.log("Swap app principal");
        console.log(sliSwapAppPrincipal.toText());

        var rawBalanceForApproval = new TokenBalance(0,8).SetBalance(5000);
        let sliDip20Token = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Dip20Sli);
        let feeSli = sliDip20Token.TransferFee.GetRawBalance();

        console.log("balance for approval:");
        console.log(rawBalanceForApproval.GetBalance());
        console.log("fee");
        console.log(feeSli);

    console.log("canister ids:");
    console.log(sliDip20CanisterId);
    console.log(gldsDip20CanisterId);

    for(var z=0; z<indexArray.length; z++)
    {
        let innerArr = indexArray[z];
        // for(var u=0; u<innerArr.length; u++)
        // {
        //     let randIdentity = GetRandomIdentity();
        //     let pubKey = randIdentity.getPrincipal();
         
        //     //console.log(randIdentity);
        //     console.log(pubKey.toText());

        //     let tempAgent = new HttpAgent({ randIdentity, host: "https://icp0.io/"});

        //     let tempActor = Actor.createActor(
        //         Dip20Interface, { agent: tempAgent, canisterId: sliDip20CanisterId }
        //     );
        //     let resultResponse = await tempActor.approve(sliSwapAppPrincipal, rawBalanceForApproval);
        //     console.log(resultResponse);


        //     // let tempActor = createActor(canisterId, {
        //     //     agentOptions: {
        //     //       identity,
        //     //     },
        //     //   });
        // }

        const promises = innerArr.map(async ()=>{
            // let tempIdentity = GetRandomIdentity();
            // let tempPrincipal = tempIdentity.getPrincipal();

            //let randomSeed = GetRandomString(32)
            let randomSeed = "Y7POAwV8sxoVnnUWF6KUyjntYZGJYjHT";
            console.log("randomSeed:");
            console.log(randomSeed);
            let tempIdentity = SeedToIdentity(randomSeed);
            let tempPrincipal = tempIdentity.getPrincipal();
            //GetRandomString
         
            console.log(tempPrincipal.toText());

            //let tempAgent = new HttpAgent({ tempIdentity, host: "https://icp0.io/"});
            let tempAgent = new HttpAgent({ tempIdentity, host: "https://ic0.app/"});

            let tempActor = Actor.createActor(
                Dip20Interface, { agent: tempAgent, canisterId: sliDip20CanisterId }
            );

             
            //let sliSwapAgent = new HttpAgent({ tempIdentity, host: "https://icp0.io/"});
            let sliSwapAgent = new HttpAgent({ tempIdentity, host: "https://ic0.app"});
             

            // const sliSwapAgent = await createAgent({
            //     tempIdentity,
            //     host: "https://ic0.app",
            // });

            // let sliSwapActor = createActor(sliSwapAppPrincipal.toText(), {
            //     agentOptions: {
            //         tempIdentity,
            //     },
            //   });

            //sliSwapAgent.fetchRootKey();
            let sliSwapActor = Actor.createActor(
                SwapAppActorInterface, { agent: sliSwapAgent, canisterId: sliSwapAppPrincipal.toText() }
            );

            //Transfer fee amount into the wallet, because the 'approve' call costs fee.
            //let transferResult = await sliDip20Token.TransferTokens(tempPrincipal,feeSli );
            //console.log(transferResult);
            //if (transferResult.Result == ResultTypes.ok){
                console.log("now inside transfer block");
                var myBalance = await tempActor.balanceOf(tempPrincipal);
                console.log("my Balance");
                console.log(myBalance);

                //let otBal = rawBalanceForApproval.GetBalance();
                let approveBal = sliDip20Token.TransferFee.GetRawBalance();
                console.log("Approve balance:");
                console.log(approveBal);
           
                let resultDip20Approve = await SwapAppActorProvider.SliDip20Approve(sliSwapAppPrincipal, approveBal);
                //let resultResponse = await tempActor.approve(sliSwapAppPrincipal, approveBal);
                //let resultResponse = await tempActor.approve(sliSwapAppPrincipal, rawBalanceForApproval);
                           
                console.log("transderResponse");
                console.log(resultDip20Approve);
                myBalance = await tempActor.balanceOf(tempPrincipal);
                console.log("my Balance");
                console.log(myBalance);
            //}

            
        });
        let finalAnswer = await Promise.all(promises);
        console.log(finalAnswer);

    }

    console.timeEnd('doSomething');

    // console.log("array:");
    // console.log(indexArray);
    // console.log("array length");
    // let len =  indexArray.length;
    // console.log(len);
    // console.log(indexArray[len-1]);
} 




async function AddButtonClickEvents() {
    document.getElementById("ButtonTabpage1").addEventListener('click', async function () {
        showTabpage(event, 'tabContentIcrc1');
    }, false);
  
    document.getElementById("ButtonTabpage2").addEventListener('click', async function () {
        showTabpage(event, 'tabContentSwapWallets');
    }, false);
   
    document.getElementById("SwapWallets_button_createWallets").addEventListener('click', 
    async function () { await CreateTheDynamicWalletsNow();}, false);


}

async function RemoveButtonClickEvents() {
    document.getElementById("ButtonTabpage1").removeEventListener('click', async function () {
        showTabpage(event, 'tabContentIcrc1');
    }, false);

    document.getElementById("ButtonTabpage2").removeEventListener('click', async function () {
        showTabpage(event, 'tabContentSwapWallets');
    }, false);

    document.getElementById("SwapWallets_button_createWallets").removeEventListener('click', 
    async function () {
        await CreateTheDynamicWalletsNow();}, false);
}


function StopRequested() {
    return admin_section_init.CommonThingsInitialized == false || RelatedHtmlPageExist() == false;
}

function RelatedHtmlPageExist() {
    return document.getElementById('DivPageAdminSection') != null;
}



