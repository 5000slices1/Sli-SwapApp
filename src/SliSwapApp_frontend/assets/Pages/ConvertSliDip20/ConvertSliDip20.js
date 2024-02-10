import { CommonIdentityProvider, SpecifiedTokenInterfaceType, SwapAppActorProvider } from "../../modules/Types/CommonTypes";
import { PubSub } from "../../modules/Utils/PubSub";
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant, GetCustomResultFromVariant } from "../../modules/Utils/CommonUtils";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";
import { Principal } from "@dfinity/principal";
import { ResultTypes } from "../../modules/Types/CommonTypes";



var sliDepositOrConvertionIsOnProgress = false;
var sliUserIdBlob = "";

//#region conversion

async function convert_deposited_oldSliTokens() {



    try {
        
        if (PageExistAndUserIsLoggedIn() == false) {
            return;
        }

        document.getElementById('buttonDepositNowOldSliDip20').disabled = true;
        document.getElementById('convertNowOldSliDip20ToICRC1').disabled = true;

        let resultUserId = await SwapAppActorProvider.GetUserIdForSli();
        if (resultUserId.Result != ResultTypes.ok) {
            alert(resultUserId.ResultValue);
            return;
        }

        sliUserIdBlob = resultUserId.ResultValue;
        let convertResponse = await SliSwapApp_backend.ConvertOldSliDip20Tokens(sliUserIdBlob);
        await UpdateBalances();
        let result = GetResultFromVariant(convertResponse);
        if (result.Result != ResultTypes.ok) {
            alert(result.ResultValue);
        }

    }
    catch (error) {
        alert(error);
    }
    finally {
        document.getElementById('buttonDepositNowOldSliDip20').disabled = false;
        document.getElementById('convertNowOldSliDip20ToICRC1').disabled = false;
    }
}

//#endregion

//#region Deposit Dip20 tokens

async function deposit_oldSliTokens() {

    if (PageExistAndUserIsLoggedIn() == false) {
        return;
    }
    
    if (sliDepositOrConvertionIsOnProgress == true){
        alert('Not possible. Deposit or Convertion is still on progres...');
        return;
    }

    try {
       
        sliDepositOrConvertionIsOnProgress = true;

        document.getElementById('buttonDepositNowOldSliDip20').disabled = true;
        document.getElementById('convertNowOldSliDip20ToICRC1').disabled = true;

        let userPrincipal = CommonIdentityProvider.WalletsProvider.UsersIdentity.AccountPrincipal;
        let swapAppPrincipal = Principal.fromText(CommonIdentityProvider.SwapAppPrincipalText);

        let tokenInfo = await getTokenInfo();
        var transferFee = tokenInfo.TransferFee.GetValue();

        var balance = (await tokenInfo.GetBalanceFromUsersWallet()).GetValue();
        balance = Math.max(balance, 0.0);

        var amountToDeposit = Number(document.getElementById('depositAmountOldSliDip20').value);
        amountToDeposit = Math.max(amountToDeposit, 0.0);



        if (amountToDeposit < (transferFee * 3.0)) {
            alert('The deposit amount is too small. At least 0.003 is required. (Because of approval fee + transfer fee)');
            return;
        }

        if (balance < amountToDeposit) {

            alert('The deposit amount is more than you have in your wallet.' + '(Fee is:' + transferFee + "' )" + "balance: " + balance + " amountToDeposit: " + amountToDeposit);
            return;
        }

        let depositablePossibleResponse = GetResultFromVariant(await SliSwapApp_backend.CanUserDepositSliDip20(userPrincipal));

        if (depositablePossibleResponse.Result == false) {

            alert( depositablePossibleResponse.ResultValue);
            return;
        }

        //We need to do this to ensure real 1:1 conversion will be taken place later. 
        let realAmountToDeposit = Number(amountToDeposit - (transferFee * 2.0));
        if (realAmountToDeposit < 0) {
            alert('The deposit amount is too small. At least 0.002 is required. (Because of approval fee + transfer fee)');
            return;
        }

        var amountToDepositBigInt = BigInt(TokenBalance.FromNumber(realAmountToDeposit, tokenInfo.Decimals).GetRawValue());
        let approvalAmountBigInt = BigInt(TokenBalance.FromNumber(amountToDeposit, tokenInfo.Decimals).GetRawValue());

        let approveResult = await tokenInfo.approve(swapAppPrincipal, approvalAmountBigInt);

        if (approveResult.Result != ResultTypes.ok) {
            alert('Approval was not successful.');
            return;
        }

        let depositResult = await SliSwapApp_backend.DepositSliDip20Tokens(userPrincipal, amountToDepositBigInt);       
        let parsedResult = GetResultFromVariant(depositResult);

        await UpdateBalances();

        if (parsedResult.Result != ResultTypes.ok) {
            alert(parsedResult.ResultValue);
        }
    }
    catch (error) {
        alert(error);
    }
    finally {
        document.getElementById('buttonDepositNowOldSliDip20').disabled = false;
        document.getElementById('convertNowOldSliDip20ToICRC1').disabled = false;
        sliDepositOrConvertionIsOnProgress = false;
    }
}

//#endregion Deposit Dip20 tokens

