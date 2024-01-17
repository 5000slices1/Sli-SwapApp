import { CommonIdentityProvider, SwapAppActorProvider, ResultTypes, SpecifiedTokenInterfaceType } from "../../modules/Types/CommonTypes";
import { Principal } from '@dfinity/principal';
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant } from "../../modules/Utils/CommonUtils";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";


function RelatedHtmlPageExist() {
    return document.getElementById('DivPageAdminSection') != null;
}

function showTabpage(evt, cityName) {

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
    document.getElementById(cityName).style.display = "block";
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

function StopRequested() {
    return admin_section_init.CommonThingsInitialized == false || RelatedHtmlPageExist() == false;
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

    if (sliToken != undefined && sliToken.MetaDataPresent == true) {
        //The call will take some seconds, and meanwhile the current html-page 
        //might no longer be shown.
        if (StopRequested() == true) { return; }
        var sliFee = GetResultFromVariant(await SliSwapApp_backend.SliIcrc1_GetCurrentTransferFee()).ResultValue;
        sliFee = new TokenBalance(sliFee, sliToken.Decimals);
        if (StopRequested() == true) { return; }
        let sliTotalSupply = await sliToken.GetTotalSupply();
       
        var sliBalanceInAppWallet = GetResultFromVariant(await SliSwapApp_backend.GetIcrc1Balance(
            Principal.fromText(sliToken.CanisterId))).ResultValue;
        sliBalanceInAppWallet = new TokenBalance(sliBalanceInAppWallet, sliToken.Decimals);
        if (StopRequested() == true) { return; }
        UpdateValues_Internal("sli", sliToken, sliFee.GetBalance(), sliTotalSupply.GetBalance(),
        sliBalanceInAppWallet.GetBalance()
        );
    }

    if (gldsToken != undefined && gldsToken.MetaDataPresent == true) {
        if (StopRequested() == true) { return; }
        var gldsFee = GetResultFromVariant(await SliSwapApp_backend.GldsIcrc1_GetCurrentTransferFee()).ResultValue;
        gldsFee = new TokenBalance(gldsFee, gldsToken.Decimals);

        if (StopRequested() == true) { return; }
        let gldsTotalSupply = await gldsToken.GetTotalSupply();

        if (StopRequested() == true) { return; }
        var gldsBalanceInAppWallet = GetResultFromVariant(await SliSwapApp_backend.GetIcrc1Balance(
            Principal.fromText(gldsToken.CanisterId))).ResultValue;
        gldsBalanceInAppWallet = new TokenBalance(gldsBalanceInAppWallet, gldsToken.Decimals);

        if (StopRequested() == true) { return; }
        UpdateValues_Internal("glds", gldsToken, gldsFee.GetBalance(), gldsTotalSupply.GetBalance(),
        gldsBalanceInAppWallet.GetBalance()
        );
    }
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

    document.getElementById("ButtonTabpage1").removeEventListener('click', async function(){
         showTabpage(event, 'tabContentIcrc1')}, false);

    document.getElementById("ButtonTabpage1").addEventListener('click', async function(){
        showTabpage(event, 'tabContentIcrc1')}, false);

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
