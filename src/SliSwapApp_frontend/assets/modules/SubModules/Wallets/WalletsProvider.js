// no @ts-check

import { ConvertTokenInfo } from "../Token/ConvertTokenInfo";
import { TokenBalance } from "../Token/TokenBalance";
import { UsersIdentity } from "../Identity/UsersIdentity";
import { PubSub } from "../../Utils/PubSub";
import { SpecifiedTokenInterfaceType } from "../../Types/CommonTypes";
import { SliSwapApp_backend } from "../../../../../declarations/SliSwapApp_backend";
import { GetTokensInfos } from "../../Utils/CommonUtils";
export class WalletsProvider {

  //Users logged in identity provider information
  UsersIdentity;

  //Sli token convert information
  SliConvertInfo;

  //Glds token convert information
  GldsConvertInfo;

  //Balance of users Icp (Dont know if we need this...)
  IcpBalance;

  constructor() {
   
    this.UsersIdentity = new UsersIdentity();
    this.SliConvertInfo = new ConvertTokenInfo(SpecifiedTokenInterfaceType.Dip20Sli, SpecifiedTokenInterfaceType.Icrc1Sli);
    this.GldsConvertInfo = new ConvertTokenInfo(SpecifiedTokenInterfaceType.Dip20Glds, SpecifiedTokenInterfaceType.Icrc1Glds);
    this.IcpBalance = new TokenBalance();
    //this.Reset();

    PubSub.unsubscribe('WalletsProvider_UpdateAllWalletBalances_Started');

    PubSub.subscribe('WalletsProvider_UpdateAllWalletBalances_Started',
      'UpdateAllWalletBalances_Started', this.UpdateAllWalletBalances);
  };


  /**
   * @param {typeof SpecifiedTokenInterfaceType} specifiedTokenInterface
   */
  async GetToken(specifiedTokenInterface) {

    switch (specifiedTokenInterface) {
      case SpecifiedTokenInterfaceType.Dip20Sli: return this.SliConvertInfo.SourceToken;
      case SpecifiedTokenInterfaceType.Dip20Glds: return this.GldsConvertInfo.SourceToken;

      case SpecifiedTokenInterfaceType.Icrc1Sli: return this.SliConvertInfo.TargetToken;
      case SpecifiedTokenInterfaceType.Icrc1Glds: return this.GldsConvertInfo.TargetToken;
    }
  
  };

  //MetaData + canisterId of the tokens are updated
  async UpdateTokenInfos() {
    let tokenInfos = await GetTokensInfos();
    await this.SliConvertInfo.UpdateTokensInfos(tokenInfos.Dip20_Sli, tokenInfos.Icrc1_Sli);
    await this.GldsConvertInfo.UpdateTokensInfos(tokenInfos.Dip20_Glds, tokenInfos.Icrc1_Glds);
  };

  async UserIdentityChanged(provider, principal) {
    await this.SliConvertInfo.UserIdentityChanged(provider, principal);
    await this.GldsConvertInfo.UserIdentityChanged(provider, principal);

  }

  GetAllCanisterIds() {
    const idArray = [];
    if (this.SliConvertInfo?.SourceToken?.CanisterId != null && this.SliConvertInfo?.SourceToken?.CanisterId.length > 0) {
      idArray.push(this.SliConvertInfo.SourceToken.CanisterId);
    }
    if (this.SliConvertInfo?.TargetToken?.CanisterId != null && this.SliConvertInfo?.TargetToken?.CanisterId.length > 0) {
      idArray.push(this.SliConvertInfo.TargetToken.CanisterId);
    }

    if (this.GldsConvertInfo?.SourceToken?.CanisterId != null && this.GldsConvertInfo?.SourceToken?.CanisterId.length > 0) {
      idArray.push(this.GldsConvertInfo.SourceToken.CanisterId);
    }
    if (this.GldsConvertInfo?.TargetToken?.CanisterId != null && this.GldsConvertInfo?.TargetToken?.CanisterId.length > 0) {
      idArray.push(this.GldsConvertInfo.TargetToken.CanisterId);
    }
    return idArray;
  };

  UpdateAllWalletBalances() {

    try {


    }
    finally {

      PubSub.publish('UpdateAllWalletBalances_Completed', null);
    }

  }

  ResetAfterUserIdentityChanged() {
    this.UsersIdentity.Reset();
    this.SliConvertInfo.ResetAfterUserIdentityChanged();
    this.GldsConvertInfo.ResetAfterUserIdentityChanged();
    this.IcpBalance.Reset();
  };

  // Reset() {
  //   this.UsersIdentity.Reset();
  //   this.SliConvertInfo.Reset();
  //   this.GldsConvertInfo.Reset();
  //   this.IcpBalance.Reset();
  // };
};