//#region Helper functions 


function PageExistAndUserIsLoggedIn(){

    if (RelatedHtmlPageExist()== false){
        return false;
    }

    if (userIsLoggedIn() == false){
        return false;
    }

    return true;
}

function RelatedHtmlPageExist() {
    return document.getElementById('ConvertSli_HtmlPage') != null;
}


function userIsLoggedIn() {
    let usersIdentity = CommonIdentityProvider?.WalletsProvider?.UsersIdentity;

    if (usersIdentity == null || usersIdentity == undefined) {
        return false;
    }

    if (usersIdentity.IsConnected == true) {
        return true;
    }
    return false;
}

async function ResetAllValues() {

    if (RelatedHtmlPageExist() == false) {
        return;
    }

    document.getElementById('walletAmountOldSliDip20').value = 0.0
    document.getElementById('depositAmountOldSliDip20').value = 0.0
    document.getElementById('DepositedAmountOldSliDip20').value = 0.0
    document.getElementById('number_of_ICRC1_tokens_for_depositAmountOldSliDip20').value = 0.0

}

async function getTokenInfo() {

    if (userIsLoggedIn() == false) {
        return null;
    }
    let walletInfo = CommonIdentityProvider.WalletsProvider;
    let tokenInfo = await walletInfo.GetToken(SpecifiedTokenInterfaceType.Dip20Sli);
    return tokenInfo;
}

async function getIcrc1TokenInfo() {

    if (userIsLoggedIn() == false) {
        return null;
    }
    let walletInfo = CommonIdentityProvider.WalletsProvider;
    let tokenInfo = await walletInfo.GetToken(SpecifiedTokenInterfaceType.Icrc1Sli);
    return tokenInfo;
}



async function UpdateBalances() {

    if (RelatedHtmlPageExist() == false) {
        return;
    }

    if (userIsLoggedIn() == false) {
        await ResetAllValues();
        return;
    }

    let tokenInfo = await getTokenInfo();
    let icrc1TokenInfo = await getIcrc1TokenInfo();

    var feeNeeded = tokenInfo.TransferFee.GetValue();

    //One fee for approval and one for transfer. Therefore the fee = 3 * transferFee, because at least 0.001 must be transfered
    feeNeeded = feeNeeded + feeNeeded + feeNeeded;

    let [firstResult, secondResult, response] = await Promise.all([tokenInfo.GetBalanceFromUsersWallet(), 
        icrc1TokenInfo.GetBalanceFromUsersWallet(), SwapAppActorProvider.GetDepositedSliAmount()]);


    let sliDip20TokensBalanceInUserWallet = firstResult.GetValue();
    let sliIcrc1TokensBalanceInUserWallet = secondResult.GetValue();


    //let response = await SwapAppActorProvider.GetDepositedSliAmount();
    if (response.Result == ResultTypes.ok) {
        let depositedAmount = new TokenBalance(BigInt(response.ResultValue), tokenInfo.Decimals);
        document.getElementById('DepositedAmountOldSliDip20').value = Number(depositedAmount.GetValue());
        document.getElementById('number_of_ICRC1_tokens_for_depositAmountOldSliDip20').value = Number(depositedAmount.GetValue());

    } else {
        document.getElementById('DepositedAmountOldSliDip20').value = 0.0;
        document.getElementById('number_of_ICRC1_tokens_for_depositAmountOldSliDip20').value = 0.0;
    }

    var maxDepositableAmount = sliDip20TokensBalanceInUserWallet;
    if (maxDepositableAmount < feeNeeded) {
        maxDepositableAmount = 0.000;
    }

    document.getElementById('walletAmountOldSliDip20').value = maxDepositableAmount;

    //Set the default 'amount to deposit' value to the current maximum possible value
    var depositableAmount = maxDepositableAmount;
    depositableAmount = Math.max(depositableAmount, 0);

    document.getElementById('depositAmountOldSliDip20').value = depositableAmount;
    document.getElementById('depositAmountOldSliDip20').max = depositableAmount;
    document.getElementById('sli-icrc1-tokens-in-wallet').value = sliIcrc1TokensBalanceInUserWallet;
}

//#endregion Helper functions 

//#region Init

export const convertSliDip20_init = async function initConvertSliDip20() {

    sliDepositOrConvertionIsOnProgress = false;
    PubSub.unsubscribe('ConvertDip20_js_UserIdentityChanged');
    PubSub.subscribe('ConvertDip20_js_UserIdentityChanged', 'UserIdentityChanged', UpdateBalances);

    let elementDeposit = document.getElementById('buttonDepositNowOldSliDip20');
    if (elementDeposit != null) {
        elementDeposit.removeEventListener('click', async () => { await deposit_oldSliTokens(); });
        elementDeposit.addEventListener('click', async () => { await deposit_oldSliTokens(); });
    }


    let elementConvert = document.getElementById('convertNowOldSliDip20ToICRC1');
    if (elementConvert != null) {
        elementConvert.removeEventListener('click', async () => { await convert_deposited_oldSliTokens(); });
        elementConvert.addEventListener('click', async () => { await convert_deposited_oldSliTokens(); });
    }

    await UpdateBalances();
};


//#endregion Init

