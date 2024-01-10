import { TokenBalance } from "./TokenBalance";
import { SpecifiedTokenInterfaceType } from "../../Types/CommonTypes";
import { Dip20TokenActorFetcher } from "../ActorFetchers/Dip20TokenActorFetcher";
import { Icrc1TokenActorFetcher } from "../ActorFetchers/Icrc1TokenActorFetcher";
import { SliSwapApp_backend } from "../../../../../declarations/SliSwapApp_backend";

export class TokenInfo {

  Name;
  Symbol;
  Logo;
  Decimals;
  TransferFee;
  CanisterId;
  TokenActor;
  SpecifiedTokenInterfaceType;

  //Token amount of logged in users wallet
  BalanceInUserWallet;

  //Total-Balance consist of all deposit-transfers into the dApp wallet from user-Wallet
  //p.s. For each deposit into swap-app, a separate created deposit-wallet will be used. 
  // Therefore we need to track the total deposited amount
  TotalBalanceDepositedInsideSwapApp;

  constructor(specifiedTokenInterfaceType) {

    this.SpecifiedTokenInterfaceType = specifiedTokenInterfaceType;
    this.BalanceInUserWallet = new TokenBalance();
    this.TotalBalanceDepositedInsideSwapApp = new TokenBalance();
    this.TransferFee = new TokenBalance();
    this.CanisterId = null;
    this.Reset();
  };

  async SetCanisterId(canisterId) {
    this.CanisterId = canisterId;
    await this.UpdateMetaInfos();
  };

  async UpdateMetaInfos() {
    
    if (this.TokenActor == null){
      return;
    }
    
    var metaData = null;
    //we should also set the metadata now:
    switch (this.SpecifiedTokenInterfaceType) {

      case SpecifiedTokenInterfaceType.Dip20Sli:
      case SpecifiedTokenInterfaceType.Dip20Glds: {
        try{
          metaData = await this.TokenActor.GetMetadata();
        } catch(err){
          console.log(err);
        }        
      }
        break;

      case SpecifiedTokenInterfaceType.Icrc1Glds: {
        try
        {
          metaData = await SliSwapApp_backend.GldsIcrc1_GetMetadata();
        }
        catch(err)
        {
          console.log(err);
        }
      }
        break;

      case SpecifiedTokenInterfaceType.Icrc1Sli: {
        metaData = await SliSwapApp_backend.SliIcrc1_GetMetadata();
        console.log("metadta sli");
        console.log(metaData);
      }
        break;
      default: return;
    }
    
    await this.UpdateMetaInfosDirectly(metaData);
   
  }

  async UpdateMetaInfosDirectly(metaData, alsoSetCanisterId = false){

    if (metaData != null) {
      console.log("In Set canister id - metadata result:");
      console.log(metaData);
      this.Name = metaData['name'];
      this.Symbol = metaData['symbol'];
      this.Decimals = Number(metaData['decimals']);
      this.TransferFee = new TokenBalance(Number(metaData['fee']), this.Decimals);
      this.Logo = metaData['logo'];

      if (alsoSetCanisterId == true){
        this.CanisterId = metaData['canisterId'];
      }
      console.log(this.Name);
      console.log(this.Symbol);
      console.log(this.Decimals);
      console.log(this.TransferFee);
      //console.log(this.Logo);
    }

  }

  async UserIdentityChanged(provider, principal){
    this.ResetAfterUserIdentityChanged();  
        
    console.log("in user identoy changed (tokeninfos) for cnaister-id: " + this.CanisterId);
    if (this.CanisterId == null) {
      return;
    }
    
    switch (this.SpecifiedTokenInterfaceType) {

      case SpecifiedTokenInterfaceType.Dip20Sli:
      case SpecifiedTokenInterfaceType.Dip20Glds: {        
        this.TokenActor = new Dip20TokenActorFetcher();        
        await this.TokenActor.Init(provider, principal, this.CanisterId);        
      }
        break;

      case SpecifiedTokenInterfaceType.Icrc1Glds:
      case SpecifiedTokenInterfaceType.Icrc1Sli: {        
        this.TokenActor = new Icrc1TokenActorFetcher();        
        await this.TokenActor.Init(provider, principal, this.CanisterId);        
      }
        break;
      default: return;
    }

    await this.UpdateMetaInfos();

  };

  async UpdateBalances(){



  }

  // async UpdateAll(provider, principal) {
  //   await this.UserIdentityChanged();


  //   await this.#UpdateAllInternal();

  // };

  async #UpdateAllInternal() {

    try {

      //this.BalanceInUserWallet = await this.TokenActor.GetBalance();      
      //let metaData = await this.TokenActor.GetMetadata();                  
    }
    catch (error) {
      console.log(error);
    }


  };


  //Reset all, except CanisterId and TokenInterfaceType
  Reset() {
    this.BalanceInUserWallet.Reset();
    this.TotalBalanceDepositedInsideSwapApp.Reset();
    this.TransferFee.Reset();
    this.Name = "";
    this.Symbol = "";
    this.Logo = null;
    this.TokenActor = null;
  }

  ResetAfterUserIdentityChanged() {
    this.TokenActor = null;
    this.BalanceInUserWallet.Reset();
    this.TotalBalanceDepositedInsideSwapApp.Reset();
  }

}

