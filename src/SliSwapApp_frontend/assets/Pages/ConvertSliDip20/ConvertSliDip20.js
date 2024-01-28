import { CommonIdentityProvider, SpecifiedTokenInterfaceType, SwapAppActorProvider} from "../../modules/Types/CommonTypes";
import { PubSub } from "../../modules/Utils/PubSub";
import { SliSwapApp_backend} from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant, GetCustomResultFromVariant } from "../../modules/Utils/CommonUtils";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";
import { Principal } from "@dfinity/principal";
import { ResultTypes } from "../../modules/Types/CommonTypes";

function RelatedHtmlPageExist(){
    return document.getElementById('ConvertSli_HtmlPage') != null;
  }



// function getDepositableAmount(){
//     let walletInfo = CommonIdentityProvider.WalletsProvider;    
    
//     if (walletInfo.Wallet_IsConnected == false){
//         return 0.0;
//     }
//     //SliSwapApp_backend.GetSliSwapWalletForPrincipal()

//     var depositable_amount = walletInfo.SliDip20_Balance - walletInfo.SliDip20_Fee;
//     depositable_amount = Math.max(depositable_amount, 0);
//     return depositable_amount;
// }

function userIsLoggedIn(){
    let usersIdentity = CommonIdentityProvider?.WalletsProvider?.UsersIdentity;    
    console.log("usersIdentity");
    console.log(usersIdentity);

    if (usersIdentity ==null || usersIdentity == undefined ){
        return false;           
    }

    if (usersIdentity.IsConnected == true){
        return true;           
    }
    return false;
}

async function getSwapWalletPrincipalForLoggedInUser(){

    
    let userPrincipal = CommonIdentityProvider.WalletsProvider.UsersIdentity.AccountPrincipal;
    let responseResult = await SliSwapApp_backend.GetSliSwapWalletForPrincipal(userPrincipal);
    let result = GetCustomResultFromVariant(responseResult);
    if (result.Result == "NotExist"){
        return null;
    }
    return result.ResultValue;
}

//TODO: make this work
async function deposit_oldSliTokens(){
            
    if (RelatedHtmlPageExist() == false){
        return;
    }

    if (userIsLoggedIn() == false){
        return;
    }

    try{

        document.getElementById('buttonDepositNowOldSliDip20').setAttribute("disabled", true);
        document.getElementById('convertNowOldSliDip20ToICRC1').setAttribute("disabled", true);


        let userPrincipal = CommonIdentityProvider.WalletsProvider.UsersIdentity.AccountPrincipal;
        let swapAppPrincipal = Principal.fromText(CommonIdentityProvider.SwapAppPrincipalText);
    
        let tokenInfo = await getTokenInfo();
        var transferFee = tokenInfo.TransferFee.GetValue();

        var balance = (await tokenInfo.GetBalanceFromUsersWallet()).GetValue();
        balance = Math.max(balance, 0.0);

        var amountToDeposit = Number(document.getElementById('depositAmountOldSliDip20').value);
        amountToDeposit = Math.max(amountToDeposit, 0.0);

        

        if (amountToDeposit < (transferFee * 2.0)){
            alert('The deposit amount is too small. At least 0.002 is required. (Because of approval fee + transfer fee)');
            return;
        }

        if ( balance < amountToDeposit)
        {
            alert('The deposit amount is more than you have in your wallet.' + '(Fee is:' + transferFee + "' )");
            return;
        }

        let depositablePossible = await SliSwapApp_backend.CanUserDepositSliDip20(userPrincipal);
        if (depositablePossible == false){

            alert('Deposit is still in progress.');
            return;
        }

        //We need to do this to ensure real 1:1 conversion will be taken place later. 
        let realAmountToDeposit = Number(amountToDeposit - (transferFee * 2.0));
        if (realAmountToDeposit < 0){
            alert('The deposit amount is too small. At least 0.002 is required. (Because of approval fee + transfer fee)');
            return;
        }

        var amountToDepositBigInt = BigInt(TokenBalance.FromNumber(realAmountToDeposit,tokenInfo.Decimals).GetRawValue());
        let approvalAmountBigInt = BigInt(TokenBalance.FromNumber(amountToDeposit, tokenInfo.Decimals).GetRawValue());
        
        console.log("amountToDepositBigInt");
        console.log(amountToDepositBigInt);

        console.log("approvalAmountBigInt");
        console.log(approvalAmountBigInt);
    
        let approveResult = await tokenInfo.approve(swapAppPrincipal, approvalAmountBigInt );

        if (approveResult.Result != ResultTypes.ok){
            alert('Approval was not successful.');
            return;
        }

        //check allowance
        let allowanceResult = await tokenInfo.allowance(userPrincipal, swapAppPrincipal );
        
        console.log("allowanceResult");
        console.log(allowanceResult);

    
        let depositResult = await SliSwapApp_backend.DepositSliDip20Tokens(userPrincipal, amountToDepositBigInt);
        let parsedResult = GetResultFromVariant(depositResult);

        await UpdateBalances();

        if (parsedResult.Result != ResultTypes.ok){
            alert(parsedResult.ResultValue);
        }
    }
    catch(error){
        alert(error);
    }
    finally{
        document.getElementById('buttonDepositNowOldSliDip20').removeAttribute("disabled");
        document.getElementById('convertNowOldSliDip20ToICRC1').removeAttribute("disabled");
    }
}

