import { CommonIdentityProvider} from "../../modules/Types/CommonTypes";
import { WalletsProvider } from "../../modules/SubModules/Wallets/WalletsProvider";
import { PubSub } from "../../modules/Utils/PubSub";



function RelatedHtmlPageExist(){
    return document.getElementById('DivPageAdminSection') != null;
  };

  
async function UpdateValues(){
       
    let swapAppCanisterIdTextBox =  document.getElementById("swap-app-canister-id");
    if (swapAppCanisterIdTextBox){
        swapAppCanisterIdTextBox.value = CommonIdentityProvider.SwapAppPrincipalText;
    }
    else{
        swapAppCanisterIdTextBox.value = "unknown";
    }

}

export const admin_section_init =  async function initAdminSection(){
                 
    await UpdateValues();
      
};
