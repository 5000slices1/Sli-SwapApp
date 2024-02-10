

export const Dip20Interface = ({ IDL }) => {
  const TxReceipt = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : IDL.Variant({
      'InsufficientAllowance' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'ErrorOperationStyle' : IDL.Null,
      'Unauthorized' : IDL.Null,
      'LedgerTrap' : IDL.Null,
      'ErrorTo' : IDL.Null,
      'Other' : IDL.Text,
      'BlockUsed' : IDL.Null,
      'AmountTooSmall' : IDL.Null,
    }),
  });
  const Metadata = IDL.Record({
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'owner' : IDL.Principal,
    'logo' : IDL.Text,
    'name' : IDL.Text,
    'totalSupply' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  const Time = IDL.Int;
  const TokenInfo = IDL.Record({
    'holderNumber' : IDL.Nat,
    'deployTime' : Time,
    'metadata' : Metadata,
    'historySize' : IDL.Nat,
    'cycles' : IDL.Nat,
    'feeTo' : IDL.Principal,
  });
  return IDL.Service({
    'allowance' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Nat],
        ['query'],
      ),
    'approve' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'balanceOf' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'burn' : IDL.Func([IDL.Nat], [TxReceipt], []),
    'decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'getAllowanceSize' : IDL.Func([], [IDL.Nat], ['query']),
    'getHolders' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
        ['query'],
      ),
    'getMetadata' : IDL.Func([], [Metadata], ['query']),
    'getTokenFee' : IDL.Func([], [IDL.Nat], ['query']),
    'getTokenInfo' : IDL.Func([], [TokenInfo], ['query']),
    'getUserApprovals' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
        ['query'],
      ),
    'historySize' : IDL.Func([], [IDL.Nat], ['query']),
    'logo' : IDL.Func([], [IDL.Text], ['query']),
    'mint' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'name' : IDL.Func([], [IDL.Text], ['query']),
    'setFee' : IDL.Func([IDL.Nat], [], ['oneway']),
    'setFeeTo' : IDL.Func([IDL.Principal], [], ['oneway']),
    'setLogo' : IDL.Func([IDL.Text], [], ['oneway']),
    'setName' : IDL.Func([IDL.Text], [], ['oneway']),
    'setOwner' : IDL.Func([IDL.Principal], [], ['oneway']),
    'symbol' : IDL.Func([], [IDL.Text], ['query']),
    'totalSupply' : IDL.Func([], [IDL.Nat], ['query']),
    'transfer' : IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'transferFrom' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [TxReceipt],
        [],
      ),
  });
};

export const Icrc1Interface = ({ IDL }) => {
  const Account = IDL.Record({
    'owner': IDL.Principal,
    'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const MetadataValue = IDL.Variant({
    'Int' : IDL.Int,
    'Nat' : IDL.Nat,
    'Blob' : IDL.Vec(IDL.Nat8),
    'Text' : IDL.Text,
  });
  const TransferArg = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
  });
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : TransferError });
  return IDL.Service({
    'icrc1_balance_of': IDL.Func([Account], [IDL.Nat], ['query']),
    'icrc1_name': IDL.Func([], [IDL.Text], ['query']),
    'icrc1_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_total_supply' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_transfer' : IDL.Func([TransferArg], [Result], []),
    'icrc1_metadata' : IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))],
      ['query'],
    ),

  });
};

