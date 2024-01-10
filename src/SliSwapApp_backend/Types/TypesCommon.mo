import List "mo:base/List";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";

module{


    public type SpecificTokenType = {
        #Icrc1Sli;
        #Icrc1Glds;

        #Dip20Sli;        
        #Dip20Glds;
    };

    // public type TokenType = {
    //     #Icrc1;
    //     #Dip20
    // };

    public type UserRole = {    
        #Anonymous;
        #NormalUser;
        #Owner;
        #Admin;
    };

 
    //The static tokens information
    public type TokensInfo = {
        
        var Icrc1_Sli:Metadata;
        var Dip20_Sli:Metadata;

        var Icrc1_Glds:Metadata;
        var Dip20_Glds:Metadata;        
    };

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

};