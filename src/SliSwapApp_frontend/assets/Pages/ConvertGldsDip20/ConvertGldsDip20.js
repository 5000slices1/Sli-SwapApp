import { CommonIdentityProvider, SpecifiedTokenInterfaceType, SwapAppActorProvider } from "../../modules/Types/CommonTypes";
import { PubSub } from "../../modules/Utils/PubSub";
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant, GetCustomResultFromVariant } from "../../modules/Utils/CommonUtils";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";
import { Principal } from "@dfinity/principal";
import { ResultTypes } from "../../modules/Types/CommonTypes";



var gldsDepositOrConvertionIsOnProgress = false;
var gldsUserIdBlob = "";

//#region conversion

async function convert_deposited_oldGldsTokens() {



    try {
        
        if (PageExistAndUserIsLoggedIn() == false) {
            return;
        }

        document.getElementById('buttonDepositNowOldGldsDip20').disabled = true;
        document.getElementById('convertNowOldGldsDip20ToICRC1').disabled = true;

        let resultUserId = await SwapAppActorProvider.GetUserIdForGlds();
        if (resultUserId.Result != ResultTypes.ok) {
            alert(resultUserId.ResultValue);
            return;
        }

        gldsUserIdBlob = resultUserId.ResultValue;
        let convertResponse = await SliSwapApp_backend.ConvertOldGldsDip20Tokens(gldsUserIdBlob);
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
        document.getElementById('buttonDepositNowOldGldsDip20').disabled = false;
        document.getElementById('convertNowOldGldsDip20ToICRC1').disabled = false;
    }
}

//#endregion

//#region Deposit Dip20 tokens

