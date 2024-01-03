import { CommonIdentityProvider} from "../../modules/Types/CommonTypes";
import { WalletsProvider } from "../../modules/SubModules/Wallets/WalletsProvider";
import { PubSub } from "../../modules/Utils/PubSub";

function RelatedHtmlPageExist(){
  return document.getElementById('walletAmountOldGldsDip20') != null;
};

//TODO: make this work
async function deposit_oldGldsTokens(){
        
    return;
    var availableAmount = document.getElementById('walletAmountOldGldsDip20').valueAsNumber;  
    var availableAmount1 = CommonIdentityProvider.WalletInfo.DisplayBalance_SliDip20;
    var amountToDeposit = document.getElementById('depositAmountOldGldsDip20').valueAsNumber;     
    alert(availableAmount.toString() + " - " + availableAmount1.toString() + " - " + amountToDeposit.toString());
}

async function IdentityChanged(args){
         
    if (RelatedHtmlPageExist() == false){
        return;
    }

    let walletInfo = CommonIdentityProvider.WalletInfo;    
    if (walletInfo.Wallet_IsConnected == false){
        document.getElementById('walletAmountOldGldsDip20').value = 0;           
    }
    else{
        var depositable_amount = walletInfo.GldsDip20_Balance - walletInfo.GldsDip20_Fee;
        depositable_amount = Math.max(depositable_amount, 0);
        //GldsDip20_Balance
        document.getElementById('walletAmountOldGldsDip20').value = depositable_amount
    }    
             
 };

export const convertGldsDip20_init =  async function initConvertGldsDip20(){
             
    PubSub.unsubscribe('ConvertGldsDip20_js_UserIdentityChanged','UserIdentityChanged', IdentityChanged);
    PubSub.subscribe('ConvertGldsDip20_js_UserIdentityChanged','UserIdentityChanged', IdentityChanged);

    let element = document.getElementById('buttonDepositNowOldGldsDip20');        
    if (element != null){
        element.removeEventListener('click', async ()=> {await deposit_oldGldsTokens();}, true);        
        element.addEventListener('click', async ()=> {await deposit_oldGldsTokens();}, true);
    }   
    IdentityChanged("");
  };