async function ResetAllValues(){

    if (RelatedHtmlPageExist() == false){
        return;
    }

    document.getElementById('walletAmountOldSliDip20MinusFee').value = 0.0
    document.getElementById('depositAmountOldSliDip20').value = 0.0
    document.getElementById('DepositedAmountOldSliDip20').value = 0.0
    document.getElementById('number_of_ICRC1_tokens_for_depositAmountOldSliDip20').value = 0.0

}

async function getTokenInfo(){

    if (userIsLoggedIn() == false){
        return null;           
    }
    let walletInfo = CommonIdentityProvider.WalletsProvider; 
    let tokenInfo = await walletInfo.GetToken(SpecifiedTokenInterfaceType.Dip20Sli);
    return tokenInfo;
}

async function UpdateBalances(){

    if (RelatedHtmlPageExist() == false){
        return;
    }
    await ResetAllValues();

      
    if (userIsLoggedIn() == false){
        return;           
    }

    // let walletInfo = CommonIdentityProvider.WalletsProvider; 
    // let tokenInfo = await walletInfo.GetToken(SpecifiedTokenInterfaceType.Dip20Sli);
    let tokenInfo = await getTokenInfo();
    var feeNeeded = tokenInfo.TransferFee.GetValue();

    //One fee for approval and one for transfer. Therefore the fee = 2 * transferFee
    feeNeeded = feeNeeded + feeNeeded;

    let sliDip20TokensBalanceInUserWallet = (await tokenInfo.GetBalanceFromUsersWallet()).GetValue();


    let response = await SwapAppActorProvider.GetDepositedSliAmount();
    if (response.Result == ResultTypes.ok){
        let depositedAmount =  new TokenBalance(BigInt(response.ResultValue), tokenInfo.Decimals);
        document.getElementById('DepositedAmountOldSliDip20').value = Number(depositedAmount.GetValue()); 
    }else{
        document.getElementById('DepositedAmountOldSliDip20').value = 0.0;
    }
    
    var maxDepositableAmount = sliDip20TokensBalanceInUserWallet;
    maxDepositableAmount = Math.max(maxDepositableAmount, feeNeeded);
 

    document.getElementById('walletAmountOldSliDip20MinusFee').value = maxDepositableAmount;
   
    //Set the default 'amount to deposit' value to the current maximum possible value
    var depositableAmount = maxDepositableAmount; 
    depositableAmount = Math.max(depositableAmount, 0);
  
    document.getElementById('depositAmountOldSliDip20').value = depositableAmount;
    document.getElementById('depositAmountOldSliDip20').max =  depositableAmount;
   
}

 

export const convertSliDip20_init =  async function initConvertSliDip20(){
            
    PubSub.unsubscribe('ConvertDip20_js_UserIdentityChanged');
    PubSub.subscribe('ConvertDip20_js_UserIdentityChanged','UserIdentityChanged', UpdateBalances);

    let element = document.getElementById('buttonDepositNowOldSliDip20');        
    if (element != null){
        element.removeEventListener('click', async ()=> {await deposit_oldSliTokens();});        
        element.addEventListener('click', async ()=> {await deposit_oldSliTokens();});
    }
   
    await UpdateBalances();
  };