async function deposit_oldGldsTokens() {

    if (PageExistAndUserIsLoggedIn() == false) {
        return;
    }
    
    if (gldsDepositOrConvertionIsOnProgress == true){
        alert('Not possible. Deposit or Convertion is still on progres...');
        return;
    }

    try {
       
        gldsDepositOrConvertionIsOnProgress = true;

        document.getElementById('buttonDepositNowOldGldsDip20').disabled = true;
        document.getElementById('convertNowOldGldsDip20ToICRC1').disabled = true;

        let userPrincipal = CommonIdentityProvider.WalletsProvider.UsersIdentity.AccountPrincipal;
        let swapAppPrincipal = Principal.fromText(CommonIdentityProvider.SwapAppPrincipalText);

        let tokenInfo = await getTokenInfo();
        var transferFee = tokenInfo.TransferFee.GetValue();

        var balance = (await tokenInfo.GetBalanceFromUsersWallet()).GetValue();
        balance = Math.max(balance, 0.0);

        var amountToDeposit = Number(document.getElementById('depositAmountOldGldsDip20').value);
        amountToDeposit = Math.max(amountToDeposit, 0.0);



        if (amountToDeposit < (transferFee * 3.0)) {
            alert('The deposit amount is too small. At least 0.003 is required. (Because of approval fee + transfer fee)');
            return;
        }

        if (balance < amountToDeposit) {

            alert('The deposit amount is more than you have in your wallet.' + '(Fee is:' + transferFee + "' )" + "balance: " + balance + " amountToDeposit: " + amountToDeposit);
            return;
        }

        let depositablePossibleResponse = GetResultFromVariant(await SliSwapApp_backend.CanUserDepositGldsDip20(userPrincipal));

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

        let depositResult = await SliSwapApp_backend.DepositGldsDip20Tokens(userPrincipal, amountToDepositBigInt);       
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
        document.getElementById('buttonDepositNowOldGldsDip20').disabled = false;
        document.getElementById('convertNowOldGldsDip20ToICRC1').disabled = false;
        gldsDepositOrConvertionIsOnProgress = false;
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
    return document.getElementById('ConvertGlds_HtmlPage') != null;
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

    document.getElementById('walletAmountOldGldsDip20').value = 0.0
    document.getElementById('depositAmountOldGldsDip20').value = 0.0
    document.getElementById('DepositedAmountOldGldsDip20').value = 0.0
    document.getElementById('number_of_ICRC1_tokens_for_depositAmountOldGldsDip20').value = 0.0

}

async function getTokenInfo() {

    if (userIsLoggedIn() == false) {
        return null;
    }
    let walletInfo = CommonIdentityProvider.WalletsProvider;
    let tokenInfo = await walletInfo.GetToken(SpecifiedTokenInterfaceType.Dip20Glds);
    return tokenInfo;
}

async function getIcrc1TokenInfo() {

    if (userIsLoggedIn() == false) {
        return null;
    }
    let walletInfo = CommonIdentityProvider.WalletsProvider;
    let tokenInfo = await walletInfo.GetToken(SpecifiedTokenInterfaceType.Icrc1Glds);
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
    var feeNeeded = tokenInfo.TransferFee.GetValue();

    //One fee for approval and one for transfer. Therefore the fee = 3 * transferFee, because at least 0.001 must be transfered
    feeNeeded = feeNeeded + feeNeeded + feeNeeded;

    let gldsDip20TokensBalanceInUserWallet = (await tokenInfo.GetBalanceFromUsersWallet()).GetValue();


    let response = await SwapAppActorProvider.GetDepositedGldsAmount();
    if (response.Result == ResultTypes.ok) {
        let depositedAmount = new TokenBalance(BigInt(response.ResultValue), tokenInfo.Decimals);
        document.getElementById('DepositedAmountOldGldsDip20').value = Number(depositedAmount.GetValue());
        document.getElementById('number_of_ICRC1_tokens_for_depositAmountOldGldsDip20').value = Number(depositedAmount.GetValue());

    } else {
        document.getElementById('DepositedAmountOldGldsDip20').value = 0.0;
        document.getElementById('number_of_ICRC1_tokens_for_depositAmountOldGldsDip20').value = 0.0;
    }

    var maxDepositableAmount = gldsDip20TokensBalanceInUserWallet;
    if (maxDepositableAmount < feeNeeded) {
        maxDepositableAmount = 0.000;
    }

    document.getElementById('walletAmountOldGldsDip20').value = maxDepositableAmount;

    //Set the default 'amount to deposit' value to the current maximum possible value
    var depositableAmount = maxDepositableAmount;
    depositableAmount = Math.max(depositableAmount, 0);

    document.getElementById('depositAmountOldGldsDip20').value = depositableAmount;
    document.getElementById('depositAmountOldGldsDip20').max = depositableAmount;


    let icrc1TokenInfo = await getIcrc1TokenInfo();
    let gldsIcrc1TokensBalanceInUserWallet = (await icrc1TokenInfo.GetBalanceFromUsersWallet()).GetValue();

    document.getElementById('glds-icrc1-tokens-in-wallet').value = gldsIcrc1TokensBalanceInUserWallet;
}

//#endregion Helper functions 

//#region Init

export const convertGldsDip20_init = async function initConvertGldsDip20() {

    gldsDepositOrConvertionIsOnProgress = false;
    PubSub.unsubscribe('ConvertDip20_js_UserIdentityChanged');
    PubSub.subscribe('ConvertDip20_js_UserIdentityChanged', 'UserIdentityChanged', UpdateBalances);

    let elementDeposit = document.getElementById('buttonDepositNowOldGldsDip20');
    if (elementDeposit != null) {
        elementDeposit.removeEventListener('click', async () => { await deposit_oldGldsTokens(); });
        elementDeposit.addEventListener('click', async () => { await deposit_oldGldsTokens(); });
    }


    let elementConvert = document.getElementById('convertNowOldGldsDip20ToICRC1');
    if (elementConvert != null) {
        elementConvert.removeEventListener('click', async () => { await convert_deposited_oldGldsTokens(); });
        elementConvert.addEventListener('click', async () => { await convert_deposited_oldGldsTokens(); });
    }



    await UpdateBalances();
};


//#endregion Init

