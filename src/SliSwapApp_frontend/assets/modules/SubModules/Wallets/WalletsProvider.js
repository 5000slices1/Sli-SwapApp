import { ConvertTokenInfo } from "../Token/ConvertTokenInfo";
import { TokenBalance } from "../Token/TokenBalance";
import { UsersIdentity } from "../Identity/UsersIdentity";

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
    this.SliConvertInfo = new ConvertTokenInfo();
    this.GldsConvertInfo = new ConvertTokenInfo();
    this.IcpBalance = new TokenBalance();
    this.Reset();
  };

  GetAllCanisterIds(){
    const idArray = [];
    if (this.SliConvertInfo?.SourceToken?.CanisterId !=null && this.SliConvertInfo?.SourceToken?.CanisterId.length > 0){
      idArray.push(this.SliConvertInfo.SourceToken.CanisterId);
    }
    if (this.SliConvertInfo?.TargetToken?.CanisterId !=null && this.SliConvertInfo?.TargetToken?.CanisterId.length > 0){
      idArray.push(this.SliConvertInfo.TargetToken.CanisterId);
    }

    if (this.GldsConvertInfo?.SourceToken?.CanisterId !=null && this.GldsConvertInfo?.SourceToken?.CanisterId.length > 0){
      idArray.push(this.GldsConvertInfo.SourceToken.CanisterId);
    }
    if (this.GldsConvertInfo?.TargetToken?.CanisterId !=null && this.GldsConvertInfo?.TargetToken?.CanisterId.length > 0){
      idArray.push(this.GldsConvertInfo.TargetToken.CanisterId);
    }    
    return idArray;
  };

  ResetAfterUserIdentityChanged() {
    this.UsersIdentity.Reset();
    this.SliConvertInfo.ResetAfterUserIdentityChanged();
    this.GldsConvertInfo.ResetAfterUserIdentityChanged();
    this.IcpBalance.Reset();
  };

  Reset() {
    this.UsersIdentity.Reset();
    this.SliConvertInfo.Reset();
    this.GldsConvertInfo.Reset();
    this.IcpBalance.Reset();
  };
}
;
