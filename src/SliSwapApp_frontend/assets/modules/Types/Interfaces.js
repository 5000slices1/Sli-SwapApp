

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
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const ResponseGetUsersSwapWallet = IDL.Variant({
    'Ok' : IDL.Principal,
    'Err' : IDL.Text,
    'NotExist' : IDL.Null,
  });
  const Balance = IDL.Nat;
  const Result_1 = IDL.Variant({ 'ok' : Balance, 'err' : IDL.Text });
  const Metadata = IDL.Record({
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat,
    'logo' : IDL.Text,
    'name' : IDL.Text,
    'symbol' : IDL.Text,
    'canisterId' : IDL.Text,
  });
  const TokensInfoAsResponse = IDL.Record({
    'Icrc1_Glds' : Metadata,
    'Dip20_Sli' : Metadata,
    'Dip20_Glds' : Metadata,
    'Icrc1_Sli' : Metadata,
  });
  const UserRole = IDL.Variant({
    'Anonymous' : IDL.Null,
    'NormalUser' : IDL.Null,
    'Admin' : IDL.Null,
    'Owner' : IDL.Null,
  });
  return IDL.Service({
    'AddAdminUser' : IDL.Func([IDL.Principal], [Result], []),
    'AddNewApprovedGldsWallet' : IDL.Func([IDL.Principal], [Result], []),
    'AddNewApprovedSliWallet' : IDL.Func([IDL.Principal], [Result], []),
    'ApprovedWalletsPrincipalExist' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'DepositGldsDip20Tokens' : IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
    'DepositSliDip20Tokens' : IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
    'GetGldsDip20DepositedAmount' : IDL.Func([], [Result_2], []),
    'GetGldsSwapWalletForPrincipal' : IDL.Func(
        [IDL.Principal],
        [ResponseGetUsersSwapWallet],
        ['query'],
      ),
    'GetIcrc1Balance' : IDL.Func([IDL.Principal], [Result_1], []),
    'GetListOfAdminUsers' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'GetNumberOfGldsApprovedWallets' : IDL.Func(
        [],
        [IDL.Nat, IDL.Nat],
        ['query'],
      ),
    'GetNumberOfSliApprovedWallets' : IDL.Func(
        [],
        [IDL.Nat, IDL.Nat],
        ['query'],
      ),
    'GetSliDip20DepositedAmount' : IDL.Func([], [Result_2], []),
    'GetSliSwapWalletForPrincipal' : IDL.Func(
        [IDL.Principal],
        [ResponseGetUsersSwapWallet],
        ['query'],
      ),
    'GetSwapAppPrincipalText' : IDL.Func([], [IDL.Text], ['query']),
    'GetTokensInfos' : IDL.Func([], [TokensInfoAsResponse], ['query']),
    'GetUserRole' : IDL.Func([], [UserRole], ['query']),
    'GldsIcrc1_GetCanisterId' : IDL.Func([], [IDL.Text], ['query']),
    'GldsIcrc1_GetCurrentTotalSupply' : IDL.Func([], [Result_1], []),
    'GldsIcrc1_GetCurrentTransferFee' : IDL.Func([], [Result_1], []),
    'GldsIcrc1_SetCanisterId' : IDL.Func([IDL.Principal], [Result], []),
    'RemoveAdminUser' : IDL.Func([IDL.Principal], [Result], []),
    'SliIcrc1_GetCanisterId' : IDL.Func([], [IDL.Text], ['query']),
    'SliIcrc1_GetCurrentTotalSupply' : IDL.Func([], [Result_1], []),
    'SliIcrc1_GetCurrentTransferFee' : IDL.Func([], [Result_1], []),
    'SliIcrc1_SetCanisterId' : IDL.Func([IDL.Principal], [Result], []),
  });
  
};