export const SwapAppActorInterface = ({ IDL }) => {
  const List = IDL.Rec();
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Time = IDL.Int;
  const SpecificTokenType = IDL.Variant({
    'Icrc1Sli' : IDL.Null,
    'Dip20Glds' : IDL.Null,
    'Icrc1Glds' : IDL.Null,
    'Dip20Sli' : IDL.Null,
  });
  const ArchivedConversionCompleted = IDL.Record({
    'time' : Time,
    'userPrincipal' : IDL.Principal,
    'tokenType' : SpecificTokenType,
    'amount' : IDL.Nat,
    'conversionId' : IDL.Vec(IDL.Nat8),
  });
  const Result_7 = IDL.Variant({
    'ok' : ArchivedConversionCompleted,
    'err' : IDL.Text,
  });
  const Result_6 = IDL.Variant({
    'ok' : IDL.Vec(ArchivedConversionCompleted),
    'err' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat64), 'err' : IDL.Text });
  List.fill(IDL.Opt(IDL.Tuple(IDL.Vec(IDL.Nat8), List)));
  const ArchivedConversionStarted = IDL.Record({
    'depositIds' : List,
    'time' : Time,
    'userPrincipal' : IDL.Principal,
    'tokenType' : SpecificTokenType,
    'amount' : IDL.Nat,
    'conversionId' : IDL.Vec(IDL.Nat8),
  });
  const Result_5 = IDL.Variant({
    'ok' : ArchivedConversionStarted,
    'err' : IDL.Text,
  });
  const Result_4 = IDL.Variant({
    'ok' : IDL.Vec(ArchivedConversionStarted),
    'err' : IDL.Text,
  });
  const ArchivedDeposit = IDL.Record({
    'to' : IDL.Principal,
    'depositId' : IDL.Vec(IDL.Nat8),
    'realAmount' : IDL.Nat,
    'from' : IDL.Principal,
    'time' : Time,
    'tokenType' : SpecificTokenType,
    'amount' : IDL.Nat,
  });
  const Result_3 = IDL.Variant({ 'ok' : ArchivedDeposit, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(ArchivedDeposit),
    'err' : IDL.Text,
  });
  const UsedSubAccount = IDL.Record({
    'subAccount' : IDL.Vec(IDL.Nat8),
    'createdAt' : Time,
  });
  return IDL.Service({
    'Clear' : IDL.Func([], [Result], []),
    'conversion_Completed_Add' : IDL.Func(
        [ArchivedConversionCompleted],
        [Result],
        [],
      ),
    'conversion_Completed_FromPrincipal_Count' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat64],
        ['query'],
      ),
    'conversion_Completed_Get_Item_By_Index' : IDL.Func(
        [IDL.Nat64],
        [Result_7],
        ['query'],
      ),
    'conversion_Completed_Get_Items' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [Result_6],
        ['query'],
      ),
    'conversion_Completed_Indizes_For_Principal' : IDL.Func(
        [IDL.Principal],
        [Result_1],
        ['query'],
      ),
    'conversion_Completed_Total_Count' : IDL.Func([], [IDL.Nat64], ['query']),
    'conversion_Started_Add' : IDL.Func(
        [ArchivedConversionStarted],
        [Result],
        [],
      ),
    'conversion_Started_FromPrincipal_Count' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat64],
        ['query'],
      ),
    'conversion_Started_Get_Item_By_Index' : IDL.Func(
        [IDL.Nat64],
        [Result_5],
        ['query'],
      ),
    'conversion_Started_Get_Items' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [Result_4],
        ['query'],
      ),
    'conversion_Started_Indizes_For_Principal' : IDL.Func(
        [IDL.Principal],
        [Result_1],
        ['query'],
      ),
    'conversion_Started_Total_Count' : IDL.Func([], [IDL.Nat64], ['query']),
    'cycles_available' : IDL.Func([], [IDL.Nat], ['query']),
    'deposit_Add' : IDL.Func([ArchivedDeposit], [Result], []),
    'deposit_FromPrincipal_Count' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat64],
        ['query'],
      ),
    'deposit_Get_Item_By_Index' : IDL.Func([IDL.Nat64], [Result_3], ['query']),
    'deposit_Get_Items' : IDL.Func([IDL.Nat, IDL.Nat], [Result_2], ['query']),
    'deposit_Indizes_For_Principal' : IDL.Func(
        [IDL.Principal],
        [Result_1],
        ['query'],
      ),
    'deposit_Total_Count' : IDL.Func([], [IDL.Nat64], ['query']),
    'deposit_cycles' : IDL.Func([], [], []),
    'getArchiveCanisterId' : IDL.Func([], [IDL.Principal], ['query']),
    'setSwapAppCanisterId' : IDL.Func([IDL.Principal], [Result], []),
    'subAccount_Add' : IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    'subAccount_Count' : IDL.Func([], [IDL.Nat], ['query']),
    'subAccount_Delete' : IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    'subAccount_GetItems' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(UsedSubAccount)],
        ['query'],
      ),
  });
  
};

