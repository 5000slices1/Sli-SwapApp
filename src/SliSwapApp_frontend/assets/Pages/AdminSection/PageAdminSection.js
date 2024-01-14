import { CommonIdentityProvider, SwapAppActorProvider, ResultTypes, SpecifiedTokenInterfaceType } from "../../modules/Types/CommonTypes";
import { WalletsProvider } from "../../modules/SubModules/Wallets/WalletsProvider";
import { PubSub } from "../../modules/Utils/PubSub";
import { Principal } from '@dfinity/principal';
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant, GetTokensInfos } from "../../modules/Utils/CommonUtils";


function RelatedHtmlPageExist() {
    return document.getElementById('DivPageAdminSection') != null;
};

function SliIcrcCanisterIdWasSet() {
    let canisterId = CommonIdentityProvider.WalletsProvider.SliConvertInfo.TargetToken.CanisterId;
    if (canisterId != null && canisterId != undefined) {
        return canisterId.length > 0;
    }
}

function GldsIcrcCanisterIdWasSet() {
    let canisterId = CommonIdentityProvider.WalletsProvider.GldsConvertInfo.TargetToken.CanisterId != null;
    if (canisterId != null && canisterId != undefined) {
        return canisterId.length > 0;
    }
}

async function UpdateVisibilityForDynamicRows(tokenSymbol, shouldShow) {
    if (RelatedHtmlPageExist() == false) {
        return;
    }
    const tableRows = document.querySelectorAll('#TableSli tr');
    tableRows.forEach(tr => {
        if (tr.id.startsWith('row_' + tokenSymbol + "_Metadata")) {
            if (shouldShow) {
                tr.style.display = 'block';
            }
            else {
                tr.style.display = 'none';
            }
        }
    });
}

async function UpdateValues_Internal(tokenSymbol, metaData, fee, totalSupply) {

    console.log("UpdateValues_Internal");
    let hasData = metaData.hasData() == true;

    await UpdateVisibilityForDynamicRows(tokenSymbol, hasData)
    if (hasData == false) {
        return;
    }

    document.getElementById(tokenSymbol + "-icrc1-canister-id").
        value = metaData.canisterId;

    document.getElementById(tokenSymbol + "TokenLogo").
        value = metaData.logo;

    document.getElementById(tokenSymbol + "TokenSymbol").
        value = metaData.symbol;

    document.getElementById(tokenSymbol + "TokenName").
        value = metaData.name;

    document.getElementById("${tokenSymbol}TokenDecimals").
        value = metaData.decimals;

    document.getElementById("${tokenSymbol}TotalSupply").
        value = totalSupply;

    document.getElementById("${tokenSymbol}TokenTransferFee").
        value = fee;
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

    let sliMetadata = await GetTokensInfos();
    if (StopRequested() == true) { return; }

    console.log("1");
    let sliToken = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Icrc1Sli);
    console.log(sliToken);
    
    let gldsToken = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Icrc1Glds);

    
    console.log(gldsToken);

    if (sliToken != undefined) {
        //The call will take some seconds, and meanwhile the current html-page 
        //might no longer be shown.
        if (StopRequested() == true) { return; }
        let sliFee = GetResultFromVariant(await SliSwapApp_backend.SliIcrc1_GetCurrentTransferFee()).ResultValue;

        if (StopRequested() == true) { return; }
        let sliTotalSupply = await sliToken.GetTotalSupply();
        //GetResultFromVariant(await SliSwapApp_backend.SliIcrc1_GetCurrentTotalSupply()).ResultValue;
        UpdateValues_Internal("sli", sliMetadata.Icrc1_Sli, sliFee.GetBalance(), sliTotalSupply);
    }

    if (gldsToken != undefined) {
        if (StopRequested() == true) { return; }
        let gldsFee = await gldsToken.GetTotalSupply();
        //GetResultFromVariant(await SliSwapApp_backend.GldsIcrc1_GetCurrentTransferFee()).ResultValue;

        if (StopRequested() == true) { return; }
        let gldsTotalSupply = GetResultFromVariant(await SliSwapApp_backend.GldsIcrc1_GetCurrentTotalSupply()).ResultValue;
        if (StopRequested() == true) { return; }

        UpdateValues_Internal("glds", sliMetadata.Icrc1_Glds, gldsFee.GetBalance(), gldsTotalSupply);

    }




    // let sliIcrc1canisterId  =  CommonIdentityProvider.WalletsProvider.SliConvertInfo.TargetToken.CanisterId;    
    // if (sliIcrc1canisterId != null){
    //     let inputElementSliCanisterId = document.getElementById("sli-icrc1-canister-id");
    //     if (inputElementSliCanisterId){
    //         inputElementSliCanisterId.value = sliIcrc1canisterId;
    //     }
    // }

    // let gldsIcrc1canisterId =  CommonIdentityProvider.WalletsProvider.GldsConvertInfo.TargetToken.CanisterId;    
    // if (gldsIcrc1canisterId != null){
    //     let inputElementGldsCanisterId = document.getElementById("glds-icrc1-canister-id");
    //     if (inputElementGldsCanisterId){
    //         inputElementGldsCanisterId.value = gldsIcrc1canisterId;
    //     }

    // }
}

async function setSliIcrcCanisterId() {
    let inputElementSliCanisterId = document.getElementById("sli-icrc1-canister-id");
    if (inputElementSliCanisterId) {
        let canisterId = inputElementSliCanisterId.value;
        try {
            let principal = Principal.fromText(canisterId);
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
            this.UpdateValues();
        }
    }
};

async function setGldsIcrcCanisterId() {
    let inputElementGldsCanisterId = document.getElementById("glds-icrc1-canister-id");
    if (inputElementGldsCanisterId) {
        let canisterId = inputElementGldsCanisterId.value;
        try {
            let principal = Principal.fromText(canisterId);
        } catch (error) {
            alert('This is not a valid canister-id');
            return;
        }
        let result = await SwapAppActorProvider.GldsIcrc1_SetCanisterId(canisterId);
        // if (result.Result == ResultTypes.ok){
        //     let resultMetadata = await SwapAppActorProvider.GldsIcrc1_GetMetadata();
        //     console.log("glds metadata:");
        //     console.log(resultMetadata);
        //     await CommonIdentityProvider.WalletsProvider.GldsConvertInfo.
        //     TargetToken.SetCanisterId(canisterId);


        // } else 

        if (result.Result == ResultTypes.err) {
            alert(result.ResultText);
            return;
        }

    }
};

//This section is called everytime the corresponding html-page 'PageAdminSection.html' is shown
export const admin_section_init = async function initAdminSection() {

    if (typeof admin_section_init.CommonThingsInitialized == 'undefined') {
        admin_section_init.CommonThingsInitialized = false;
    }

    admin_section_init.CommonThingsInitialized = false;

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
