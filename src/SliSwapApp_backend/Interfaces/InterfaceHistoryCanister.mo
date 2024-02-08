import TypesArchive "../Types/TypesArchive";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Result "mo:base/Result";
import Principal "mo:base/Principal";

module{

  public type ArchiveData = {
        var canister:InterfaceArchive;
    };

    public type InterfaceArchive= actor{
        
        subAccount_Add: shared (subAccount:Blob) -> async (); 
        subAccount_Delete: shared (subAccount:Blob) -> async ();
        subAccount_Count: shared query () -> async Nat;
        subAccount_GetItems: shared query (from:Nat, to:Nat) -> async [TypesArchive.UsedSubAccount];
        
        deposit_Total_Count: shared query () -> async Nat64;
        deposit_FromPrincipal_Count: shared query (principal:Principal) -> async Nat64;
        deposit_Indizes_For_Principal: shared query (principal:Principal) -> async Result.Result<[Nat64], Text>;
        deposit_Get_Item_By_Index: shared query (index:Nat64) -> async Result.Result<TypesArchive.ArchivedDeposit, Text>;
        deposit_Get_Items: shared query (from:Nat, count:Nat) -> async Result.Result<[TypesArchive.ArchivedDeposit], Text>;
        deposit_Add: shared (depositItem:TypesArchive.ArchivedDeposit) -> async Result.Result<Text, Text>;

        cycles_available:shared query () -> async Nat;
        deposit_cycles:shared () -> async ();
        getArchiveCanisterId:shared query ()-> async Principal;
        setSwapAppCanisterId:shared (principal:Principal) -> async Result.Result<Text,Text>; 

    };


};