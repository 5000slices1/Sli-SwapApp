import { TokenBalance } from "./TokenBalance";
import { SpecifiedTokenInterfaceType } from "../../Types/CommonTypes";
import { Dip20TokenActorFetcher } from "../ActorFetchers/Dip20TokenActorFetcher";
import { Icrc1TokenActorFetcher } from "../ActorFetchers/Icrc1TokenActorFetcher";
import { PubSub } from "../../Utils/PubSub";

export class TokenInfo {

  Name;
  Symbol;
  Logo;
  Decimals;
  TransferFee;
  CanisterId;
  TokenActor;
  MetaDataPresent;
  SpecifiedTokenInterfaceType;

  //Token amount of logged in users wallet
  BalanceInUserWallet;

  //Total-Balance consist of all deposit-transfers into the dApp wallet from user-Wallet
  //p.s. For each deposit into swap-app, a separate created deposit-wallet will be used. 
  // Therefore we need to track the total deposited amount
  TotalBalanceDepositedInsideSwapApp;

  #provider;
  #loggedInPrincipal;

  constructor(specifiedTokenInterfaceType) {

    this.SpecifiedTokenInterfaceType = specifiedTokenInterfaceType;
    this.BalanceInUserWallet = new TokenBalance();
    this.TotalBalanceDepositedInsideSwapApp = new TokenBalance();
    this.TransferFee = new TokenBalance();
    this.CanisterId = null;
    this.MetaDataPresent = false;
    this.Reset();
  }


  async GetTotalSupply(){
    if (this.MetaDataPresent  == false || this.TokenActor == null){
      return new TokenBalance();
    }

    return await this.TokenActor.GetTotalSupply(this.Decimals);   
  }

  async UpdateTokenInfo(tokenInfo){
    if (tokenInfo.hasData()){
      this.Name = tokenInfo.name;
      this.Symbol = tokenInfo.symbol;
      this.Logo = tokenInfo.logo;
      this.Decimals = tokenInfo.decimals;
      this.TransferFee = tokenInfo.fee;
      this.CanisterId = tokenInfo.canisterId; 
      this.MetaDataPresent = true;
      PubSub.publish("TokenInfo_WasUpdated", this.SpecifiedTokenInterfaceType);
    }
  }
  
  async UserIdentityChanged(provider, principal){
    this.ResetAfterUserIdentityChanged();  
        
    this.#provider = provider;
    this.#loggedInPrincipal = principal;    
    await this.UpdateTokenActors();           
  };

  async UpdateTokenActors(){

    if (this.CanisterId == null || this.MetaDataPresent == false ||      
      this.#provider == null || this.#loggedInPrincipal == null) {
      return;
    }

    switch (this.SpecifiedTokenInterfaceType) {

      case SpecifiedTokenInterfaceType.Dip20Sli:
      case SpecifiedTokenInterfaceType.Dip20Glds: {        
        this.TokenActor = new Dip20TokenActorFetcher();        
        await this.TokenActor.Init(this.#provider, this.#loggedInPrincipal, this.CanisterId);        
      }
        break;

      case SpecifiedTokenInterfaceType.Icrc1Glds:
      case SpecifiedTokenInterfaceType.Icrc1Sli: {        
        this.TokenActor = new Icrc1TokenActorFetcher();        
        await this.TokenActor.Init(this.#provider, this.#loggedInPrincipal, this.CanisterId);        
      }
        break;
      default: return;
    }

  }


  //Reset all, except CanisterId and TokenInterfaceType
  Reset() {
    this.BalanceInUserWallet.Reset();
    this.TotalBalanceDepositedInsideSwapApp.Reset();
    this.TransferFee.Reset();
    this.Name = "";
    this.Symbol = "";
    this.Logo = null;
    this.TokenActor = null;
    this.#loggedInPrincipal = null;
    this.#provider = null;
  }

  ResetAfterUserIdentityChanged() {
    this.TokenActor = null;
    this.#loggedInPrincipal = null;
    this.#provider = null;
    this.BalanceInUserWallet.Reset();
    this.TotalBalanceDepositedInsideSwapApp.Reset();
  }

}

