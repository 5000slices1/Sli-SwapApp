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

  #provider;
  #loggedInPrincipal;

  constructor(specifiedTokenInterfaceType) {

    this.SpecifiedTokenInterfaceType = specifiedTokenInterfaceType;

    this.TransferFee = new TokenBalance();
    this.Decimals = new TokenBalance();
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

  //The metadata of the token is updated
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

  async GetBalanceFromUsersWallet(){ 
    if (this.TokenActor == null){
       return new TokenBalance(0,0);
    } 

    return await this.TokenActor.GetBalance(this.Decimals);
  }

  //Reset all, except CanisterId and TokenInterfaceType
  Reset() {
    this.TransferFee.Reset();
    this.Name = "";
    this.Symbol = "";
    this.Decimals.Reset();
    this.Logo = null;
    this.TokenActor = null;
    this.#loggedInPrincipal = null;
    this.#provider = null;
  }

  ResetAfterUserIdentityChanged() {
    this.TokenActor = null;
    this.#loggedInPrincipal = null;
    this.#provider = null;
  }

}

