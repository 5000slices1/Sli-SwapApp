import { CommonIdentityProvider, SpecifiedTokenInterfaceType} from "../../modules/Types/CommonTypes";
import { PubSub } from "../../modules/Utils/PubSub";
import { SliSwapApp_backend} from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant, GetCustomResultFromVariant } from "../../modules/Utils/CommonUtils";

function RelatedHtmlPageExist(){
    return document.getElementById('ConvertSli_HtmlPage') != null;
  }



function getDepositableAmount(){
    let walletInfo = CommonIdentityProvider.WalletsProvider;    
    
    if (walletInfo.Wallet_IsConnected == false){
        return 0.0;
    }
    //SliSwapApp_backend.GetSliSwapWalletForPrincipal()

    var depositable_amount = walletInfo.SliDip20_Balance - walletInfo.SliDip20_Fee;
    depositable_amount = Math.max(depositable_amount, 0);
    return depositable_amount;
}

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

    let tokenInfo = await getTokenInfo();
    var transferFee = tokenInfo.TransferFee.GetValue();

    var balance = (await tokenInfo.GetBalanceFromUsersWallet()).GetValue();
    balance = Math.max(balance, 0.0);

    var amountToDeposit = Number(document.getElementById('depositAmountOldSliDip20').value);
    amountToDeposit = Math.max(amountToDeposit, 0.0);

    let swapWallet = await getSwapWalletPrincipalForLoggedInUser();
    if (swapWallet == null){
        transferFee = transferFee + transferFee;
    }

    if (amountToDeposit < transferFee){
        alert('The deposit amount is too small.');
        return;
    }

    if (amountToDeposit > balance - transferFee)
    {
        alert('The deposit amount is more than you have in your wallet.' + '(Fee is:' + transferFee + "' )");
        return;
    }

    //(1) Get the deposit-adress 
    

    if (swapWallet == null){
        //This is the first time the user is doing the deposit for the sliDip20 token. 
        //Therefore the Swap-Wallet not exist yet.
        //1) So we need to do 'approval' on the user-wallet with amount of the tokens wanted to deposit.
        //2) After this we will call on backend a method, so that the tokens are deposited in the backend.

        //(1) We need now to approve first


    }
    else{
        //Todo: implement

    }

    //SliSwapApp_backend.GetSliSwapWalletForPrincipal()
     
    return;
    // await SliSwapApp_backend.GetDepositAddress();
    // let walletInfo = CommonIdentityProvider.WalletsProvider;    
    
    // if (walletInfo.Wallet_IsConnected == false){
    //     return;
    // }

    // var depositable_amount = getDepositableAmount();
    // var depositAmount = document.getElementById('depositAmountOldSliDip20').valueAsNumber; 
    // depositAmount = Math.min(depositAmount, 0);
    
    // if (depositAmount > depositable_amount){
    //     return;        
    // }

    // if (depositAmount < walletInfo.SliDip20_Fee){
    //     return;
    // }


    //alert(availableAmount.toString() + " - " + availableAmount1.toString() + " - " + amountToDeposit.toString());
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
};

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
    let transferFee = tokenInfo.TransferFee.GetValue();

    let sliDip20TokensBalanceInUserWallet = (await tokenInfo.GetBalanceFromUsersWallet()).GetValue();

    let swapWallet = await getSwapWalletPrincipalForLoggedInUser();

    if (swapWallet == null){
        //If swap-wallet not exist already then we need to do approval first. (In deposit method)
        //And approval also cost transfer-fee, therefore the fee amount doubles
        transferFee = transferFee + transferFee;
    }

    var maxDepositableAmount = sliDip20TokensBalanceInUserWallet - transferFee;
    maxDepositableAmount = Math.max(maxDepositableAmount, 0);
 

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

