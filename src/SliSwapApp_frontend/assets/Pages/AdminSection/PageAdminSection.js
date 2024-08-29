import { CommonIdentityProvider, SwapAppActorProvider, ResultTypes, SpecifiedTokenInterfaceType } from "../../modules/Types/CommonTypes";
import { Principal } from '@dfinity/principal';
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant } from "../../modules/Utils/CommonUtils";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";
import { Get2DimArray, GetRandomIdentity } from "../../modules/Utils/CommonUtils";
import { Actor, HttpAgent } from '@dfinity/agent';
import { Dip20Interface } from "../../modules/Types/Interfaces";
import { GlobalDataProvider } from "../../modules/Types/CommonTypes";
import { loadingProgessEnabled, loadingProgessDisabled } from "../../modules/Utils/CommonUtils";
import fetch from 'isomorphic-fetch';

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
    const tableRows = document.querySelectorAll('#Table_' + tokenSymbol + ' tr');

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

async function UpdateUiFromModel() {

    document.getElementById("sli-icrc1-canister-id").
        value = GlobalDataProvider.Icrc1_Sli_CanisterId;

    document.getElementById("sliTokenLogo").
        src = GlobalDataProvider.Icrc1_Sli_TokenLogo;

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
        value = GlobalDataProvider.Icrc1_Glds_CanisterId;

    document.getElementById("gldsTokenLogo").
        src = GlobalDataProvider.Icrc1_Glds_TokenLogo;

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

async function UpdateValues() {


    if (RelatedHtmlPageExist() == false || StopRequested() == true) {
        return;
    }

    GlobalDataProvider.SwapApp_CanisterId_Text = CommonIdentityProvider.SwapAppPrincipalText;

    let swapAppCanisterIdTextBox = document.getElementById("swap-app-canister-id");
    if (swapAppCanisterIdTextBox) {
        swapAppCanisterIdTextBox.value = CommonIdentityProvider.SwapAppPrincipalText;
    }
    else {
        swapAppCanisterIdTextBox.value = "unknown";
    }
    let swapAppPrincipal = Principal.fromText(CommonIdentityProvider.SwapAppPrincipalText);

    if (StopRequested() == true) { return; }

    let sliToken = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Icrc1Sli);
    let gldsToken = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Icrc1Glds);

    if (sliToken != undefined && sliToken.MetaDataPresent == true) {
        GlobalDataProvider.Icrc1_Sli_TokenLogo = sliToken.Logo;
        GlobalDataProvider.Icrc1_Sli_TokenSymbol = sliToken.Symbol;
        GlobalDataProvider.Icrc1_Sli_TokenName = sliToken.Name;
        GlobalDataProvider.Icrc1_Sli_TokenDecimals = sliToken.Decimals;
        GlobalDataProvider.Icrc1_Sli_CanisterId = sliToken.CanisterId;
    }

    if (gldsToken != undefined && gldsToken.MetaDataPresent == true) {
        GlobalDataProvider.Icrc1_Glds_TokenLogo = gldsToken.Logo;
        GlobalDataProvider.Icrc1_Glds_TokenSymbol = gldsToken.Symbol;
        GlobalDataProvider.Icrc1_Glds_TokenName = gldsToken.Name;
        GlobalDataProvider.Icrc1_Glds_TokenDecimals = gldsToken.Decimals;
        GlobalDataProvider.Icrc1_Glds_CanisterId = gldsToken.CanisterId;
    }

    const promise_Sli1 = async () => {
        if (sliToken == undefined || sliToken.MetaDataPresent != true) {
            return 0.0;
        }
        var sliFee = GetResultFromVariant(await SliSwapApp_backend.SliIcrc1_GetCurrentTransferFee()).ResultValue;
        sliFee = new TokenBalance(sliFee, sliToken.Decimals);
        return sliFee.GetValue();
    };

    const promise_Sli2 = async () => {
        if (sliToken == undefined || sliToken.MetaDataPresent != true) {
            return 0.0;
        }
        let totalSupply = await sliToken.GetTotalSupply();
        return totalSupply.GetValue();
    };

    const promise_Sli3 = async () => {
        if (sliToken == undefined || sliToken.MetaDataPresent != true) {
            return 0.0;
        }
        var sliBalanceInAppWallet = await sliToken.GetBalanceForPrincipal(swapAppPrincipal);
        return sliBalanceInAppWallet.GetValue();
    };


    const promise_Glds1 = async () => {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true) {
            return 0.0;
        }
        var gldsFee = GetResultFromVariant(await SliSwapApp_backend.GldsIcrc1_GetCurrentTransferFee()).ResultValue;
        gldsFee = new TokenBalance(gldsFee, gldsToken.Decimals);
        return gldsFee.GetValue();
    };

    const promise_Glds2 = async () => {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true) {
            return 0.0;
        }
        let totalSupply = await gldsToken.GetTotalSupply();
        return totalSupply.GetValue();

    };

    const promise_Glds3 = async () => {
        if (gldsToken == undefined || gldsToken.MetaDataPresent != true) {
            return 0.0;
        }
        var gldsBalanceInAppWallet = await gldsToken.GetBalanceForPrincipal(swapAppPrincipal);
        return gldsBalanceInAppWallet.GetValue();
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

    await UpdateUiFromModel();
}


