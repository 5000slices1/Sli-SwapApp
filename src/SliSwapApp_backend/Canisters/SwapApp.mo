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
import Cycles "mo:base/ExperimentalCycles";
import InterfaceHistoryCanister "../Interfaces/InterfaceHistoryCanister";
import Archive "../Actors/Archive";
import TrabyterTokenInterface "../Interfaces/InterfaceTrabyter";
import Icrc2Interface "../Interfaces/InterfaceICRC2";
import InterfaceIcrc2 "../Interfaces/InterfaceICRC2";
import InterfaceIcrc1 "../Interfaces/InterfaceICRC1";

shared ({ caller = creator }) actor class SliSwapApp() : async Interfaces.InterfaceSwapApp = this {

  stable var wasInitialized : Bool = false;
  stable var initializeTimerId : Nat = 0;
  stable var backgroundActivitiesTimerId : Nat = 1;
  stable let backgroundActivitesTimerTickSeconds : Nat = 24 * 60 * 60; //daily

  stable let appSettings : T.AppSettings = InitLib.SwapAppInit(creator);
  stable let tokensInfo : T.TokensInfo = InitLib.TokensInfoInit();

  stable let commonData : T.CommonData = InitLib.InitCommonData();

  stable let archive : InterfaceHistoryCanister.ArchiveData = {
    var canister : InterfaceHistoryCanister.InterfaceArchive = actor ("aaaaa-aa");
  };

  stable var archiveCanisterId : Principal = Principal.fromText("aaaaa-aa");
  stable var archiveCanisterIdWasSet : Bool = false;
  stable var setCanisterIdIsLocked : Bool = false;
  stable var burningAllowedPrincipal:Principal = Principal.fromText("aaaaa-aa");
  
  stable let minimumCycles : Nat = 4_000_000_000;
  stable let archiveTopUpCyclesAmount : Nat = 1_000_000_000;
  stable let minimumAboveThresholdNeeded : Nat = 1_000_000;
  stable var swapAppPrincipal = Principal.fromText("aaaaa-aa");
  stable var burning_allowances_was_set : Bool = false;

  //Only for debugging purposes these should be set directly
  //archiveCanisterIdWasSet:=false;

  //-------------------------------------------------------------------------------
  //Swap related methods

  public shared query ({ caller }) func GetUserIdForSli() : async Result.Result<Blob, Text> {

    return SwapLib.GetUserId(caller, commonData.sliData.swapInfo);
  };

  public shared query ({ caller }) func GetUserIdForGlds() : async Result.Result<Blob, Text> {

    return SwapLib.GetUserId(caller, commonData.gldsData.swapInfo);
  };

  public shared func ConvertOldSliDip20Tokens(userId : Blob) : async Result.Result<Text, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let appPrincpal : Principal = Principal.fromActor(this);
    return await* SwapLib.ConvertOldDip20Tokens(
      userId,
      commonData.sliData,
      tokensInfo.Dip20_Sli.canisterId,
      tokensInfo.Dip20_Sli.fee,
      tokensInfo.Icrc1_Sli.canisterId,
      appPrincpal,
      archive,
      #Dip20Sli,
    );

  };

  public shared func ConvertOldGldsDip20Tokens(userId : Blob) : async Result.Result<Text, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };

    let appPrincpal : Principal = Principal.fromActor(this);

    return await* SwapLib.ConvertOldDip20Tokens(
      userId,
      commonData.gldsData,
      tokensInfo.Dip20_Glds.canisterId,
      tokensInfo.Dip20_Glds.fee,
      tokensInfo.Icrc1_Glds.canisterId,
      appPrincpal,
      archive,
      #Dip20Glds,
    );
  };

  public shared ({ caller }) func add_burning_allowed_principal(principal : Principal) : async Result.Result<Text, Text> {
    
    Debug.print("add_burning_allowed_principal");
    if (caller != appSettings.SwapAppCreator) {
        return #err("Only canister owner can call this method");
    };

    burningAllowedPrincipal := principal;    
    return #ok("Burning principal set to: " # debug_show(burningAllowedPrincipal));
  };

  public shared func add_burning_allowances(): async Result.Result<[Icrc2Interface.ApproveResult],Text>{

      if (burning_allowances_was_set == true){
        return #err("Burning allowances already set.");
      };

      //Debug.print("add_burning_allowances");
      let defaultCanisterId = Principal.fromText("aaaaa-aa"); 
      if (burningAllowedPrincipal == defaultCanisterId) {
        return #err("Burning principal not set");
      };
      //Debug.print("add_burning_allowances. Still here.");

      //Debug.print("burningAllowedPrincipal");
      //Debug.print(debug_show(burningAllowedPrincipal));

      let sli_canisterId = tokensInfo.Icrc1_Sli.canisterId;
      let glds_canisterId = tokensInfo.Icrc1_Glds.canisterId;
      //Debug.print("sli_canisterId");
      //Debug.print(debug_show(sli_canisterId));
      //Debug.print("glds_canisterId");
      //Debug.print(debug_show(glds_canisterId));

      let actorTrabyter : TrabyterTokenInterface.TrabyterTokenInterface = actor (sli_canisterId);
      let actorTrabyterPremium : TrabyterTokenInterface.TrabyterTokenInterface = actor (glds_canisterId);
 
      let approveArgs:Icrc2Interface.ApproveArgs = {
        from_subaccount : ?Icrc1.Subaccount = null;        
        spender : Icrc1.Account = { owner = burningAllowedPrincipal; subaccount = null; };    
        amount : Icrc1.Balance = 500000000000;      
        expected_allowance : ?Nat = null;
        expires_at : ?Nat64 = null;
        fee : ?Icrc1.Balance= null;
        memo : ?InterfaceIcrc2.Memo= null;
        created_at_time : ?Nat64= null;
    };

        
      let firstApproveResult:Icrc2Interface.ApproveResult = 
        await actorTrabyter.icrc2_approve(approveArgs);
      let secondApproveResult:Icrc2Interface.ApproveResult = 
        await actorTrabyterPremium.icrc2_approve(approveArgs);

      burning_allowances_was_set:=true;
      return #ok([firstApproveResult, secondApproveResult]);

      //let firstApproveResult:Icrc2Interface.ApproveResult = 
      //  await actorTrabyter.icrc2_approve(approveArgs);
      // let secondApproveResult:Icrc2Interface.ApproveResult = 
      //   await actorTrabyterPremium.icrc2_approve(approveArgs);

      //return #ok([firstApproveResult, firstApproveResult]);


  };

  public shared query func GetSliSwapWalletForPrincipal(userPrincipal : Principal) : async T.ResponseGetUsersSwapWallet {

    return SwapLib.getSwapWallet(userPrincipal, commonData.sliData.swapInfo);
  };

  public shared query func GetGldsSwapWalletForPrincipal(userPrincipal : Principal) : async T.ResponseGetUsersSwapWallet {

    return SwapLib.getSwapWallet(userPrincipal, commonData.gldsData.swapInfo);
  };

  public shared ({ caller }) func GetSliDip20DepositedAmount() : async Result.Result<Nat, Text> {

    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let dip20CanisterIdText = tokensInfo.Dip20_Sli.canisterId;
    let dip20Fee = tokensInfo.Dip20_Sli.fee;
    let result = await* SwapLib.GetDip20DepositedAmount(caller, dip20CanisterIdText, commonData.sliData.swapInfo, dip20Fee);
    switch (result) {
      case (#ok(amount)) {
        return #ok(amount.0);
      };
      case (_) {
        return #err("Could not get the amount.");
      };
    };

  };

  public shared ({ caller }) func GetGldsDip20DepositedAmount() : async Result.Result<Nat, Text> {

    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let dip20CanisterIdText = tokensInfo.Dip20_Glds.canisterId;
    let dip20Fee = tokensInfo.Dip20_Glds.fee;
    let result = await* SwapLib.GetDip20DepositedAmount(caller, dip20CanisterIdText, commonData.gldsData.swapInfo, dip20Fee);
    switch (result) {
      case (#ok(amount)) {
        return #ok(amount.0);
      };
      case (_) {
        return #err("Could not get the amount.");
      };
    };
  };

  public shared query func CanUserDepositSliDip20(principal : Principal) : async Result.Result<Text, Text> {

    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let result : (Bool, Result.Result<Text, Text>) = SwapLib.CanUserDepositDip20(principal, commonData.sliData);
    if (result.0 == true) {
      return #ok("Deposit is possible");
    } else {
      return result.1;
    };
  };

  public shared query func CanUserDepositGldsDip20(principal : Principal) : async Result.Result<Text, Text> {

    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let result : (Bool, Result.Result<Text, Text>) = SwapLib.CanUserDepositDip20(principal, commonData.gldsData);
    if (result.0 == true) {
      return #ok("Deposit is possible");
    } else {
      return result.1;
    };
  };

  public shared func DepositSliDip20Tokens(principal : Principal, amount : Nat) : async Result.Result<Text, Text> {

    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };

    let swapAppPrincipal : Principal = Principal.fromActor(this);
    let dip20CanisterIdText = tokensInfo.Dip20_Sli.canisterId;
    let dip20Fee = tokensInfo.Dip20_Sli.fee;
    let result = await* SwapLib.DepositDip20Tokens(
      principal,
      dip20CanisterIdText,
      swapAppPrincipal,
      commonData.sliData,
      amount,
      dip20Fee,
      archive,
      #Dip20Sli,
    );
    return result;

  };

  public shared func DepositGldsDip20Tokens(principal : Principal, amount : Nat) : async Result.Result<Text, Text> {

    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };

    let swapAppPrincipal : Principal = Principal.fromActor(this);
    let dip20CanisterIdText = tokensInfo.Dip20_Glds.canisterId;
    let dip20Fee = tokensInfo.Dip20_Glds.fee;
    let result = await* SwapLib.DepositDip20Tokens(
      principal,
      dip20CanisterIdText,
      swapAppPrincipal,
      commonData.gldsData,
      amount,
      dip20Fee,
      archive,
      #Dip20Glds,
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
  public shared ({ caller }) func AddNewApprovedSliWallet(principal : Principal) : async Result.Result<Text, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    return WalletsLib.AddNewApprovedWallet(caller, appSettings, commonData.sliData.approvedWallets, principal);
  };

  //Returns the number of 'free and in-use' temporary Sli-swap wallets
  public shared query func GetNumberOfSliApprovedWallets() : async (Nat, Nat) {

    return WalletsLib.GetNumberOfApprovedWallets(commonData.sliData.approvedWallets);
  };

  // Only owner or admin are allowed to execute this method
  // This methods add's a new temporary swap-wallet principal
  public shared ({ caller }) func AddNewApprovedGldsWallet(principal : Principal) : async Result.Result<Text, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    return WalletsLib.AddNewApprovedWallet(caller, appSettings, commonData.gldsData.approvedWallets, principal);
  };

  //Returns the number of 'free and in-use' temporary Glds-swap wallets
  public shared query func GetNumberOfGldsApprovedWallets() : async (Nat, Nat) {
    return WalletsLib.GetNumberOfApprovedWallets(commonData.gldsData.approvedWallets);
  };

  //Returns true if swap-wallet with provided principal in the method-parameter exist
  public shared query func ApprovedWalletsPrincipalExist(principal : Principal) : async Bool {
    return WalletsLib.ApprovedWalletsPrincipalExist(
      principal,
      commonData.sliData.approvedWallets,
      commonData.gldsData.approvedWallets,
    );
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

    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let canisterId = tokensInfo.Icrc1_Sli.canisterId;
    return await TokensInfoLib.IcrcGetCurrentTransferFee(canisterId);
  };

  //Get the current sli-icrc1 total supply
  public shared func SliIcrc1_GetCurrentTotalSupply() : async Result.Result<Icrc1.Balance, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let canisterId = tokensInfo.Icrc1_Sli.canisterId;
    return await TokensInfoLib.IcrcGetCurrentTotalSupply(canisterId);
  };

  //Set the sli-icrc1-canisterId for the token that should be transfered to users during the conversion process
  //The token-Metadata is automatically retrieved and stored after the canister-id was set.
  public shared ({ caller }) func SliIcrc1_SetCanisterId(canisterId : Principal) : async Result.Result<Text, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let principalText : Text = Principal.toText(canisterId);
    var result = await* TokensInfoLib.SliIcrc1_SetCanisterId(caller, appSettings, tokensInfo, principalText);
    return result;
  };

  public shared ({caller}) func SliIcrc1_BurnTokens(amount : InterfaceIcrc2.Balance) 
    : async Result.Result<(InterfaceIcrc2.TransferFromResponse,
            Icrc1.TransferResult),Text> {

    if (caller != burningAllowedPrincipal) {
      return #err("Only burning principal can call this method");
    };

    let swapAppPrincipal : Principal = Principal.fromActor(this);
    
    let sli_canisterId = tokensInfo.Icrc1_Sli.canisterId;      
    let actorTrabyter : TrabyterTokenInterface.TrabyterTokenInterface = actor (sli_canisterId);
        
    let transfer_from_args:InterfaceIcrc2.TransferFromArgs = {     
        spender_subaccount :? Icrc1.Subaccount = null;       
        from : Icrc1.Account = { owner = swapAppPrincipal; subaccount = null; };
        to : Icrc1.Account = { owner = burningAllowedPrincipal; subaccount = null; };
        amount : Icrc1.Balance = amount;
        fee : ?Icrc1.Balance = null;
        memo : ?InterfaceIcrc2.Memo= null;
        created_at_time : ?Nat64= null;
      };
      
      // First we need to transfer
      let transferResult:InterfaceIcrc2.TransferFromResponse = 
        await actorTrabyter.icrc2_transfer_from(transfer_from_args);

      // Now burn
      let burnArgs:TrabyterTokenInterface.BurnArgs = {
        from_subaccount = null;
        amount = amount;
        memo = null;
        created_at_time = null;
      };


      let burnResult: Icrc1.TransferResult  = await actorTrabyter.burn(burnArgs);
      
      return #ok(transferResult, burnResult);
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
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let canisterId = tokensInfo.Icrc1_Glds.canisterId;
    return await TokensInfoLib.IcrcGetCurrentTransferFee(canisterId);
  };

  //Get the current glds-icrc1 total supply
  public shared func GldsIcrc1_GetCurrentTotalSupply() : async Result.Result<Icrc1.Balance, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let canisterId = tokensInfo.Icrc1_Glds.canisterId;
    return await TokensInfoLib.IcrcGetCurrentTotalSupply(canisterId);
  };

  //Set the glds-icrc1-canisterId for the token that should be transfered to users during the conversion process
  //The token-Metadata is automatically retrieved and stored after the canister-id was set.
  public shared ({ caller }) func GldsIcrc1_SetCanisterId(canisterId : Principal) : async Result.Result<Text, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let principalText : Text = Principal.toText(canisterId);
    return await* TokensInfoLib.GldsIcrc1_SetCanisterId(caller, appSettings, tokensInfo, principalText);
  };

  public shared ({caller}) func GldsIcrc1_BurnTokens(amount : Icrc1.Balance) 
    : async Result.Result<(InterfaceIcrc2.TransferFromResponse,
            Icrc1.TransferResult ),Text> {

    if (caller != burningAllowedPrincipal) {
      return #err("Only burning principal can call this method");
    };

    

    let glds_canisterId = tokensInfo.Icrc1_Sli.canisterId;      
    let actorTrabyter : TrabyterTokenInterface.TrabyterTokenInterface = actor (glds_canisterId);
      
     let swapAppPrincipal : Principal = Principal.fromActor(this);

    let transfer_from_args:InterfaceIcrc2.TransferFromArgs = {     
        spender_subaccount :? Icrc1.Subaccount = null;       
        from : Icrc1.Account = { owner = swapAppPrincipal; subaccount = null; };
        to : Icrc1.Account = { owner = burningAllowedPrincipal; subaccount = null; };
        amount : Icrc1.Balance = amount;
        fee : ?Icrc1.Balance = null;
        memo : ?InterfaceIcrc2.Memo= null;
        created_at_time : ?Nat64= null;
      };
      
      // First we need to transfer
      let transferResult:InterfaceIcrc2.TransferFromResponse = 
        await actorTrabyter.icrc2_transfer_from(transfer_from_args);

      // Now burn
      let burnArgs:TrabyterTokenInterface.BurnArgs = {
        from_subaccount = null;
        amount = amount;
        memo = null;
        created_at_time = null;
      };


      let burnResult:Icrc1.TransferResult  = await actorTrabyter.burn(burnArgs);
      
      return #ok(transferResult, burnResult);
  };  

  //------------------------------------------------------------------------------

  public shared ({ caller }) func set_changing_icrc1_canister_ids_to_locked_state() : async Result.Result<Text, Text> {
    let userIsOwnerOrAdmin = CommonLib.UserIsOwnerOrAdmin(appSettings, caller);
    if (userIsOwnerOrAdmin == false) {
      return #err("You need to be owner or admin.");
    };
    setCanisterIdIsLocked := true;
    return #ok("Ok. Settings the ICRC canisterId's is now locked.");

  };

  public shared query func changing_icrc1_canister_ids_has_locked_state() : async Bool {
    return setCanisterIdIsLocked == true;
  };

  //Only the owner can call this method
  public shared ({ caller }) func AddAdminUser(principal : Principal) : async Result.Result<Text, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let principalText = Principal.toText(principal);
    return await* AdminLib.AddAdminUser(caller, appSettings, principalText);
  };

  //Only the owner can call this method
  public shared ({ caller }) func RemoveAdminUser(principal : Principal) : async Result.Result<Text, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };
    let principalText = Principal.toText(principal);
    return await* AdminLib.RemoveAdminUser(caller, appSettings, principalText);
  };

  public shared query func GetListOfAdminUsers() : async [Text] {
    return AdminLib.GetListOfAdminUsers(appSettings);
  };

  //Get Balance from App-Wallet main account (default subaccount (==null) is used)
  public shared func GetIcrc1Balance(canisterId : Principal) : async Result.Result<Icrc1.Balance, Text> {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return #err("Not enough free Cycles available");
    };

    let canisterIdText = Principal.toText(canisterId);
    let appPrincipalText = Principal.toText(Principal.fromActor(this));
    return await* TokensInfoLib.IcrcGetBalance(canisterIdText, appPrincipalText, null);
  };

  //Get token information about the source and target tokens (dip20, icrc1)
  public shared query func GetTokensInfos() : async T.TokensInfoAsResponse {
    return TokensInfoLib.GetTokensInfos(tokensInfo);
  };

  // Deposit cycles into this canister.
  public shared func deposit_cycles() : async () {
    let amount = Cycles.available();
    let accepted = Cycles.accept<system>(amount);
    assert (accepted == amount);
  };

  public shared query func cycles_balance() : async Nat {
    Cycles.balance();
  };

  public shared func archive_cycles_balance() : async Nat {
    return await archive.canister.cycles_available();
  };

  public shared query ({ caller }) func archive_get_canisterId() : async Result.Result<Principal, Text> {
    let userIsOwnerOrAdmin = CommonLib.UserIsOwnerOrAdmin(appSettings, caller);
    if (userIsOwnerOrAdmin == false) {
      return #err("You need to be owner or admin.");
    };

    return #ok(archiveCanisterId);
  };

  public shared ({ caller }) func archive_set_canisterId(principal : Principal) : async Result.Result<Text, Text> {
    let userIsOwnerOrAdmin = CommonLib.UserIsOwnerOrAdmin(appSettings, caller);
    if (userIsOwnerOrAdmin == false) {
      return #err("You need to be owner or admin.");
    };

    if (archiveCanisterIdWasSet == true) {
      return #err("The archive canister ID was already set.");
    };

    //we also need to use this
    swapAppPrincipal := Principal.fromActor(this);

    let principalText : Text = Principal.toText(principal);
    archive.canister := actor (principalText);
    archiveCanisterId := principal;

    let swapAppCanisterId = Principal.fromActor(this);
    let result = await archive.canister.setSwapAppCanisterId(swapAppCanisterId);
    switch (result) {
      case (#ok(text)) {
        archiveCanisterIdWasSet := true;
        return result;
      };
      case (#err(text)) {
        return #err(text);
      };
    };
  };

  private func cycles_required_available() : Nat {
    let cycles : Nat = Cycles.balance();
    if (cycles < minimumCycles) {
      return 0;
    };

    let required_available : Nat = cycles - minimumCycles;
    return required_available;
  };

  private func initTokenMetaDatas() : async () {

    try {

      ignore await* TokensInfoLib.SetTokenMetaDataByCanisterId(appSettings, tokensInfo, #Dip20Sli, "zzriv-cqaaa-aaaao-a2gjq-cai", creator);
      ignore await* TokensInfoLib.SetTokenMetaDataByCanisterId(appSettings, tokensInfo, #Dip20Glds, "7a6j3-uqaaa-aaaao-a2g5q-cai", creator);
      cancelTimer(initializeTimerId);
      wasInitialized := true;

      Debug.print("Initialization completed sucessfully");
    } catch (error) {
      Debug.print("Error. " #debug_show (Error.message(error)));
    };
  };

  private func autoBurnAvailableDip20Tokens() : async () {
    if (cycles_required_available() < minimumAboveThresholdNeeded) {
      return;
    };

    try {

      let actorSliDip20 : Interfaces.InterfaceDip20 = actor (tokensInfo.Dip20_Sli.canisterId);
      var amount = await actorSliDip20.balanceOf(swapAppPrincipal);
      if (amount > tokensInfo.Dip20_Sli.fee) {
        ignore await actorSliDip20.burn(amount);
      };
    } catch (error) {

    };

    try {

      let actorGldsDip20 : Interfaces.InterfaceDip20 = actor (tokensInfo.Dip20_Glds.canisterId);
      var amount = await actorGldsDip20.balanceOf(swapAppPrincipal);
      if (amount > tokensInfo.Dip20_Glds.fee) {
        ignore await actorGldsDip20.burn(amount);
      };
    } catch (error) {

    };
  };

  private func autoTopUpArchiveCanisterCycles() : async () {

    try {

      if (archiveCanisterIdWasSet == false) {
        return;
      };

      if (cycles_required_available() < minimumAboveThresholdNeeded) {
        return;
      };

      let cyclesOnArchive : Nat = await archive.canister.cycles_available();
      if (cyclesOnArchive < archiveTopUpCyclesAmount) {
        Cycles.add<system>(archiveTopUpCyclesAmount);
        await archive.canister.deposit_cycles();
      };

    } catch (error) {
      //do nothing
    };

  };

  private func backgroundTimerTickFunction() : async () {
    try {
      await autoTopUpArchiveCanisterCycles();
    } catch (error) {};

    try {
      await autoBurnAvailableDip20Tokens();
    } catch (error) {};
  };

  //TODO:UNDO
  //wasInitialized := false;

  if (wasInitialized == false) {
    initializeTimerId := setTimer<system>(
      #seconds 1,
      func() : async () {
        await initTokenMetaDatas();
      },
    );
  };

  backgroundActivitiesTimerId := recurringTimer<system>(
    #seconds backgroundActivitesTimerTickSeconds,
    func() : async () {
      await backgroundTimerTickFunction();
    },
  );

  system func inspect(args : { caller : Principal; arg : Blob }) : Bool {
    let caller = args.caller;
    let msgArg = args.arg;

    //Set max allowed passed argument size to 1024 bytes,
    if (msgArg.size() > 2048) { return false };
    return true;
  };

};
