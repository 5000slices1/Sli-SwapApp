import { CommonIdentityProvider, SpecifiedTokenInterfaceType} from "../../modules/Types/CommonTypes";
import { PubSub } from "../../modules/Utils/PubSub";
import { SliSwapApp_backend} from "../../../../declarations/SliSwapApp_backend";

function RelatedHtmlPageExist(){
    return document.getElementById('ConvertSli_HtmlPage') != null;
  }


function getDepositableAmount(){
    let walletInfo = CommonIdentityProvider.WalletsProvider;    
    
    if (walletInfo.Wallet_IsConnected == false){
        return 0.0;
    }
    var depositable_amount = walletInfo.SliDip20_Balance - walletInfo.SliDip20_Fee;
    depositable_amount = Math.max(depositable_amount, 0);
    return depositable_amount;
};

//TODO: make this work
async function deposit_oldSliTokens(){
            
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

async function UpdateBalances(){

    if (RelatedHtmlPageExist() == false){
        return;
    }
    await ResetAllValues();

    let walletInfo = CommonIdentityProvider.WalletsProvider;    
    if (walletInfo.Wallet_IsConnected == false){
        return;           
    }

    let tokenInfo = await walletInfo.GetToken(SpecifiedTokenInterfaceType.Dip20Sli);
    let transferFee = tokenInfo.TransferFee.GetBalance();


    let sliDip20TokensBalanceInUserWallet = (await tokenInfo.GetBalanceFromUsersWallet()).GetBalance();

    var maxDepositableAmount = sliDip20TokensBalanceInUserWallet - transferFee;
    maxDepositableAmount = Math.max(maxDepositableAmount, 0);
 

    document.getElementById('walletAmountOldSliDip20MinusFee').value = maxDepositableAmount;
   
    //Set the default 'amount to deposit' value to the current maximum possible value
    var depositableAmount = maxDepositableAmount; 
    depositableAmount = Math.max(depositableAmount, 0);
  
    document.getElementById('depositAmountOldSliDip20').value = depositableAmount;
   

}

 

export const convertSliDip20_init =  async function initConvertSliDip20(){
            
    PubSub.unsubscribe('ConvertDip20_js_UserIdentityChanged','UserIdentityChanged', UpdateBalances);
    PubSub.subscribe('ConvertDip20_js_UserIdentityChanged','UserIdentityChanged', UpdateBalances);

    let element = document.getElementById('buttonDepositNowOldSliDip20');        
    if (element != null){
        element.removeEventListener('click', async ()=> {await deposit_oldSliTokens();}, true);        
        element.addEventListener('click', async ()=> {await deposit_oldSliTokens();}, true);
    }
   
    await UpdateBalances();
  };

