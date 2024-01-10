

module{
 public type Metadata = {
    fee : Nat;
    decimals : Nat8;
    owner : Principal;
    logo : Text;
    name : Text;
    totalSupply : Nat;
    symbol : Text;
  };
  public type Time = Int;
  public type TokenInfo = {
    holderNumber : Nat;
    deployTime : Time;
    metadata : Metadata;
    historySize : Nat;
    cycles : Nat;
    feeTo : Principal;
  };
  public type TxReceipt = {
    #Ok : Nat;
    #Err : {
      #InsufficientAllowance;
      #InsufficientBalance;
      #ErrorOperationStyle;
      #Unauthorized;
      #LedgerTrap;
      #ErrorTo;
      #Other : Text;
      #BlockUsed;
      #AmountTooSmall;
    };
  };



};