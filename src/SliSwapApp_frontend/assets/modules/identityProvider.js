import { Artemis } from 'artemis-web3-adapter';
import { PubSub } from "./Utils/PubSub";
import { SwapAppActorProvider, WalletTypes, SpecifiedTokenInterfaceType } from './Types/CommonTypes';
import { WalletsProvider } from "./SubModules/Wallets/WalletsProvider";
import { Principal } from '@dfinity/principal';
import { SliSwapApp_backend } from "../../../declarations/SliSwapApp_backend";

export class IdentiyProvider{

    //private fields    
    #_adapter;
    #_plugWalletConnected;
    #_init_done;
    #_inside_login;
    #_inside_logout;
    #_lastLoginWalletType;
    #_connectionObject;

    //public fields
    WalletsProvider;
    SwapAppPrincipalText;
    
    constructor(){              
        this.#_adapter = new Artemis();   
        this.WalletsProvider = new WalletsProvider();
        this.#_init_done = false;        
    };
        
    IsWalletConnected(){

        if (this.#_adapter.provider == null || this.#_adapter.provider == false) {
            return false;
        }

        let connectedWalletInfo = this.#_adapter?.connectedWalletInfo;
        if (connectedWalletInfo ==null || connectedWalletInfo ==false){
            return false;            
        };

        if (connectedWalletInfo.id == 'plug' && this.#_plugWalletConnected == false ){
            return false;
        }
        
        return true;
    };
    
    //SwapAppActor
    async #UserIdentityChanged(){
        this.WalletsProvider.ResetAfterUserIdentityChanged();
        