async function setSliIcrcCanisterId() {

    try {
        loadingProgessEnabled();
        let inputElementSliCanisterId = document.getElementById("sli-icrc1-canister-id");
        if (inputElementSliCanisterId) {
            var canisterIdPrincipal;

            let canisterId = inputElementSliCanisterId.value;
            try {
                canisterIdPrincipal = Principal.fromText(canisterId);
            } catch (error) {
                alert('This is not a valid canister-id');
                return;
            }

            let result = await SwapAppActorProvider.SliIcrc1_SetCanisterId(canisterIdPrincipal);

            if (result.Result == ResultTypes.err) {
                alert(result.ResultValue);
                return;
            }
            if (result.Result == ResultTypes.ok) {

                await CommonIdentityProvider.WalletsProvider.UpdateTokenInfosFromBackend();
                let icrc1SliToken = await CommonIdentityProvider.WalletsProvider.
                    GetToken(SpecifiedTokenInterfaceType.Icrc1Sli);
                await icrc1SliToken.UpdateTokenActors();
                UpdateValues();
            }
        }
    } finally {
        loadingProgessDisabled();
    }
}

async function setGldsIcrcCanisterId() {

    try {
        loadingProgessEnabled();
        let inputElementGldsCanisterId = document.getElementById("glds-icrc1-canister-id");
        if (inputElementGldsCanisterId) {
            var canisterIdPrincipal;
            let canisterId = inputElementGldsCanisterId.value;
            try {
                canisterIdPrincipal = Principal.fromText(canisterId);
            } catch (error) {
                alert('This is not a valid canister-id');
                return;
            }


            let result = await SwapAppActorProvider.GldsIcrc1_SetCanisterId(canisterIdPrincipal);


            if (result.Result == ResultTypes.err) {
                alert(result.ResultValue);
                return;
            }
            if (result.Result == ResultTypes.ok) {
                await CommonIdentityProvider.WalletsProvider.UpdateTokenInfosFromBackend();
                let icrc1GldsToken = await CommonIdentityProvider.WalletsProvider.
                    GetToken(SpecifiedTokenInterfaceType.Icrc1Glds);
                await icrc1GldsToken.UpdateTokenActors();
                UpdateValues();
            }

        }
    }
    finally {
        loadingProgessDisabled();
    }
}

async function lock_ICRC1_changing_CanisterIds() {

    await SwapAppActorProvider.set_changing_icrc1_canister_ids_to_locked_state();
    await initialize_set_icrc1_cansiter_ids_buttons();
}

