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
import CommonLib "CommonLib";

module {

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

    public func SetTokenMetaDataByCanisterId(
        appSettings : T.AppSettings,
        tokensInfo : T.TokensInfo,
        tokenType : T.SpecificTokenType,
        canisterId : Text,
        caller : Principal,
    ) : async* Result.Result<Text, Text> {

        let userIsAdminOrOwner = CommonLib.UserIsOwnerOrAdmin(appSettings, caller);

        if (userIsAdminOrOwner != true) {
            return #err("Only canister owner or admins can call this method");
        };

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

    private func convertICRCMetadata(canisterId : Text, metadata : [(Text, TypesIcrc.Value)]) : T.Metadata {
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

    public func IcrcGetBalance(canisterId : Text, principalText : Text, optionalSubAccount : ?TypesIcrc.Subaccount) : async* Result.Result<TypesIcrc.Balance, Text> {

        try {
            let principal : Principal = Principal.fromText(principalText);
            let account : TypesIcrc.Account = {
                owner = principal;
                subaccount = optionalSubAccount;
            };

            let actorIcrc1 : Interfaces.InterfaceIcrc = actor (canisterId);
            let balance : TypesIcrc.Balance = await actorIcrc1.icrc1_balance_of(account);

            return #ok(balance);
        } catch (error) {
            return #err("Error: " #Error.message(error));
        };

    };

    public func IcrcGetCurrentTransferFee(canisterId : Text) : async Result.Result<TypesIcrc.Balance, Text> {

        try {
            if (canisterId.size() <= 0) {
                return #err("Sli Icrc1 canisterId was not set.");
            };

            let actorIcrc1 : Interfaces.InterfaceIcrc = actor (canisterId);
            let fee = await actorIcrc1.icrc1_fee();
            return #ok(fee);
        } catch (error) {
            return #err("Error: " #Error.message(error));
        };

    };

    public func IcrcGetCurrentTotalSupply(canisterId : Text) : async Result.Result<TypesIcrc.Balance, Text> {

        try {
            if (canisterId.size() <= 0) {
                return #err("Sli Icrc1 canisterId was not set.");
            };

            let actorIcrc1 : Interfaces.InterfaceIcrc = actor (canisterId);
            let totalSupply = await actorIcrc1.icrc1_total_supply();
            return #ok(totalSupply);
        } catch (error) {
            return #err("Error: " #Error.message(error));
        };
    };

    public func GetTokensInfos(tokensInfo : T.TokensInfo) : T.TokensInfoAsResponse {

        let result : T.TokensInfoAsResponse = {
            Icrc1_Sli = tokensInfo.Icrc1_Sli;
            Dip20_Sli = tokensInfo.Dip20_Sli;
            Icrc1_Glds = tokensInfo.Icrc1_Glds;
            Dip20_Glds = tokensInfo.Dip20_Glds;
        };

        return result;
    };
};
