import T "../Types/TypesCommon";
import Principal "mo:base/Principal";
import List "mo:base/List";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Time "mo:base/Time";
import Interfaces "../Interfaces/Interfaces";
import TypesIcrc "../Types/TypesICRC1";
import Dip20Types "../Types/TypesDip20";
import StableTrieMap "mo:StableTrieMap";

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

public func InitCommonData() : T.CommonData {
    
    let sliDataItem:T.CommonDataPerToken  = InitAndReturnCommonDataPerToken();
    let gldsDataItem:T.CommonDataPerToken = InitAndReturnCommonDataPerToken();          

    let commonData : T.CommonData = {
        sliData:T.CommonDataPerToken  = sliDataItem;
        gldsData:T.CommonDataPerToken = gldsDataItem;          
    };   
    return commonData;
};


private func InitAndReturnCommonDataPerToken() : T.CommonDataPerToken {

    let approvedWalletsItem: T.ApprovedWallets = {
        var approvedWalletsFree : List.List<Principal> = List.nil<Principal>();
        var approvedWalletsInUse : List.List<Principal> = List.nil<Principal>();
    };

    let depositStateItem: T.DepositState = {
        depositInProgress : StableTrieMap.StableTrieMap<T.EncodedPrincipal, Time.Time> = StableTrieMap.new();            
    };

    let convertStateItem : T.ConvertState = {
        convertInProgress : StableTrieMap.StableTrieMap<T.EncodedPrincipal, Time.Time> = StableTrieMap.new();
    };

    let swapInfoItem : T.UsersSwapInfo = {
        userSwapInfoItems = StableTrieMap.new();
        principalMappings = StableTrieMap.new();
    };


    let commonData : T.CommonDataPerToken = {        
        approvedWallets : T.ApprovedWallets = approvedWalletsItem;
        depositState : T.DepositState = depositStateItem;
        convertState : T.ConvertState =  convertStateItem;
        swapInfo : T.UsersSwapInfo = swapInfoItem
        
    };    
    return commonData;
};


};
