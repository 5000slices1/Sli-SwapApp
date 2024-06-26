import Time "mo:base/Time";
import Principal "mo:base/Principal";
import List "mo:base/List";
import TypesCommon "TypesCommon";

module {

    public type UsedSubAccount = {
        subAccount : Blob;
        createdAt : Time.Time;
    };

    public type ArchiveItem = {
        bytes : Region;
        var bytes_count : Nat64;

        elems : Region;
        var elems_count : Nat64;
    };

    public type ArchivedDeposit = {
        tokenType : TypesCommon.SpecificTokenType;
        amount : Nat;
        realAmount : Nat;
        from : Principal;
        to : Principal;
        depositId : Blob; //32 bytes
        time : Time.Time;
    };

    public type ArchivedConversionStarted = {
        tokenType : TypesCommon.SpecificTokenType;
        amount : Nat;
        conversionId : Blob;
        depositIds : [Blob];
        userPrincipal : Principal;
        subAccount : Blob;
        time : Time.Time;
    };

    public type ArchivedConversionCompleted = {
        tokenType : TypesCommon.SpecificTokenType;
        amount : Nat;
        conversionId : Blob;
        userPrincipal : Principal;
        subAccount : Blob;
        transactionIndex : Nat;
        time : Time.Time;
    };

};
