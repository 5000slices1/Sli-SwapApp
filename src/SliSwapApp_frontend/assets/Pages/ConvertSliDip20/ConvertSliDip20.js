import { CommonIdentityProvider} from "../../modules/Types/CommonTypes";
import { WalletsProvider } from "../../modules/SubModules/Wallets/WalletsProvider";
import { PubSub } from "../../modules/Utils/PubSub";
import { SliSwapApp_backend} from "../../../../declarations/SliSwapApp_backend";

function RelatedHtmlPageExist(){
    return document.getElementById('walletAmountOldSliDip20') != null;
  };


function getDepositableAmount(){
    let walletInfo = CommonIdentityProvider.WalletInfo;    
    
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
    await SliSwapApp_backend.GetDepositAddress();
    let walletInfo = CommonIdentityProvider.WalletInfo;    
    
    if (walletInfo.Wallet_IsConnected == false){
        return;
    }

    var depositable_amount = getDepositableAmount();
    var depositAmount = document.getElementById('depositAmountOldSliDip20').valueAsNumber; 
    depositAmount = Math.min(depositAmount, 0);
    
    if (depositAmount > depositable_amount){
        return;        
    }

    if (depositAmount < walletInfo.SliDip20_Fee){
        return;
    }


    //alert(availableAmount.toString() + " - " + availableAmount1.toString() + " - " + amountToDeposit.toString());
}

async function IdentityChanged(args){
         
    if (RelatedHtmlPageExist() == false){
        return;
    }

    let walletInfo = CommonIdentityProvider.WalletInfo;    
    if (walletInfo.Wallet_IsConnected == false){
        document.getElementById('walletAmountOldSliDip20').value = 0;           
    }
    else{        
        //SliDip20_Balance
        document.getElementById('walletAmountOldSliDip20').value = getDepositableAmount();
    }    
             
 };

export const convertSliDip20_init =  async function initConvertSliDip20(){
            
    PubSub.unsubscribe('ConvertDip20_js_UserIdentityChanged','UserIdentityChanged', IdentityChanged);
    PubSub.subscribe('ConvertDip20_js_UserIdentityChanged','UserIdentityChanged', IdentityChanged);

    let element = document.getElementById('buttonDepositNowOldSliDip20');        
    if (element != null){
        element.removeEventListener('click', async ()=> {await deposit_oldSliTokens();}, true);        
        element.addEventListener('click', async ()=> {await deposit_oldSliTokens();}, true);
    }
   
    IdentityChanged("");
  };

