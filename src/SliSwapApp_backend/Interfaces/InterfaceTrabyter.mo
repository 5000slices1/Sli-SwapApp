import ICRC1Types "../Types/TypesICRC1";
import InterfaceIcrc2 "InterfaceICRC2";
import InterfaceIcrc1 "InterfaceICRC1";


module{

      ///Burn arguments type
    public type BurnArgs = {
        from_subaccount : ?ICRC1Types.Subaccount;
        amount : ICRC1Types.Balance;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };

    public type TrabyterTokenInterfaceInternal = actor {

        // Queries the real fee between two principals
        real_fee : shared query (from : Principal, to : Principal) -> async ICRC1Types.Balance;

        // Burns tokens with the given arguments.
        burn : shared (args : BurnArgs) -> async ICRC1Types.TransferResult; 
    };

    public type TrabyterTokenInterface = TrabyterTokenInterfaceInternal and InterfaceIcrc2.Icrc2Interface and InterfaceIcrc1.TokenInterface;


};