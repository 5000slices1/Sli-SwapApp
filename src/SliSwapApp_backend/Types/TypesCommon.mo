import List "mo:base/List";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import StableTrieMap "mo:StableTrieMap";
// import StableTrieMapAccessor "../Modules/Helpers/StableTrieMapAccessor";

module{

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
        #Ok:Principal;
        #NotExist;
        #Err:Text;
    };

 
    //Contains Token static data (except fee, but fee is ignored 
    //for ICRC1 and instead used from 'TokensDynamicInfoAsResponse')
    public type TokensInfo = {
        
        var Icrc1_Sli:Metadata;
        var Dip20_Sli:Metadata;

        var Icrc1_Glds:Metadata;
        var Dip20_Glds:Metadata;        
    };

    //Contains Token static data as response (except fee (because dynamic), but fee is ignored 
    //for ICRC1 and instead used from 'TokensDynamicInfoAsResponse')
    public type TokensInfoAsResponse = {
        
        Icrc1_Sli:Metadata;
        Dip20_Sli:Metadata;

        Icrc1_Glds:Metadata;
        Dip20_Glds:Metadata;        
    };

    public type Metadata = {
        canisterId:Text;
        logo : Text;
        name : Text;
        symbol : Text;
        decimals : Nat;        
        fee : Nat;
    };

    // Settings that will be stored as stable var
    public type AppSettings = {

        //Creator principal of the swap-app-canister-creator
        SwapAppCreator:Principal;        
        var SwapAppUiPrincipal:?Principal;
        var SwapAppAdmins:List.List<Text>;                     
    };


    // Settings that the client will use
    public type AppSettingsResponse = {
        UserRole: UserRole;

    };

    public type ApprovedWallets = {
        var approvedWalletsFree:List.List<Principal>; 
        var approvedWalletsInUse:List.List<Principal>;
    };


    // public type ActionStatus ={
        
    //     #Idle:Time.Time;
    //     #FirstTimeStarted:Time.Time;
    //     #Started:Time.Time;
    //     #Completed:Time.Time;
    // };

    public type EncodedPrincipal = Blob;
    public type EncodedUserId = Blob;

    public type UserSwapInfoItem = {
        
        //The principal of the used swap-wallet. (== The wallet where the source-tokens should be transfered to)
        swapWallet:Principal;

        //Number of times deposit was done
        depositCount:Nat;
    };

    public type UsersSwapInfo = {
        userSwapInfoItems:StableTrieMap.StableTrieMap<EncodedPrincipal, UserSwapInfoItem>;    
        principalMappings: StableTrieMap.StableTrieMap<EncodedUserId, Principal>;
    };

    public type DepositState = {
        sliDepositInProgress:StableTrieMap.StableTrieMap<EncodedPrincipal, Time.Time>;
        gldsDepositInProgress:StableTrieMap.StableTrieMap<EncodedPrincipal, Time.Time>;
    };

    //public type StableTrieMap_SwapInfo = StableTrieMap.StableTrieMap<Principal, SwapInfo>;
    //public type StableTrieMap_SwapInfoGlds = StableTrieMap.StableTrieMap<Principal, SwapInfo>;

};