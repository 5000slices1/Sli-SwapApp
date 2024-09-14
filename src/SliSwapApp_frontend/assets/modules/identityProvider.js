import { Artemis } from 'artemis-web3-adapter';
import { PubSub } from "./Utils/PubSub";
import { SwapAppActorProvider, WalletTypes } from './Types/CommonTypes';
import { WalletsProvider } from "./SubModules/Wallets/WalletsProvider";
import { Principal } from '@dfinity/principal';
import { SliSwapApp_backend } from "../../../declarations/SliSwapApp_backend";

export class IdentiyProvider {

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

    constructor() {
        this.#_adapter = new Artemis();
        this.WalletsProvider = new WalletsProvider();
        this.#_init_done = false;
    }

    IsWalletConnected() {

        if (this.#_adapter.provider == null || this.#_adapter.provider == false) {
            return false;
        }

        let connectedWalletInfo = this.#_adapter?.connectedWalletInfo;
        if (connectedWalletInfo == null || connectedWalletInfo == false) {
            return false;
        }

        if (connectedWalletInfo.id == 'plug' && this.#_plugWalletConnected == false) {
            return false;
        }

        return true;
    }

    //SwapAppActor
    async #UserIdentityChanged() {
        this.WalletsProvider.ResetAfterUserIdentityChanged();

        try {
            if (this.IsWalletConnected() == false) {
                return;
            }

            let connectedWalletInfo = this.#_adapter?.connectedWalletInfo;
            if (connectedWalletInfo != null && connectedWalletInfo != false) {

                switch (connectedWalletInfo.id) {
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
                let provider = this.#_adapter?.provider;


                await this.WalletsProvider.UserIdentityChanged(provider, principal);
                this.WalletsProvider.UsersIdentity.IsConnected = true;

            } else {
                return;
            }
        } catch (error) {
            //do nothing
        }
        finally {

            PubSub.publish('UserIdentityChanged', null);
            PubSub.publish('UpdateAllWalletBalances_Started', null);
        }
    }

    //This method is called when user identiy (inside plug wallet) is switched 
    async OnPlugUserIdentitySwitched() {
        await this.Login(WalletTypes.plug);
    }

    async ReInitConnectionObject() {

        var canisterIds = this.WalletsProvider.GetAllCanisterIds();
        canisterIds.push(this.SwapAppPrincipalText);
        canisterIds = Array.from(new Set([...canisterIds]));

        let connectedObj = {
            whitelist: canisterIds,
            host: 'https://icp0.io/'
        };

        this.#_connectionObject = connectedObj;
    }

    async Init() {

        this.SwapAppPrincipalText = await SliSwapApp_backend.GetSwapAppPrincipalText();
        await this.WalletsProvider.UpdateTokenInfosFromBackend();
        await this.ReInitConnectionObject();
        //Plug wallet is sending this event when user-identity is switched 
        window.addEventListener("updateConnection", async () => { this.OnPlugUserIdentitySwitched(); }, false);

        try {
            await this.Logout();
        }
        catch (error) {
            console.log(error);
        }
        this.#_init_done = true;

    }

    async ReLogin() {
        if (!this.#_lastLoginWalletType) {
            return;
        }
        await this.Logout(false);
        await this.Login(this.#_lastLoginWalletType, true);
    }

    async Login(walletType, sendEventUserIdentyChanged = true) {

        if (this.#_inside_login == true) {
            return;
        }
        this.#_inside_login = true;
        this.#_lastLoginWalletType = walletType;
        try {
            var walletName = "";
            switch (walletType) {
                case WalletTypes.plug: {
                    walletName = "plug";

                    try{
                        await this.#_adapter.connect(walletName, this.#_connectionObject);
                    } catch (error) {
                        console.log(error);
                        return;
                    }
                    
                }
                    break;
                case WalletTypes.stoic: {
                    walletName = "stoic";
                    try{
                        await this.#_adapter.connect(walletName);
                    } catch (error) {
                        console.log(error);
                        return;
                    }
                    
                }                
                    break;
                case WalletTypes.dfinity: walletName = "dfinity";
                    break;
                default: walletName = "";
                    break;
            }

            if (walletName == "") {
                return;
            }
            
                                     
            if (walletType == WalletTypes.plug) {
                this.#_plugWalletConnected = true;
            }

            await SwapAppActorProvider.Init(this.#_adapter.provider);


        }
        catch (error) {
            console.log(error);
            await this.Logout(true);
        }
        finally {
            this.#_inside_login = false;

            if (sendEventUserIdentyChanged == true) {
                console.log("UserIdentityChanged");
                this.#UserIdentityChanged();
            }
        }
    }

    async Logout(sendEventUserIdentyChanged = true) {

        if (this.#_inside_logout) {
            return;
        }
        this.#_inside_logout = true;
        try {

            if (this.#_init_done == false) {
                if (this.#_adapter.provider != null && this.#_adapter.provider != false) {
                    await this.#_adapter.disconnect();
                };
                return;
            }

            if (this.IsWalletConnected() == false) {
                return;
            }

            if (this.#_adapter?.connectedWalletInfo?.id == 'plug') {
                this.#_plugWalletConnected = false;
            }

            await this.#_adapter.disconnect();
        }
        catch (error) {
            console.log(error);
        }
        finally {
            this.#_inside_logout = false;
            if (sendEventUserIdentyChanged == true) {
                await this.#UserIdentityChanged();
            }
        }
    }
}










