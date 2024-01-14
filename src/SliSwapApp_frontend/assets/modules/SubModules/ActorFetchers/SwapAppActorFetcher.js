import { CommonIdentityProvider,ResultInfo, ResultTypes, UserRole} from "../../Types/CommonTypes.js";
import { SwapAppActorInterface } from "../../Types/Interfaces.js";
import { Principal } from '@dfinity/principal';
import {GetResultFromVariant} from "../../Utils/CommonUtils.js"
import {SliSwapAppInterface} from "../../../../../declarations/SliSwapApp_backend/SliSwapApp_backend.did.js"


export class SwapAppActorFetcher{

    #provider;    
    #swapAppActor;


    #ProviderIsDefined(){
        if (this.#provider == null || this.#provider == undefined || this.#provider == false){
            return false;
        };
        return true;
    };

    async Init(provider){
        this.#provider = provider;  
                
        if (this.#ProviderIsDefined() == false){            
            this.#provider = null;
            this.#swapAppActor = null;            
            return;
        }
           
        let dAppPrincipalText =  CommonIdentityProvider.SwapAppPrincipalText;          
        this.#swapAppActor = await this.#provider.createActor({ canisterId: dAppPrincipalText, interfaceFactory: SwapAppActorInterface });                       
        
    };

    async GetUserRole(){

        if (this.#ProviderIsDefined() == false){

            return {'NormalUser':null};
        };
        
        try{
            return await this.#swapAppActor.GetUserRole() ;                
        }
        catch(error){
            return {'NormalUser':null};
        };        
    };

    //Set Sli canister-id in the backend:
    async SliIcrc1_SetCanisterId(canisterId){

        if (this.#ProviderIsDefined() == false){
            return new ResultInfo(ResultTypes.err, "You are not connected.");
        }        
        return GetResultFromVariant(await this.#swapAppActor.SliIcrc1_SetCanisterId(canisterId));            
    };


    // async SliIcrc1_GetMetadata(){
    //     return await this.#swapAppActor.SliIcrc1_GetMetadata();
    // }

    //Set Glds canister-id in the backend:
    async GldsIcrc1_SetCanisterId(canisterId){
        if (this.#ProviderIsDefined() == false){
            return new ResultInfo(ResultTypes.err, "You are not connected.");
        }
        return GetResultFromVariant(await this.#swapAppActor.GldsIcrc1_SetCanisterId(canisterId));
    };

    // async GldsIcrc1_GetMetadata(){
    //     return await this.#swapAppActor.GldsIcrc1_GetMetadata();
    // }


  

};