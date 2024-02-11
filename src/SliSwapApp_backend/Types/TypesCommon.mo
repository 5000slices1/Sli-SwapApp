import List "mo:base/List";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import StableTrieMap "mo:StableTrieMap";

module {

    public type SpecificTokenType = {
        #Icrc1Sli;
        #Icrc1Glds;

        #Dip20Sli;
        #Dip20Glds;
    };

    public type UserRole = {
        #Anonymous;
        #NormalUser;
        #Owner;
        #Admin;
    };

    public type ResponseGetUsersSwapWallet = {
        #Ok : Principal;
        #NotExist;
        #Err : Text;
    };

    public type ResponseConversion = {
        #ok : Text;
        #err : Text;
        #depositOnProgress : Text;
        #convertionOnProgress : Text;
    };

    //Contains Token static data (except fee, but fee is ignored
    //for ICRC1 and instead used from 'TokensDynamicInfoAsResponse')
    public type TokensInfo = {

        var Icrc1_Sli : Metadata;
        var Dip20_Sli : Metadata;

        var Icrc1_Glds : Metadata;
        var Dip20_Glds : Metadata;
    };

    //Contains Token static data as response (except fee (because dynamic), but fee is ignored
    //for ICRC1 and instead used from 'TokensDynamicInfoAsResponse')
    public type TokensInfoAsResponse = {

        Icrc1_Sli : Metadata;
        Dip20_Sli : Metadata;

        Icrc1_Glds : Metadata;
        Dip20_Glds : Metadata;
    };

    public type Metadata = {
        canisterId : Text;
        logo : Text;
        name : Text;
        symbol : Text;
        decimals : Nat;
        fee : Nat;
    };

    // Settings that will be stored as stable var
    public type AppSettings = {

        //Creator principal of the swap-app-canister-creator
        SwapAppCreator : Principal;
        var SwapAppUiPrincipal : ?Principal;
        var SwapAppAdmins : List.List<Text>;
    };

    // Settings that the client will use
    public type AppSettingsResponse = {
        UserRole : UserRole;

    };

    public type ApprovedWallets = {
        var approvedWalletsFree : List.List<Principal>;
        var approvedWalletsInUse : List.List<Principal>;
    };

    public type EncodedPrincipal = Blob;
    public type EncodedUserId = Blob;

    public type UserSwapInfoItem = {

        //The principal of the used swap-wallet. (== The wallet where the source-tokens should be transfered to)
        swapWallet : Principal;

        //Number of times deposit was done
        depositCount : Nat;

        //The userId
        userId : Blob;
    };

    public type UsersSwapInfo = {
        userSwapInfoItems : StableTrieMap.StableTrieMap<EncodedPrincipal, UserSwapInfoItem>;
        principalMappings : StableTrieMap.StableTrieMap<EncodedUserId, Principal>;
    };

    public type DepositState = {
        depositInProgress : StableTrieMap.StableTrieMap<EncodedPrincipal, Time.Time>;
        depositIds : StableTrieMap.StableTrieMap<EncodedPrincipal, List.List<Blob>>;
    };

    public type SubAccountInfo = {
        subAccount : Blob;
        initialIcrc1BalanceAmount : Nat;
        icrc1Fee : Nat;
        depositedDip20AmountToConsider : Nat;
        depositedDip20RealAmount : Nat;
        dip20SwapWallet : Principal;
        dip20TransferFee : Nat;
        dip20CanisterId : Text;
        conversionId : Blob;

    };

    public type TransferAndBurnDip20Info = {
        depositedDip20AmountToConsider : Nat;
        depositedDip20RealAmount : Nat;
        dip20SwapWallet : Principal;
        dip20TransferFee : Nat;
        dip20CanisterId : Text;
        conversionId : Blob;
        createdAt : Time.Time;

    };

    public type ConvertState = {

        convertInProgress : StableTrieMap.StableTrieMap<EncodedPrincipal, Time.Time>;

        //Detailed convert states splitted up by individual steps:

        //Transfer ICRC1 tokens from app-wallet to individual subaccount started info
        transferToSubaccountStarted : StableTrieMap.StableTrieMap<EncodedPrincipal, Time.Time>;

        //Transfer ICRC1 tokens from individual subaccount to users wallet started.
        transferFromSubaccountStarted : StableTrieMap.StableTrieMap<EncodedPrincipal, Time.Time>;

        transferAndBurnDip20Tokens : StableTrieMap.StableTrieMap<Blob, TransferAndBurnDip20Info>;

        //The temporary subaccount that will be used for the target-token transfers
        //When all above steps are completed, the entry will be removed from this entry
        temporarySubaccounts : StableTrieMap.StableTrieMap<EncodedPrincipal, SubAccountInfo>;

    };

    public type CommonDataPerToken = {
        approvedWallets : ApprovedWallets;
        depositState : DepositState;
        convertState : ConvertState;
        swapInfo : UsersSwapInfo;
    };

    public type CommonData = {
        sliData : CommonDataPerToken;
        gldsData : CommonDataPerToken;
    };

};