        try
        {            
            if (this.IsWalletConnected() == false) {
                return;
            }
            
            let connectedWalletInfo = this.#_adapter?.connectedWalletInfo;            
            if (connectedWalletInfo !=null && connectedWalletInfo !=false){
                
                switch(connectedWalletInfo.id){
                    case 'plug': this.WalletsProvider.UsersIdentity.Type = WalletTypes.plug;
                        break;
                    case 'stoic': this.WalletsProvider.UsersIdentity.Type = WalletTypes.stoic;
                        break;
                    case 'dfinity': this.WalletsProvider.UsersIdentity.Type = WalletTypes.dfinity;
                        break;
                    default: return;
                }
                let principalText = this.#_adapter?.principalId;
                let principal = Principal.fromText(principalText);                            


                this.WalletsProvider.UsersIdentity.Name = connectedWalletInfo.name;
                this.WalletsProvider.UsersIdentity.AccountPrincipalText = principalText;
                this.WalletsProvider.UsersIdentity.AccountPrincipal = principal;                
                let provider =  this.#_adapter?.provider;
                                    
                // let tokenActor = new TokenActors(provider, principal);
                // await tokenActor.init();
            
                // const responses = await Promise.all([
                //     await tokenActor.GetSliBalance(),
                //     await tokenActor.GetGldsBalance(),
                //     await tokenActor.GetIcpBalance(),    
                //     await tokenActor.GetSliFee(),
                //     await tokenActor.GetGldsFee()                
                // ]);

                 
                // let balanceSli = responses[0];
                // this.WalletInfo.SliDip20_RawBalance = balanceSli.RawBalance;
                // this.WalletInfo.SliDip20_Balance = balanceSli.Balance;
                // this.WalletInfo.SliDip20_Fee = responses[3];
                                
                // let balanceGlds = responses[1];
                // this.WalletInfo.GldsDip20_RawBalance = balanceGlds.RawBalance;
                // this.WalletInfo.GldsDip20_Balance = balanceGlds.Balance;
                // this.WalletInfo.GldsDip20_Fee = responses[4];

                // let balanceIcp = responses[2];
                // this.WalletInfo.Icp_RawBalance = balanceIcp.RawBalance;
                // this.WalletInfo.Icp_Balance = balanceIcp.Balance;

                
                await this.WalletsProvider.SliConvertInfo.SourceToken.UserIdentityChanged(provider, principal);                        
                await this.WalletsProvider.GldsConvertInfo.SourceToken.UserIdentityChanged(provider, principal);                
                await this.WalletsProvider.GldsConvertInfo.TargetToken.UserIdentityChanged(provider, principal);
                await this.WalletsProvider.GldsConvertInfo.TargetToken.UserIdentityChanged(provider, principal);
                this.WalletsProvider.UsersIdentity.IsConnected = true;                
                            
            } else{
                return;
            };
        } catch(error){
            
        }
        finally{
                        
            PubSub.publish('UserIdentityChanged', null);            
            PubSub.publish('UpdateAllWalletBalances_Started', null);            
        };        
    };
   
    //This method is called when user identiy (inside plug wallet) is switched 
    async OnPlugUserIdentitySwitched()
    {        
        await this.Login(WalletTypes.plug);        
    }

    async ReInitConnectionObject(){

        var canisterIds = this.WalletsProvider.GetAllCanisterIds();        
        canisterIds.push(this.SwapAppPrincipalText);
        canisterIds = Array.from(new Set([...canisterIds]));
                
        let connectedObj = { 
            whitelist: canisterIds, 
            host: 'https://icp0.io/'
        };
                      
        this.#_connectionObject = connectedObj;                                               
    };

    async Init(){                  
                
        console.log("IN INIIT");

        console.log("1");
        this.SwapAppPrincipalText = await SliSwapApp_backend.GetSwapAppPrincipalText();
              
        console.log("2");
        //Set Sli-Dip20 canister-id
        await this.WalletsProvider.SliConvertInfo.SourceToken.SetCanisterId("zzriv-cqaaa-aaaao-a2gjq-cai");          

        console.log("3");
        //Set Glds-Dip20 canister-id
        await this.WalletsProvider.GldsConvertInfo.SourceToken.SetCanisterId("7a6j3-uqaaa-aaaao-a2g5q-cai");
        
        console.log("4");
        console.log("Sli icrc1 canister id:" + this.WalletsProvider.SliConvertInfo.TargetToken.CanisterId);
        if (this.WalletsProvider.SliConvertInfo.TargetToken.CanisterId == null){
            let sliCanisterId = await SliSwapApp_backend.SliIcrc1_GetCanisterId();            
            console.log("can id got: " + sliCanisterId);
            if (sliCanisterId!=null && sliCanisterId.length > 0){
                await this.WalletsProvider.SliConvertInfo.TargetToken.SetCanisterId(sliCanisterId);
            }
        };

        console.log("Glds icrc1 canister id:" + this.WalletsProvider.GldsConvertInfo.TargetToken.CanisterId);
        if (this.WalletsProvider.GldsConvertInfo.TargetToken.CanisterId == null){
            let gldsCanisterId = await SliSwapApp_backend.GldsIcrc1_GetCanisterId();
            if (gldsCanisterId!=null && gldsCanisterId.length > 0){
                await this.WalletsProvider.GldsConvertInfo.TargetToken.SetCanisterId(gldsCanisterId);
            }
        };
        
        await this.ReInitConnectionObject();        
      
        //Plug wallet is sending this event when user-identity is switched 
        window.addEventListener("updateConnection",async () => {this.OnPlugUserIdentitySwitched();},false);       
                        
        try{
            await this.Logout();
        }
        catch(error)
        {
            console.log(error);
        }        
        this.#_init_done = true;
        
    };
    
    async ReLogin(){
        if (!this.#_lastLoginWalletType){
            return;
        }
        await this.Logout(false);
        await this.Login(this.#_lastLoginWalletType, true);
    };

    async Login(walletType, sendEventUserIdentyChanged = true){

        if (this.#_inside_login == true){
            return;
        }
        this.#_inside_login = true;
        this.#_lastLoginWalletType = walletType;
        try
        {
            var walletName  = "";        
            switch(walletType){
                case WalletTypes.plug: {
                    walletName="plug";                    
                }
                    break;
                case WalletTypes.stoic: walletName="stoic";
                    break;
                case WalletTypes.dfinity: walletName="dfinity";               
                    break;
                default: walletName = "";
                    break;
            }
                
            if (walletName == ""){
                return;
            }                                

            let result =  await this.#_adapter.connect(walletName,this.#_connectionObject);
                                                                                                   
            if (walletType == WalletTypes.plug){
                this.#_plugWalletConnected = true;
            };        
            
            await SwapAppActorProvider.Init(this.#_adapter.provider);
            

        }
        catch(error){
            console.log(error);
        }
        finally{
            this.#_inside_login = false;
            
            if (sendEventUserIdentyChanged == true){
                this.#UserIdentityChanged(); 
            };
        }
    };

    async Logout(sendEventUserIdentyChanged = true){
        
        if (this.#_inside_logout){
            return;
        }
        this.#_inside_logout = true;
        try{
                        
            if (this.#_init_done == false){
                if (this.#_adapter.provider != null && this.#_adapter.provider != false) {
                    await this.#_adapter.disconnect();
                };
                return;
            }

            if (this.IsWalletConnected() == false){
                return;
            }

            if (this.#_adapter?.connectedWalletInfo?.id == 'plug'){                                
                this.#_plugWalletConnected = false;
            }
            
            await this.#_adapter.disconnect();                                
        }
        catch(error){
            console.log(error);    
        }
        finally{
            this.#_inside_logout = false;
            if (sendEventUserIdentyChanged == true){
                await this.#UserIdentityChanged(); 
            };
        }

               
    };

};










