import { TokenInfo } from "./TokenInfo";

export class ConvertTokenInfo {

  //Token that the user will deposit into swap-app. (Example sli-Dip20, glds-Dip20)
  SourceToken;

  //The token that will be send to users wallet, after depositing the 'SourceToken' 
  TargetToken;

  constructor(sourceTokenType, targetTockenType) {

    this.SourceToken = new TokenInfo(sourceTokenType);
    this.TargetToken = new TokenInfo(targetTockenType);
  };

  async UpdateTokensInfos(sourceToken_TokenInfo, targetToken_TokenInfo){
    await this.SourceToken.UpdateTokenInfo(sourceToken_TokenInfo);
    await this.TargetToken.UpdateTokenInfo(targetToken_TokenInfo);
  };

  async UserIdentityChanged(provider, principal){
    await this.SourceToken.UserIdentityChanged(provider, principal);
    await this.TargetToken.UserIdentityChanged(provider, principal);

  }

  Reset() {
    this.SourceToken.Reset();
    this.TargetToken.Reset();
  }

  ResetAfterUserIdentityChanged() {
    this.SourceToken.ResetAfterUserIdentityChanged();
    this.TargetToken.ResetAfterUserIdentityChanged();
  }

};
