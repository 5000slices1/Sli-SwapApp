import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Result "mo:base/Result";
import List "mo:base/List";
import Text "mo:base/Text";
import T "../Types/TypesCommon";
import Interfaces "../Interfaces/Interfaces";
import TypesCommon "../Types/TypesCommon";
import Icrc1 "../Types/TypesICRC1";
import Error "mo:base/Error";
import StableTrieMap "mo:StableTrieMap";
import { setTimer; recurringTimer; cancelTimer } = "mo:base/Timer";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import WalletsLib "../Modules/WalletsLib";
import TokensInfoLib "../Modules/TokensInfoLib";
import InitLib "../Modules/InitLib";
import CommonLib "../Modules/CommonLib";
import AdminLib "../Modules/AdminLib";
import SwapLib "../Modules/SwapLib";


shared ({ caller = creator }) actor class SliSwapApp() : async Interfaces.InterfaceSwapApp = this {

  stable var wasInitialized = false;
  stable var initializeTimerId = 0;

  stable let appSettings : T.AppSettings = InitLib.SwapAppInit(creator);
  stable let tokensInfo : T.TokensInfo = InitLib.TokensInfoInit();

  stable let commonData:T.CommonData = InitLib.InitCommonData();
  

  //-------------------------------------------------------------------------------
  //Swap related methods

   
  public shared query ({ caller }) func GetUserIdForSli(): async  Result.Result<Blob, Text>{
    return SwapLib.GetUserId(caller,commonData.sliData.swapInfo );
  };

  public shared query ({ caller }) func GetUserIdForGlds(): async  Result.Result<Blob, Text>{
    return SwapLib.GetUserId(caller,commonData.gldsData.swapInfo);
  };

 
  public shared func ConvertOldSliDip20Tokens(userId:Blob): async  Result.Result<Text, Text>{
    
    let appPrincpal:Principal = Principal.fromActor(this);
    return await* SwapLib.ConvertOldDip20Tokens(userId,commonData.sliData,tokensInfo.Dip20_Sli.canisterId,
     tokensInfo.Dip20_Sli.fee, tokensInfo.Icrc1_Sli.canisterId,appPrincpal);
     
  };

    public shared func ConvertOldGldsDip20Tokens(userId:Blob): async  Result.Result<Text, Text>{
    
    let appPrincpal:Principal = Principal.fromActor(this);

    return await* SwapLib.ConvertOldDip20Tokens(userId,commonData.gldsData,tokensInfo.Dip20_Glds.canisterId,
     tokensInfo.Dip20_Glds.fee, tokensInfo.Icrc1_Glds.canisterId,appPrincpal);         
  };
    
  public shared query func GetSliSwapWalletForPrincipal(userPrincipal:Principal): async T.ResponseGetUsersSwapWallet{
    return SwapLib.getSwapWallet(userPrincipal, commonData.sliData.swapInfo);
  };

  public shared query func GetGldsSwapWalletForPrincipal(userPrincipal:Principal): async T.ResponseGetUsersSwapWallet{   
   return SwapLib.getSwapWallet(userPrincipal, commonData.gldsData.swapInfo);
  };

  public shared ({ caller }) func GetSliDip20DepositedAmount(): async  Result.Result<Nat, Text>{

    let dip20CanisterIdText = tokensInfo.Dip20_Sli.canisterId;
    let dip20Fee = tokensInfo.Dip20_Sli.fee;
    let result = await* SwapLib.GetDip20DepositedAmount(caller, dip20CanisterIdText,commonData.sliData.swapInfo, dip20Fee);
    switch(result){
      case (#ok(amount)){
        return #ok(amount.0);
      };
      case (_){
        return #err("Could not get the amount.");
      };
    };

  };

   public shared ({ caller }) func GetGldsDip20DepositedAmount(): async  Result.Result<Nat, Text>{

    let dip20CanisterIdText = tokensInfo.Dip20_Glds.canisterId;
    let dip20Fee = tokensInfo.Dip20_Glds.fee;    
    let result = await* SwapLib.GetDip20DepositedAmount(caller, dip20CanisterIdText,commonData.gldsData.swapInfo, dip20Fee);
    switch(result){
      case (#ok(amount)){
        return #ok(amount.0);
      };
      case (_){
        return #err("Could not get the amount.");
      };
    };
  };


  public shared query func CanUserDepositSliDip20(principal:Principal): async Result.Result<Text,Text> {

    let result: (Bool, Result.Result<Text,Text>) = SwapLib.CanUserDepositDip20(principal, commonData.sliData );
    if (result.0 == true){
      return #ok("Deposit is possible");
    } else {
      return result.1;
    };
  };

  public shared query func CanUserDepositGldsDip20(principal:Principal):  async Result.Result<Text,Text>  {

    let result: (Bool, Result.Result<Text,Text>) = SwapLib.CanUserDepositDip20(principal, commonData.gldsData);
     if (result.0 == true){
      return #ok("Deposit is possible");
    } else{
      return result.1;
    };
  };
  
  public shared func DepositSliDip20Tokens(principal:Principal, amount:Nat): async Result.Result<Text, Text>{

    let swapAppPrincipal:Principal = Principal.fromActor(this);
    let dip20CanisterIdText = tokensInfo.Dip20_Sli.canisterId;
    let dip20Fee = tokensInfo.Dip20_Sli.fee;
    let result = await* SwapLib.DepositDip20Tokens(
      principal,dip20CanisterIdText,swapAppPrincipal,
      commonData.sliData,amount, dip20Fee
    );
    return result;
  
  };

   public shared func DepositGldsDip20Tokens(principal:Principal, amount:Nat): async Result.Result<Text, Text>{

    let swapAppPrincipal:Principal = Principal.fromActor(this);
    let dip20CanisterIdText = tokensInfo.Dip20_Glds.canisterId;
    let dip20Fee = tokensInfo.Dip20_Glds.fee;  
    let result = await* SwapLib.DepositDip20Tokens(
      principal,dip20CanisterIdText,swapAppPrincipal,
      commonData.gldsData,amount, dip20Fee
    );

    return result;
  };


  //-------------------------------------------------------------------------------



  //Returns the current user-role
  public shared query ({ caller }) func GetUserRole() : async T.UserRole {
    return CommonLib.GetUserRole(appSettings, caller);
  };

  //Returns the principal (==canisterId) of this dApp
  public shared query func GetSwapAppPrincipalText() : async Text {
    let principal : Principal = Principal.fromActor(this);
    return Principal.toText(principal);
  };

  // Only owner or admin are allowed to execute this method
  // This methods add's a new temporary swap-wallet principal 
  public shared ({ caller }) func AddNewApprovedSliWallet(principal:Principal): async Result.Result<Text, Text>{
    return await* WalletsLib.AddNewApprovedWallet(caller, appSettings,commonData.sliData.approvedWallets, principal );
  };

  //Returns the number of 'free and in-use' temporary Sli-swap wallets
  public shared query func GetNumberOfSliApprovedWallets(): async (Nat,Nat){
    return WalletsLib.GetNumberOfApprovedWallets(commonData.sliData.approvedWallets);
  };

    // Only owner or admin are allowed to execute this method
  // This methods add's a new temporary swap-wallet principal 
  public shared ({ caller }) func AddNewApprovedGldsWallet(principal:Principal): async Result.Result<Text, Text>{
    return await* WalletsLib.AddNewApprovedWallet(caller, appSettings,commonData.gldsData.approvedWallets, principal );
  };

  //Returns the number of 'free and in-use' temporary Glds-swap wallets
  public shared query func GetNumberOfGldsApprovedWallets(): async (Nat,Nat){
    return WalletsLib.GetNumberOfApprovedWallets(commonData.gldsData.approvedWallets);
  };

  //Returns true if swap-wallet with provided principal in the method-parameter exist 
  public shared query func ApprovedWalletsPrincipalExist(principal:Principal): async Bool{
    return WalletsLib.ApprovedWalletsPrincipalExist(principal, 
    commonData.sliData.approvedWallets, commonData.gldsData.approvedWallets);
  };

  //------------------------------------------------------------------------------
  //Sli related

  //Returns the target token (sli-icrc1) canister Id
  public shared query func SliIcrc1_GetCanisterId() : async Text {
    return tokensInfo.Icrc1_Sli.canisterId;
  };

  //Get the current transfer-fee for sli-icrc1 transfers initiated from/to the Swapapp-canisterId
  //If this swapApp-canisterId is fee-whitelisted by Icrc1 token when the fee returned should be 0.0
  public shared func SliIcrc1_GetCurrentTransferFee() : async Result.Result<Icrc1.Balance, Text> {
    let canisterId = tokensInfo.Icrc1_Sli.canisterId;
    return await TokensInfoLib.IcrcGetCurrentTransferFee(canisterId);
  };

  //Get the current sli-icrc1 total supply
  public shared func SliIcrc1_GetCurrentTotalSupply() : async Result.Result<Icrc1.Balance, Text> {
    let canisterId = tokensInfo.Icrc1_Sli.canisterId;
    return await TokensInfoLib.IcrcGetCurrentTotalSupply(canisterId);
  };

  //Set the sli-icrc1-canisterId for the token that should be transfered to users during the conversion process
  //The token-Metadata is automatically retrieved and stored after the canister-id was set.
  public shared ({ caller }) func SliIcrc1_SetCanisterId(canisterId : Principal) : async Result.Result<Text, Text> {
    let principalText:Text = Principal.toText(canisterId);
    var result = await* TokensInfoLib.SliIcrc1_SetCanisterId(caller, appSettings, tokensInfo, principalText);
    return result;
  };

  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  //Glds related

  //Returns the target token (glds-icrc1) canister Id
  public shared query func GldsIcrc1_GetCanisterId() : async Text {
    return tokensInfo.Icrc1_Glds.canisterId;
  };

  //Get the current transfer-fee for sli-icrc1 transfers initiated from/to the Swapapp-canisterId
  //If this swapApp-canisterId is fee-whitelisted by Icrc1 token when the fee returned should be 0.0
  public shared func GldsIcrc1_GetCurrentTransferFee() : async Result.Result<Icrc1.Balance, Text> {
    let canisterId = tokensInfo.Icrc1_Glds.canisterId;
    return await TokensInfoLib.IcrcGetCurrentTransferFee(canisterId);
  };

  //Get the current glds-icrc1 total supply
  public shared func GldsIcrc1_GetCurrentTotalSupply() : async Result.Result<Icrc1.Balance, Text> {
    let canisterId = tokensInfo.Icrc1_Glds.canisterId;
    return await TokensInfoLib.IcrcGetCurrentTotalSupply(canisterId);
  };

  //Set the glds-icrc1-canisterId for the token that should be transfered to users during the conversion process
  //The token-Metadata is automatically retrieved and stored after the canister-id was set.
  public shared ({ caller }) func GldsIcrc1_SetCanisterId(canisterId : Principal) : async Result.Result<Text, Text> {
     let principalText:Text = Principal.toText(canisterId);
    return await* TokensInfoLib.GldsIcrc1_SetCanisterId(caller, appSettings, tokensInfo, principalText);
  };

  //------------------------------------------------------------------------------

  //Only the owner can call this method
  public shared ({ caller }) func AddAdminUser(principal : Principal) : async Result.Result<Text, Text> {
    let principalText = Principal.toText(principal);
    return await* AdminLib.AddAdminUser(caller, appSettings, principalText);
  };

 //Only the owner can call this method
  public shared ({ caller }) func RemoveAdminUser(principal : Principal) : async Result.Result<Text, Text> {
    let principalText = Principal.toText(principal);
    return await* AdminLib.RemoveAdminUser(caller, appSettings, principalText);
  };

  public shared query func GetListOfAdminUsers() : async [Text] {
    return AdminLib.GetListOfAdminUsers(appSettings);
  };


  //Get Balance from App-Wallet main account (default subaccount (==null) is used)
  public shared func GetIcrc1Balance(canisterId:Principal): async Result.Result<Icrc1.Balance, Text>{
    
    let canisterIdText = Principal.toText(canisterId);
    let appPrincipalText = Principal.toText(Principal.fromActor(this));
    return await* TokensInfoLib.IcrcGetBalance(canisterIdText, appPrincipalText, null);
  };

  //Get token information about the source and target tokens (dip20, icrc1)
  public shared query func GetTokensInfos() : async T.TokensInfoAsResponse {
    return TokensInfoLib.GetTokensInfos(tokensInfo);
  };



  private func InitTokenMetaDatas() : async () {

    try {
      ignore await* TokensInfoLib.SetTokenMetaDataByCanisterId(appSettings, tokensInfo, #Dip20Sli, "zzriv-cqaaa-aaaao-a2gjq-cai", creator);
      ignore await* TokensInfoLib.SetTokenMetaDataByCanisterId(appSettings, tokensInfo, #Dip20Glds, "7a6j3-uqaaa-aaaao-a2g5q-cai", creator);
      cancelTimer(initializeTimerId);
      wasInitialized := true;

    } catch (error) {
      //do nothing...
    };

  };

  wasInitialized := false;
  if (wasInitialized == false) {
    initializeTimerId := setTimer(
      #seconds 1,
      func() : async () {
        await InitTokenMetaDatas();
      },
    );
  };

  system func inspect(args : { caller : Principal; arg : Blob }) : Bool {
    let caller = args.caller;
    let msgArg = args.arg;

    //Set max allowed passed argument size to 1024 bytes,
    if (msgArg.size() > 1024) { return false };
    return true;
  };

};
