import Time "mo:base/Time";
import Principal "mo:base/Principal";
import TypesCommon "TypesCommon";

module {

    public type UsedSubAccount = {
        subAccount:Blob;
        createdAt:Time.Time;
    };


    public type ArchivedDeposit = {
        tokenType:TypesCommon.SpecificTokenType;
        amount:Nat;
        from:Principal;
        to:Principal;
        time:Time.Time;
    };

    public type ArchiveIndexLimits = {
        var firstUsedIndex:Nat64;
        var lastUsedIndex:Nat64;

    };

};