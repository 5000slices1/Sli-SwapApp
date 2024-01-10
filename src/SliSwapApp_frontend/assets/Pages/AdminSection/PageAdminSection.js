import { CommonIdentityProvider, SwapAppActorProvider,ResultTypes, SpecifiedTokenInterfaceType} from "../../modules/Types/CommonTypes";
import { WalletsProvider } from "../../modules/SubModules/Wallets/WalletsProvider";
import { PubSub } from "../../modules/Utils/PubSub";
import { Principal } from '@dfinity/principal';
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant } from "../../modules/Utils/CommonUtils";

function RelatedHtmlPageExist(){
    return document.getElementById('DivPageAdminSection') != null;
  };

  function SliIcrcCanisterIdWasSet(){    
    let canisterId = CommonIdentityProvider.WalletsProvider.SliConvertInfo.TargetToken.CanisterId;
    if (canisterId !=null && canisterId != undefined){
        return canisterId.length > 0;
    }
  }

  function GldsIcrcCanisterIdWasSet(){
    let canisterId = CommonIdentityProvider.WalletsProvider.GldsConvertInfo.TargetToken.CanisterId != null;
    if (canisterId !=null && canisterId != undefined){
        return canisterId.length > 0;
    }
  }

  
async function UpdateValues(){
       
    let swapAppCanisterIdTextBox =  document.getElementById("swap-app-canister-id");
    if (swapAppCanisterIdTextBox){
        swapAppCanisterIdTextBox.value = CommonIdentityProvider.SwapAppPrincipalText;
    }
    else{
        swapAppCanisterIdTextBox.value = "unknown";
    }
    
    let sliIcrc1canisterId  =  CommonIdentityProvider.WalletsProvider.SliConvertInfo.TargetToken.CanisterId;    
    if (sliIcrc1canisterId != null){
        let inputElementSliCanisterId = document.getElementById("sli-icrc1-canister-id");
        if (inputElementSliCanisterId){
            inputElementSliCanisterId.value = sliIcrc1canisterId;
        }
    }

    let gldsIcrc1canisterId =  CommonIdentityProvider.WalletsProvider.GldsConvertInfo.TargetToken.CanisterId;    
    if (gldsIcrc1canisterId != null){
        let inputElementGldsCanisterId = document.getElementById("glds-icrc1-canister-id");
        if (inputElementGldsCanisterId){
            inputElementGldsCanisterId.value = gldsIcrc1canisterId;
        }

    }
}

 

async function setSliIcrcCanisterId(){
    let inputElementSliCanisterId = document.getElementById("sli-icrc1-canister-id");
    if (inputElementSliCanisterId){
        let canisterId = inputElementSliCanisterId.value;
        try{
            let principal = Principal.fromText(canisterId);                
        }catch(error){
            alert('This is not a valid canister-id');
            return;
        }
        let result = await SwapAppActorProvider.SliIcrc1_SetCanisterId(canisterId);        
        if (result.Result == ResultTypes.ok){
            let resultMetadata = await SwapAppActorProvider.SliIcrc1_GetMetadata();
            console.log("sli metadata:");
            console.log(resultMetadata);
            await CommonIdentityProvider.WalletsProvider.SliConvertInfo.
            TargetToken.SetCanisterId(canisterId);

            
        } else if (result.Result == ResultTypes.err){
            alert(result.ResultText);
            return;
        }
                                
    }
};

async function setGldsIcrcCanisterId(){
    let inputElementGldsCanisterId = document.getElementById("glds-icrc1-canister-id");
    if (inputElementGldsCanisterId){
        let canisterId = inputElementGldsCanisterId.value;
        try{
            let principal = Principal.fromText(canisterId);                
        }catch(error){
            alert('This is not a valid canister-id');
            return;
        }
        let result = await SwapAppActorProvider.GldsIcrc1_SetCanisterId(canisterId);        
        if (result.Result == ResultTypes.ok){
            let resultMetadata = await SwapAppActorProvider.GldsIcrc1_GetMetadata();
            console.log("glds metadata:");
            console.log(resultMetadata);
            await CommonIdentityProvider.WalletsProvider.GldsConvertInfo.
            TargetToken.SetCanisterId(canisterId);

            
        } else if (result.Result == ResultTypes.err){
            alert(result.ResultText);
            return;
        }
                                
    }
};


export const admin_section_init =  async function initAdminSection(){
                 
    var element = document.getElementById('set-sli-icrc1-canister-id');        
    if (element != null){

        element.removeEventListener('click', async ()=> {await setSliIcrcCanisterId();}, true);    
        
        //TODO: UNDO
        if (false && this.SliIcrcCanisterIdWasSet() == true){
            element.disabled = true;
        }   
        else{        
            element.disabled = false;
            element.addEventListener('click', async ()=> {await setSliIcrcCanisterId();}, true);
        } 
    }   

    element = document.getElementById('set-glds-icrc1-canister-id');        
    if (element != null){
        element.removeEventListener('click', async ()=> {await setGldsIcrcCanisterId();}, true);        
        if (false && this.GldsIcrcCanisterIdWasSet() == true){
            element.disabled = true;
        }   
        else{
            element.disabled = false;
            element.addEventListener('click', async ()=> {await setGldsIcrcCanisterId();}, true);
        }        
    }   

    await UpdateValues();
      
};
