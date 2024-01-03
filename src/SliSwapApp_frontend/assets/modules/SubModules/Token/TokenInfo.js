import { TokenBalance } from "./TokenBalance";
import { TokenInterfaceType } from "../../Types/CommonTypes";
import { Dip20TokenActorFetcher } from "../ActorFetchers/Dip20TokenActorFetcher";
import { Icrc1TokenActorFetcher } from "../ActorFetchers/Icrc1TokenActorFetcher";

export class TokenInfo {

  Name;
  Symbol;
  Icon;
  TransferFee;
  CanisterId;
  TokenActor;
  TokenInterfaceType;

  //Token amount of logged in users wallet
  BalanceInUserWallet;

  //Total-Balance consist of all deposit-transfers into the dApp wallet from user-Wallet
  //p.s. For each deposit into swap-app, a separate created deposit-wallet will be used. 
  // Therefore we need to track the total deposited amount
  TotalBalanceDepositedInsideSwapApp;

  constructor() {

    this.BalanceInUserWallet = new TokenBalance();
    this.TotalBalanceDepositedInsideSwapApp = new TokenBalance();
    this.TransferFee = new TokenBalance();
    this.Reset();    
  };

  async Init(canisterId,tokenInterfaceType ){
    this.CanisterId = canisterId;    
    this.TokenInterfaceType = tokenInterfaceType;
  };

  async UpdateAll(provider, principal) {

    this.Reset();    
    if (this.CanisterId == null) {
      return;
    }
    
    switch (this.TokenInterfaceType) {

      case TokenInterfaceType.Dip20: {
        this.TokenActor = new Dip20TokenActorFetcher();
        await this.TokenActor.Init(provider, principal, this.CanisterId);
      }
        break;

      case TokenInterfaceType.Icrc1: {
        this.TokenActor = new Icrc1TokenActorFetcher();
        await this.TokenActor.Init(provider, principal, this.CanisterId);
      }
        break;
      default: return;
    }
    
    await this.#UpdateAllInternal();

  };

  async #UpdateAllInternal(){

    try{
      
      this.BalanceInUserWallet = await this.TokenActor.GetBalance();      
      let metaData = await this.TokenActor.GetMetadata();                  
    }
    catch(error){
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
    this.Icon = null;
    this.TokenActor = null;    
  }

  ResetAfterUserIdentityChanged() {
    this.TokenActor = null;    
    this.BalanceInUserWallet.Reset();
    this.TotalBalanceDepositedInsideSwapApp.Reset();
  }

}

