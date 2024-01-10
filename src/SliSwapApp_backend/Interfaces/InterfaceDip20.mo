import Dip20Types "../Types/TypesDip20";


module {
 
  public type InterfaceDip20 = actor {
    allowance : shared query (Principal, Principal) -> async Nat;
    approve : shared (Principal, Nat) -> async Dip20Types.TxReceipt;
    balanceOf : shared query Principal -> async Nat;
    burn : shared Nat -> async Dip20Types.TxReceipt;
    decimals : shared query () -> async Nat8;
    getAllowanceSize : shared query () -> async Nat;
    getHolders : shared query (Nat, Nat) -> async [(Principal, Nat)];
    getMetadata : shared query () -> async Dip20Types.Metadata;
    getTokenFee : shared query () -> async Nat;
    getTokenInfo : shared query () -> async Dip20Types.TokenInfo;
    getUserApprovals : shared query Principal -> async [(Principal, Nat)];
    historySize : shared query () -> async Nat;
    logo : shared query () -> async Text;
    mint : shared (Principal, Nat) -> async Dip20Types.TxReceipt;
    name : shared query () -> async Text;
    setFee : shared Nat -> ();
    setFeeTo : shared Principal -> ();
    setLogo : shared Text -> ();
    setName : shared Text -> ();
    setOwner : shared Principal -> ();
    symbol : shared query () -> async Text;
    totalSupply : shared query () -> async Nat;
    transfer : shared (Principal, Nat) -> async Dip20Types.TxReceipt;
    transferFrom : shared (Principal, Principal, Nat) -> async Dip20Types.TxReceipt;
  }
}