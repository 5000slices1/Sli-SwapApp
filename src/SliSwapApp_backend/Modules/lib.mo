import T "../Types/TypesCommon";
import Principal "mo:base/Principal";
import List "mo:base/List";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Interfaces "../Interfaces/Interfaces";
import TypesIcrc "../Types/TypesICRC1";
import Dip20Types "../Types/TypesDip20";

module {

    public func SwapAppInit(creator : Principal) : T.AppSettings {

        let returnValue : T.AppSettings = {

            //Creator principal of the swap-app-canister-creator
            SwapAppCreator = creator;
            var SwapAppUiPrincipal = null;

            var SwapAppAdmins = List.nil<Text>();
        };

        return returnValue;

    };

    public func TokensInfoInit() : T.TokensInfo {

        let defaultTokenInfo : T.Metadata = {
            canisterId = "";
            logo = "";
            name = "";
            symbol = "";
            decimals = 0;
            fee = 0;
        };

        let resultT : T.TokensInfo = {
            var Icrc1_Sli = defaultTokenInfo;
            var Dip20_Sli = defaultTokenInfo;
            var Icrc1_Glds = defaultTokenInfo;
            var Dip20_Glds = defaultTokenInfo;
        };

    };

    public func UserIsOwnerOrAdmin(appSettings : T.AppSettings, principal : Principal) : async* Bool {

//TODO:undo
return true;

        let userRole = GetUserRole(appSettings, principal);
        if (userRole == #Owner or userRole == #Admin) {
            return true;
        };

        return false;
    };

    public func GetUserRole(appSettings : T.AppSettings, principal : Principal) : T.UserRole {

        if (Principal.isAnonymous(principal)) {
            return #Anonymous;
        };

        if (principal == appSettings.SwapAppCreator) {
            return #Owner;
        };

        let principalText = Principal.toText(principal);
        if (
            List.size<Text>(appSettings.SwapAppAdmins) > 0 and List.some<Text>(appSettings.SwapAppAdmins, func(n) { n == principalText })
        ) {
            return #Admin;
        };

        return #NormalUser;
    };

    public func SliIcrc1_SetCanisterId(
        caller : Principal,
        appSettings : T.AppSettings,
        tokensInfo : T.TokensInfo,
        canisterId : Text,
    ) : async* Result.Result<Text, Text> {

        await* SetTokenMetaDataByCanisterId(appSettings, tokensInfo, #Icrc1Sli, canisterId, caller);    
    };

    public func GldsIcrc1_SetCanisterId(
        caller : Principal,
        appSettings : T.AppSettings,
        tokensInfo : T.TokensInfo,
        canisterId : Text,
    ) : async* Result.Result<Text, Text> {

        await* SetTokenMetaDataByCanisterId(appSettings, tokensInfo, #Icrc1Glds, canisterId, caller);
    };

    public func AddAdminUser(caller : Principal, appSettings : T.AppSettings, principal : Text) : async* Result.Result<Text, Text> {

        if (caller != appSettings.SwapAppCreator) {
            return #err("Only owner of SwapApp can add admin user");
        };
        let realPrincipal = Principal.fromText(principal);

        let userIsAlreadyAdminOrOwner = await* UserIsOwnerOrAdmin(appSettings, realPrincipal);
        if (userIsAlreadyAdminOrOwner == false) {
            appSettings.SwapAppAdmins := List.push<Text>(principal, appSettings.SwapAppAdmins);
            return #ok("Principal was added as admin user.");
        };

        return #ok("Is already admin user or owner.");
    };

    public func RemoveAdminUser(caller : Principal, appSettings : T.AppSettings, principal : Text) : async* Result.Result<Text, Text> {

        if (caller != appSettings.SwapAppCreator) {
            return #err("Only owner of SwapApp can remove admin user");
        };
        let realPrincipal = Principal.fromText(principal);

        let userIsAlreadyAdminOrOwner = await* UserIsOwnerOrAdmin(appSettings, realPrincipal);
        if (userIsAlreadyAdminOrOwner == true) {
            appSettings.SwapAppAdmins := List.filter<Text>(appSettings.SwapAppAdmins, func n { n != principal });
            return #ok("Principal is no longer an admin user.");
        };

        return #ok("Principal was not in the admin list.");
    };

    public func ListAdminUsers(appSettings : T.AppSettings) : [Text] {
        return List.toArray<Text>(appSettings.SwapAppAdmins);
    };

    public func SetTokenMetaDataByCanisterId(
        appSettings : T.AppSettings,
        tokensInfo : T.TokensInfo,
        tokenType : T.SpecificTokenType,
        canisterId : Text,
        caller : Principal,
    ) : async* Result.Result<Text, Text> {
        
        let userIsAdminOrOwner = await* UserIsOwnerOrAdmin(appSettings, caller);        
        if (userIsAdminOrOwner == true) {

            try {
                let testPrincipal = Principal.fromText(canisterId);

            } catch (error) {
                return #err("Not a valid Canister-id ");
            };
            
            let metaData = await GetMetaData(tokenType, canisterId);
            
            switch (metaData) {
                case (#err(text)) {
                    return #err(text);
                };
                case (#ok(data)) {

                    switch (tokenType) {
                        case (#Icrc1Sli) {
                            tokensInfo.Icrc1_Sli := data;
                        };
                        case (#Icrc1Glds) {
                            tokensInfo.Icrc1_Glds := data;
                        };
                        case (#Dip20Sli) {
                            tokensInfo.Dip20_Sli := data;
                        };
                        case (#Dip20Glds) {
                            tokensInfo.Dip20_Glds := data;
                        };                       
                    };
                };
            };

            return #ok("Canister-id and metaData was set");
        };

        return #err("Only canister owner or admins can call this method");
    };

    private func GetMetaData(tokenType : T.SpecificTokenType, canisterId : Text) : async Result.Result<T.Metadata, Text> {
        
       
        switch (tokenType) {

            case (#Icrc1Sli or #Icrc1Glds) {                
                let actorIcrc1 : Interfaces.InterfaceIcrc = actor (canisterId);                
                let metaDatafromIcrc1 = await actorIcrc1.icrc1_metadata();                
                let metaDataResult = convertICRCMetadata(canisterId, metaDatafromIcrc1);                
                return #ok(metaDataResult);
            };
            case (#Dip20Sli or #Dip20Glds) {

                let actorDip20 : Interfaces.InterfaceDip20 = actor (canisterId);
                
                let metaDatafromDip20 : Dip20Types.Metadata = await actorDip20.getMetadata();
                let metaDataResult : T.Metadata = {
                    canisterId = canisterId;
                    logo = metaDatafromDip20.logo;
                    name = metaDatafromDip20.name;
                    symbol = metaDatafromDip20.symbol;
                    decimals = Nat8.toNat(metaDatafromDip20.decimals);
                    fee = metaDatafromDip20.fee;
                };                
                return #ok(metaDataResult);
            };            
        };
        return #err("Error in getting MetaData for tokenType " #debug_show (tokenType));

    };

    private func convertICRCMetadata(canisterId:Text, metadata : [(Text, TypesIcrc.Value)]) : T.Metadata {
        var name : Text = "";
        var symbol : Text = "";
        var fee : Nat = 0;
        var decimals : Nat = 0;
        var logo = "";
        for (metadata in metadata.vals()) {
            switch (metadata.0) {
                case ("icrc1:name") {
                    switch (metadata.1) {
                        case (#Text(data)) {
                            name := data;
                        };
                        case (_) {};
                    };
                };
                case ("icrc1:symbol") {
                    switch (metadata.1) {
                        case (#Text(data)) {
                            symbol := data;
                        };
                        case (_) {};
                    };
                };
                case ("icrc1:decimals") {
                    switch (metadata.1) {
                        case (#Nat(data)) {
                            decimals := data;
                        };
                        case (#Nat8(data)) {
                            decimals := Nat8.toNat(data);
                        };
                        case (_) {};
                    };
                };
                case ("icrc1:fee") {
                    switch (metadata.1) {
                        case (#Nat(data)) {
                            fee := data;
                        };
                        case (_) {};
                    };
                };
                case ("icrc1:logo") {
                    switch (metadata.1) {
                        case (#Text(data)) {
                            logo := data;
                        };
                        case (_) {};
                    };
                };
                case (_) {};
            };
        };
        var resultMeta : T.Metadata = {
            canisterId = canisterId;
            logo = logo;
            name = name;
            symbol = symbol;
            decimals = decimals;
            fee = fee;
        };
        return resultMeta;
    };


   private func IcrcGetBalance(canisterId:Text, principalText:Text): async Result.Result<TypesIcrc.Balance, Text>{
    
    try
    {
      let principal:Principal = Principal.fromText(principalText);
      let account:TypesIcrc.Account = {
        owner = principal;
        subaccount = null;
      };

      let actorIcrc1:Interfaces.InterfaceIcrc = actor(canisterId);
      let balance:TypesIcrc.Balance = await actorIcrc1.icrc1_balance_of(account);
      
      Debug.print("balance:");
      Debug.print(debug_show(balance));    
      return #ok(balance);
    }
    catch(error)
    {
      return #err("Error: " #Error.message(error));       
    }
            
  };
    // private func IcrcGetMetaData(canisterId:Text): async Icrc1.MetaData{

    //     Debug.print("show metadata");
    //     let actorIcrc1:Interfaces.InterfaceIcrc = actor(canisterId);
    //     let metaData = await actorIcrc1.icrc1_metadata();

    //     Debug.print(debug_show(metaData));
    //     return metaData;
    // };

};