async function initialize_set_icrc1_cansiter_ids_buttons() {

    let isLocked = await SliSwapApp_backend.changing_icrc1_canister_ids_has_locked_state();

    var element = document.getElementById('set-sli-icrc1-canister-id');
    if (element != null) {

        element.removeEventListener('click', async () => { await setSliIcrcCanisterId(); }, true);

        if (isLocked == true) {
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
        if (isLocked == true) {
            element.disabled = true;
        }
        else {
            element.disabled = false;
            element.addEventListener('click', async () => { await setGldsIcrcCanisterId(); }, true);
        }
    }

    element = document.getElementById('page_admin_lock_setting_icrc1_cansiter_ids');
    if (element != null) {
        element.removeEventListener('click', async () => { await lock_ICRC1_changing_CanisterIds(); }, true);
        if (isLocked == true) {
            element.disabled = true;
        }
        else {
            element.disabled = false;
            element.addEventListener('click', async () => { await lock_ICRC1_changing_CanisterIds(); }, true);
        }
    }
}

//This section is called everytime the corresponding html-page 'PageAdminSection.html' is shown
export const admin_section_init = async function initAdminSection() {

    if (typeof admin_section_init.CommonThingsInitialized == 'undefined') {
        admin_section_init.CommonThingsInitialized = false;
    }

    admin_section_init.CommonThingsInitialized = false;

    try {
        loadingProgessEnabled();
        await initialize_set_icrc1_cansiter_ids_buttons();

        await RemoveButtonClickEvents();
        await AddButtonClickEvents();

        await UpdateVisibilityForDynamicRows("sli", true);
        await UpdateVisibilityForDynamicRows("glds", true);
        await UpdateUiFromModel();

        admin_section_init.CommonThingsInitialized = true;
        await UpdateValues();
    }
    finally {
        loadingProgessDisabled();
    }

};


//Helper functions:


async function CreateTheDynamicWalletsNow(specifiedTokenInterfaceType) {

    try {
        loadingProgessEnabled();

        let sliSwapAppPrincipal = Principal.fromText(CommonIdentityProvider.SwapAppPrincipalText);
        var dip20CanisterIdToUse = "";
        var transferFeeBigInt = BigInt(0);
        var dip20Token = null;
        var numberOfWalletsToCreate = 0;
        let bucketSize = 40;

        switch (specifiedTokenInterfaceType) {
            case SpecifiedTokenInterfaceType.Dip20Sli:
                numberOfWalletsToCreate = Number(document.getElementById('sli_SwapWallets_NumberOfWalletsToCreate').value);
                dip20Token = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Dip20Sli);

                break;
            case SpecifiedTokenInterfaceType.Dip20Glds:
                numberOfWalletsToCreate = Number(document.getElementById('glds_SwapWallets_NumberOfWalletsToCreate').value);
                dip20Token = await CommonIdentityProvider.WalletsProvider.GetToken(SpecifiedTokenInterfaceType.Dip20Glds);
                break;
        }


        if (numberOfWalletsToCreate <= 0) {
            return;
        }

        transferFeeBigInt = dip20Token.TransferFee.GetRawValue();
        dip20CanisterIdToUse = dip20Token.CanisterId;

        let approveAmount = TokenBalance.FromNumber(5000, dip20Token.Decimals).GetRawValue();

        const indexArray = Get2DimArray(numberOfWalletsToCreate, bucketSize);
        var updateLock = false;
        for (var z = 0; z < indexArray.length; z++) {
            let innerArr = indexArray[z];

            //Do in parallel (With parallel size of 'bucketSize')
            const promises = innerArr.map(async (parallelIndex) => {

                let approvalWalletIdentity = GetRandomIdentity();
                let approvalWalletPrincipal = approvalWalletIdentity.getPrincipal();
                let principalAlreadyOccupied = await SliSwapApp_backend.ApprovedWalletsPrincipalExist(approvalWalletPrincipal);

                if (principalAlreadyOccupied == false) {

                    //(1) Transfer fee amount into the wallet, because the 'approve' call costs fee.
                    let transferResult = await dip20Token.TransferTokens(approvalWalletPrincipal, transferFeeBigInt);

                    if (transferResult.Result == ResultTypes.ok) {

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

                        if (approveResponse.Result == ResultTypes.ok) {

                            // (3) Check the allowance amount
                            var allowanceNumber = await swappingWalletActor.allowance(approvalWalletPrincipal, sliSwapAppPrincipal);

                            if (allowanceNumber >= approveAmount) {

                                var addApprovalWalletIntoDatabaseResponse;

                                //(4) Add the approved wallet-principal into database in the backend
                                switch (specifiedTokenInterfaceType) {
                                    case SpecifiedTokenInterfaceType.Dip20Sli:
                                        addApprovalWalletIntoDatabaseResponse =
                                            await SwapAppActorProvider.AddApprovalWalletSli(approvalWalletPrincipal);
                                        break;
                                    case SpecifiedTokenInterfaceType.Dip20Glds:
                                        addApprovalWalletIntoDatabaseResponse =
                                            await SwapAppActorProvider.AddApprovalWalletGlds(approvalWalletPrincipal)
                                        break;
                                }

                                if (addApprovalWalletIntoDatabaseResponse.Result == ResultTypes.ok) {

                                    try {

                                        let index = parallelIndex % bucketSize;
                                        let waitTime = (index * 150);
                                        setTimeout(() => {

                                            while (updateLock == true) {
                                                //wait
                                            }
                                            updateLock = true;

                                            try {
                                                switch (specifiedTokenInterfaceType) {
                                                    case SpecifiedTokenInterfaceType.Dip20Sli:
                                                        {
                                                            let actValue = Number(document.getElementById("sli_SwapWallets_NumberOfFreeWallets").value);
                                                            let newValue = Number(actValue + 1);
                                                            document.getElementById("sli_SwapWallets_NumberOfFreeWallets").value = Number(newValue);
                                                        }
                                                        break;

                                                    case SpecifiedTokenInterfaceType.Dip20Glds:
                                                        {
                                                            let actValue = Number(document.getElementById("glds_SwapWallets_NumberOfFreeWallets").value);
                                                            let newValue = Number(actValue + 1);
                                                            document.getElementById("glds_SwapWallets_NumberOfFreeWallets").value = Number(newValue);
                                                        }
                                                        break;
                                                    default: break;
                                                }


                                            }
                                            finally {
                                                updateLock = false;
                                            }

                                        }, waitTime);
                                    }
                                    catch (error) {
                                        //do nothing
                                        alert(error);
                                    }
                                }
                            }
                        }
                    }
                }
            });

            await Promise.all(promises);

            setTimeout(async () => {
                let numberOfApprovedSliWallets = await SliSwapApp_backend.GetNumberOfSliApprovedWallets();
                let numberOfApprovedGldsWallets = await SliSwapApp_backend.GetNumberOfGldsApprovedWallets();

                GlobalDataProvider.ApprovedWallets_Sli_Free = numberOfApprovedSliWallets[0];
                GlobalDataProvider.ApprovedWallets_Sli_InUse = numberOfApprovedSliWallets[1];

                GlobalDataProvider.ApprovedWallets_Glds_Free = numberOfApprovedGldsWallets[0];
                GlobalDataProvider.ApprovedWallets_Glds_InUse = numberOfApprovedGldsWallets[1];

                await UpdateUiFromModel();
            }, 1000);
        }
    } finally {
        loadingProgessDisabled();
    }
}

