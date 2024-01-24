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
import WalletsLib "../Modules/WalletsLib";
import TokensInfoLib "../Modules/TokensInfoLib";
import InitLib "../Modules/InitLib";
import CommonLib "../Modules/CommonLib";
import AdminLib "../Modules/AdminLib";
import SwapLib "../Modules/SwapLib";

shared ({ caller = creator }) actor class SliSwapApp() : async Interfaces.InterfaceSwapApp = this {

  stable var wasInitialized = false;
  stable var initializeTimerId = 0;

  stable var appSettings : T.AppSettings = InitLib.SwapAppInit(creator);
  stable var tokensInfo : T.TokensInfo = InitLib.TokensInfoInit();

  stable var sliApprovedWallets:T.ApprovedWallets = {
        var approvedWalletsFree:List.List<Principal> = List.nil<Principal>(); 
        var approvedWalletsInUse:List.List<Principal> = List.nil<Principal>();
  };

    stable var gldsApprovedWallets:T.ApprovedWallets = {
        var approvedWalletsFree:List.List<Principal> = List.nil<Principal>(); 
        var approvedWalletsInUse:List.List<Principal> = List.nil<Principal>();
  };

  stable var swapInfosSli:T.UsersSwapInfo = { items = StableTrieMap.new()};
  stable var swapInfosGlds:T.UsersSwapInfo = { items = StableTrieMap.new()};


  //-------------------------------------------------------------------------------
  //Swap related methods
  public shared query func GetSliSwapWalletForPrincipal(userPrincipal:Principal): async T.ResponseGetUsersSwapWallet{
    return SwapLib.getSwapWallet(userPrincipal, swapInfosSli);
  };

  public shared query func GetGldsSwapWalletForPrincipal(userPrincipal:Principal): async T.ResponseGetUsersSwapWallet{
    return SwapLib.getSwapWallet(userPrincipal, swapInfosGlds);
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
    return await* WalletsLib.AddNewApprovedWallet(caller, appSettings,sliApprovedWallets, principal );
  };

  //Returns the number of 'free and in-use' temporary Sli-swap wallets
  public shared query func GetNumberOfSliApprovedWallets(): async (Nat,Nat){
    return WalletsLib.GetNumberOfApprovedWallets(sliApprovedWallets);
  };

  
    // Only owner or admin are allowed to execute this method
  // This methods add's a new temporary swap-wallet principal 
  public shared ({ caller }) func AddNewApprovedGldsWallet(principal:Principal): async Result.Result<Text, Text>{
    return await* WalletsLib.AddNewApprovedWallet(caller, appSettings,gldsApprovedWallets, principal );
  };

  //Returns the number of 'free and in-use' temporary Glds-swap wallets
  public shared query func GetNumberOfGldsApprovedWallets(): async (Nat,Nat){
    return WalletsLib.GetNumberOfApprovedWallets(gldsApprovedWallets);
  };

  //Returns true if swap-wallet with provided principal in the method-parameter exist 
  public shared query func ApprovedWalletsPrincipalExist(principal:Principal): async Bool{
    return WalletsLib.ApprovedWalletsPrincipalExist(principal, sliApprovedWallets,gldsApprovedWallets);
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


  //  public shared ( callerMessage ) func Test(): async Result.Result<Text,Text>{

  //   let actorDip20 : Interfaces.InterfaceDip20 = actor ("zzriv-cqaaa-aaaao-a2gjq-cai");
  //   let val = await actorDip20.getAllowanceSize();
  //   //let pr = Principal.toText(callerMessage.caller);
  //   return #ok(Nat.toText(val));
  // };

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


  public shared func GetIcrc1Balance(canisterId:Principal): async Result.Result<Icrc1.Balance, Text>{
    
    let canisterIdText = Principal.toText(canisterId);
    let appPrincipalText = Principal.toText(Principal.fromActor(this));
    return await TokensInfoLib.IcrcGetBalance(canisterIdText, appPrincipalText);
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
