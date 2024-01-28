import { CommonIdentityProvider,ResultInfo, ResultTypes} from "../../Types/CommonTypes.js";
import { SwapAppActorInterface } from "../../Types/Interfaces.js";
import {GetResultFromVariant} from "../../Utils/CommonUtils.js"

export class SwapAppActorFetcher{

    #provider;    
    #swapAppActor;


    #ProviderIsDefined(){
        if (this.#provider == null || this.#provider == undefined || this.#provider == false){
            return false;
        }
        return true;
    }

    async Init(provider){
        this.#provider = provider;  
                
        if (this.#ProviderIsDefined() == false){            
            this.#provider = null;
            this.#swapAppActor = null;            
            return;
        }
           
        let dAppPrincipalText =  CommonIdentityProvider.SwapAppPrincipalText;          
        this.#swapAppActor = await this.#provider.createActor({ canisterId: dAppPrincipalText, interfaceFactory: SwapAppActorInterface });                       
        
    }

    async GetUserRole(){

        if (this.#ProviderIsDefined() == false){

            return {'NormalUser':null};
        }
        
        try{
            console.log("inside Swapappfetcher getuserrole");
            console.log("SwapAppActor");
            console.log(this.#swapAppActor);


            let dAppPrincipalText =  CommonIdentityProvider.SwapAppPrincipalText;
            console.log(dAppPrincipalText);

            let userRole = await this.#swapAppActor.GetUserRole() ;     
            console.log("Swapappfetcher getuserrole:");
            console.log(userRole);     
            return userRole;      
        }
        catch(error){
            return {'NormalUser':null};
        }        
    }

    //Set Sli canister-id in the backend:
    async SliIcrc1_SetCanisterId(canisterId){

        if (this.#ProviderIsDefined() == false){
            return new ResultInfo(ResultTypes.err, "You are not connected.");
        }        
        return GetResultFromVariant(await this.#swapAppActor.SliIcrc1_SetCanisterId(canisterId));            
    }

    //Set Glds canister-id in the backend:
    async GldsIcrc1_SetCanisterId(canisterId){
        if (this.#ProviderIsDefined() == false){
            return new ResultInfo(ResultTypes.err, "You are not connected.");
        }
        return GetResultFromVariant(await this.#swapAppActor.GldsIcrc1_SetCanisterId(canisterId));
    }


    async AddApprovalWalletSli(approvalWalletPrincipal){

        if (this.#ProviderIsDefined() == false) {
            new ResultInfo(ResultTypes.err, "Not initialized");
          }
 
        try
        {
            let result = await this.#swapAppActor.AddNewApprovedSliWallet(approvalWalletPrincipal);
            return GetResultFromVariant(result);
        }
        catch(error)
        {
          return new ResultInfo(ResultTypes.err, error);
        }
    }

    async AddApprovalWalletGlds(approvalWalletPrincipal){

        if (this.#ProviderIsDefined() == false) {
            new ResultInfo(ResultTypes.err, "Not initialized");
          }
 
        try
        {
            let result = await this.#swapAppActor.AddNewApprovedGldsWallet(approvalWalletPrincipal);
            return GetResultFromVariant(result);
        }
        catch(error)
        {
          return new ResultInfo(ResultTypes.err, error);
        }
    }

    async DepositSliDip20Tokens(amount){

      

        if (this.#ProviderIsDefined() == false) {
            new ResultInfo(ResultTypes.err, "Not initialized");
          }
 
        try
        {
            console.log("Try to deposit now amount:");
            console.log(amount);

            let result = await this.#swapAppActor.DepositSliDip20Tokens(amount);
            return GetResultFromVariant(result);
        }
        catch(error)
        {
          return new ResultInfo(ResultTypes.err, error);
        }
    }


    async DepositGldsDip20Tokens(amount){

        if (this.#ProviderIsDefined() == false) {
            new ResultInfo(ResultTypes.err, "Not initialized");
          }
 
        try
        {
            let result = await this.#swapAppActor.DepositGldsDip20Tokens(amount);
            return GetResultFromVariant(result);
        }
        catch(error)
        {
          return new ResultInfo(ResultTypes.err, error);
        }
    }

    async GetDepositedSliAmount(){

        if (this.#ProviderIsDefined() == false) {
            new ResultInfo(ResultTypes.err, "Not initialized");
          }
 
        try
        {
            let result = await this.#swapAppActor.GetSliDip20DepositedAmount();
            let parsedResult = GetResultFromVariant(result);
             return parsedResult;
        }
        catch(error)
        {
          return new ResultInfo(ResultTypes.err, error);
        }
    }

}