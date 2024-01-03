import { TokenInfo } from "./TokenInfo";

export class ConvertTokenInfo {

  //Token that the user will deposit into swap-app. (Example sli-Dip20, glds-Dip20)
  SourceToken;

  //The token that will be send to users wallet, after depositing the 'SourceToken' 
  TargetToken;

  constructor() {

    this.SourceToken = new TokenInfo();
    this.TargetToken = new TokenInfo();
  };

  Reset() {
    this.SourceToken.Reset();
    this.TargetToken.Reset();
  }

  ResetAfterUserIdentityChanged() {
    this.SourceToken.ResetAfterUserIdentityChanged();
    this.TargetToken.ResetAfterUserIdentityChanged();
  }

};