async function AddButtonClickEvents() {
    document.getElementById("ButtonTabpage1").addEventListener('click', async function () {
        showTabpage(event, 'tabContentIcrc1');
    }, false);

    document.getElementById("ButtonTabpage2").addEventListener('click', async function () {
        showTabpage(event, 'tabContentSwapWallets');
    }, false);

    document.getElementById("sli_SwapWallets_button_createWallets").addEventListener('click',
        async function () { await CreateTheDynamicWalletsNow(SpecifiedTokenInterfaceType.Dip20Sli); }, false);

    document.getElementById("glds_SwapWallets_button_createWallets").addEventListener('click',
        async function () { await CreateTheDynamicWalletsNow(SpecifiedTokenInterfaceType.Dip20Glds); }, false);

    document.getElementById("burn-sli-icrc1-id").addEventListener('click',
            async function () { await BurnSliIcrc1(); }, false);

    document.getElementById("burn-glds-icrc1-id").addEventListener('click',
            async function () { await BurnGldsIcrc1(); }, false);
            

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
            await CreateTheDynamicWalletsNow(SpecifiedTokenInterfaceType.Dip20Sli);
        }, false);

    document.getElementById("glds_SwapWallets_button_createWallets").removeEventListener('click',
        async function () {
            await CreateTheDynamicWalletsNow(SpecifiedTokenInterfaceType.Dip20Glds);
        }, false);

    document.getElementById("burn-sli-icrc1-id").removeEventListener('click',
            async function () { await BurnSliIcrc1(); }, false);

    document.getElementById("burn-glds-icrc1-id").removeEventListener('click',
            async function () { await BurnGldsIcrc1(); }, false);

}


function StopRequested() {
    return admin_section_init.CommonThingsInitialized == false || RelatedHtmlPageExist() == false;
}

function RelatedHtmlPageExist() {
    return document.getElementById('DivPageAdminSection') != null;
}



async function BurnSliIcrc1() {

    let amount = document.getElementById("sli-icrc1-burn-from-swap-app").value;    
    let tokenBalance = TokenBalance.FromNumber(amount, 8);
    let rawAmount = tokenBalance.GetRawValue();
  
    await SliSwapApp_backend.add_burning_allowances();         
    await SwapAppActorProvider.burn_sli_icrc1_tokens(rawAmount);   
    await UpdateValues();        
}

async function BurnGldsIcrc1() {

    let amount = document.getElementById("glds-icrc1-burn-from-swap-app").value;    
    let tokenBalance = TokenBalance.FromNumber(amount, 8);
    let rawAmount = tokenBalance.GetRawValue();

    await SliSwapApp_backend.add_burning_allowances();        
    await SwapAppActorProvider.burn_glds_icrc1_tokens(rawAmount);
 
    await UpdateValues();    
}

