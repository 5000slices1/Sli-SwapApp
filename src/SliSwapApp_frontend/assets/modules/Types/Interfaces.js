

export const Dip20Interface = ({ IDL }) => {
  const TxReceipt = IDL.Variant({
    'Ok': IDL.Nat,
    'Err': IDL.Variant({
      'InsufficientAllowance': IDL.Null,
      'InsufficientBalance': IDL.Null,
      'ErrorOperationStyle': IDL.Null,
      'Unauthorized': IDL.Null,
      'LedgerTrap': IDL.Null,
      'ErrorTo': IDL.Null,
      'Other': IDL.Text,
      'BlockUsed': IDL.Null,
      'AmountTooSmall': IDL.Null,
    }),
  });
  const Metadata = IDL.Record({
    'fee': IDL.Nat,
    'decimals': IDL.Nat8,
    'owner': IDL.Principal,
    'logo': IDL.Text,
    'name': IDL.Text,
    'totalSupply': IDL.Nat,
    'symbol': IDL.Text,
  });
  const Time = IDL.Int;
  const TokenInfo = IDL.Record({
    'holderNumber': IDL.Nat,
    'deployTime': Time,
    'metadata': Metadata,
    'historySize': IDL.Nat,
    'cycles': IDL.Nat,
    'feeTo': IDL.Principal,
  });
  return IDL.Service({
    'allowance': IDL.Func(
      [IDL.Principal, IDL.Principal],
      [IDL.Nat],
      ['query'],
    ),
    'approve': IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'balanceOf': IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'burn': IDL.Func([IDL.Nat], [TxReceipt], []),
    'decimals': IDL.Func([], [IDL.Nat8], ['query']),
    'getAllowanceSize': IDL.Func([], [IDL.Nat], ['query']),
    'getHolders': IDL.Func(
      [IDL.Nat, IDL.Nat],
      [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
      ['query'],
    ),
    'getMetadata': IDL.Func([], [Metadata], ['query']),
    'getTokenFee': IDL.Func([], [IDL.Nat], ['query']),
    'getTokenInfo': IDL.Func([], [TokenInfo], ['query']),
    'getUserApprovals': IDL.Func(
      [IDL.Principal],
      [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
      ['query'],
    ),
    'historySize': IDL.Func([], [IDL.Nat], ['query']),
    'logo': IDL.Func([], [IDL.Text], ['query']),
    'mint': IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'name': IDL.Func([], [IDL.Text], ['query']),
    'setFee': IDL.Func([IDL.Nat], [], ['oneway']),
    'setFeeTo': IDL.Func([IDL.Principal], [], ['oneway']),
    'setLogo': IDL.Func([IDL.Text], [], ['oneway']),
    'setName': IDL.Func([IDL.Text], [], ['oneway']),
    'setOwner': IDL.Func([IDL.Principal], [], ['oneway']),
    'symbol': IDL.Func([], [IDL.Text], ['query']),
    'totalSupply': IDL.Func([], [IDL.Nat], ['query']),
    'transfer': IDL.Func([IDL.Principal, IDL.Nat], [TxReceipt], []),
    'transferFrom': IDL.Func(
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
    'Int': IDL.Int,
    'Nat': IDL.Nat,
    'Blob': IDL.Vec(IDL.Nat8),
    'Text': IDL.Text,
  });
  const TransferArg = IDL.Record({
    'to': Account,
    'fee': IDL.Opt(IDL.Nat),
    'memo': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time': IDL.Opt(IDL.Nat64),
    'amount': IDL.Nat,
  });
  const TransferError = IDL.Variant({
    'GenericError': IDL.Record({
      'message': IDL.Text,
      'error_code': IDL.Nat,
    }),
    'TemporarilyUnavailable': IDL.Null,
    'BadBurn': IDL.Record({ 'min_burn_amount': IDL.Nat }),
    'Duplicate': IDL.Record({ 'duplicate_of': IDL.Nat }),
    'BadFee': IDL.Record({ 'expected_fee': IDL.Nat }),
    'CreatedInFuture': IDL.Record({ 'ledger_time': IDL.Nat64 }),
    'TooOld': IDL.Null,
    'InsufficientFunds': IDL.Record({ 'balance': IDL.Nat }),
  });
  const Result = IDL.Variant({ 'Ok': IDL.Nat, 'Err': TransferError });
  return IDL.Service({
    'icrc1_balance_of': IDL.Func([Account], [IDL.Nat], ['query']),
    'icrc1_name': IDL.Func([], [IDL.Text], ['query']),
    'icrc1_symbol': IDL.Func([], [IDL.Text], ['query']),
    'icrc1_decimals': IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee': IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_total_supply': IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_transfer': IDL.Func([TransferArg], [Result], []),
    'icrc1_metadata': IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))],
      ['query'],
    ),

  });
};



export const SwapAppActorInterface = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Result_7 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const ResponseGetUsersSwapWallet = IDL.Variant({
    'Ok' : IDL.Principal,
    'Err' : IDL.Text,
    'NotExist' : IDL.Null,
  });
  const Balance = IDL.Nat;
  const Result_3 = IDL.Variant({ 'ok' : Balance, 'err' : IDL.Text });
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
  const Result_6 = IDL.Variant({ 'ok' : IDL.Vec(IDL.Nat8), 'err' : IDL.Text });
  const UserRole = IDL.Variant({
    'Anonymous' : IDL.Null,
    'NormalUser' : IDL.Null,
    'Admin' : IDL.Null,
    'Owner' : IDL.Null,
  });
  const Balance__1 = IDL.Nat;
  const TransferFromError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const TransferFromResponse = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : TransferFromError,
  });
  const Result_5 = IDL.Variant({
    'ok' : TransferFromResponse,
    'err' : IDL.Text,
  });
  const TxIndex = IDL.Nat;
  const Timestamp = IDL.Nat64;
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : Balance }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : TxIndex }),
    'BadFee' : IDL.Record({ 'expected_fee' : Balance }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : Timestamp }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Balance }),
  });
  const TransferResult = IDL.Variant({ 'Ok' : TxIndex, 'Err' : TransferError });
  const Result_4 = IDL.Variant({
    'ok' : IDL.Tuple(TransferFromResponse, TransferResult),
    'err' : IDL.Text,
  });
  const ApproveError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'AllowanceChanged' : IDL.Record({ 'current_allowance' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'Expired' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const ApproveResult = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : ApproveError });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(ApproveResult),
    'err' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Principal, 'err' : IDL.Text });
  return IDL.Service({
    'AddAdminUser' : IDL.Func([IDL.Principal], [Result], []),
    'AddNewApprovedGldsWallet' : IDL.Func([IDL.Principal], [Result], []),
    'AddNewApprovedSliWallet' : IDL.Func([IDL.Principal], [Result], []),
    'ApprovedWalletsPrincipalExist' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'CanUserDepositGldsDip20' : IDL.Func([IDL.Principal], [Result], ['query']),
    'CanUserDepositSliDip20' : IDL.Func([IDL.Principal], [Result], ['query']),
    'ConvertOldGldsDip20Tokens' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result], []),
    'ConvertOldSliDip20Tokens' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result], []),
    'DepositGldsDip20Tokens' : IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
    'DepositSliDip20Tokens' : IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
    'GetGldsDip20DepositedAmount' : IDL.Func([], [Result_7], []),
    'GetGldsSwapWalletForPrincipal' : IDL.Func(
        [IDL.Principal],
        [ResponseGetUsersSwapWallet],
        ['query'],
      ),
    'GetIcrc1Balance' : IDL.Func([IDL.Principal], [Result_3], []),
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
    'GetSliDip20DepositedAmount' : IDL.Func([], [Result_7], []),
    'GetSliSwapWalletForPrincipal' : IDL.Func(
        [IDL.Principal],
        [ResponseGetUsersSwapWallet],
        ['query'],
      ),
    'GetSwapAppPrincipalText' : IDL.Func([], [IDL.Text], ['query']),
    'GetTokensInfos' : IDL.Func([], [TokensInfoAsResponse], ['query']),
    'GetUserIdForGlds' : IDL.Func([], [Result_6], ['query']),
    'GetUserIdForSli' : IDL.Func([], [Result_6], ['query']),
    'GetUserRole' : IDL.Func([], [UserRole], ['query']),
    'GldsIcrc1_AutoTransferTokens' : IDL.Func(
        [IDL.Text, Balance__1],
        [Result_5],
        [],
      ),
    'GldsIcrc1_BurnTokens' : IDL.Func([Balance], [Result_4], []),
    'GldsIcrc1_GetCanisterId' : IDL.Func([], [IDL.Text], ['query']),
    'GldsIcrc1_GetCurrentTotalSupply' : IDL.Func([], [Result_3], []),
    'GldsIcrc1_GetCurrentTransferFee' : IDL.Func([], [Result_3], []),
    'GldsIcrc1_SetCanisterId' : IDL.Func([IDL.Principal], [Result], []),
    'RemoveAdminUser' : IDL.Func([IDL.Principal], [Result], []),
    'ShowBurningAllowedPrincipal' : IDL.Func([], [IDL.Text], []),
    'SliIcrc1_AutoTransferTokens' : IDL.Func(
        [IDL.Text, Balance__1],
        [Result_5],
        [],
      ),
    'SliIcrc1_BurnTokens' : IDL.Func([Balance__1], [Result_4], []),
    'SliIcrc1_GetCanisterId' : IDL.Func([], [IDL.Text], ['query']),
    'SliIcrc1_GetCurrentTotalSupply' : IDL.Func([], [Result_3], []),
    'SliIcrc1_GetCurrentTransferFee' : IDL.Func([], [Result_3], []),
    'SliIcrc1_SetCanisterId' : IDL.Func([IDL.Principal], [Result], []),
    'add_burning_allowances' : IDL.Func([], [Result_2], []),
    'add_burning_allowed_principal' : IDL.Func([IDL.Principal], [Result], []),
    'archive_cycles_balance' : IDL.Func([], [IDL.Nat], []),
    'archive_get_canisterId' : IDL.Func([], [Result_1], ['query']),
    'archive_set_canisterId' : IDL.Func([IDL.Principal], [Result], []),
    'changing_icrc1_canister_ids_has_locked_state' : IDL.Func(
        [],
        [IDL.Bool],
        ['query'],
      ),
    'cycles_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'deposit_cycles' : IDL.Func([], [], []),
    'set_changing_icrc1_canister_ids_to_locked_state' : IDL.Func(
        [],
        [Result],
        [],
      ),
  });
};

// export const SwapAppActorInterface = ({ IDL }) => {
//   const Result = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });
//   const Result_4 = IDL.Variant({ 'ok': IDL.Nat, 'err': IDL.Text });
//   const ResponseGetUsersSwapWallet = IDL.Variant({
//     'Ok': IDL.Principal,
//     'Err': IDL.Text,
//     'NotExist': IDL.Null,
//   });
//   const Balance = IDL.Nat;
//   const Result_2 = IDL.Variant({ 'ok': Balance, 'err': IDL.Text });
//   const Metadata = IDL.Record({
//     'fee': IDL.Nat,
//     'decimals': IDL.Nat,
//     'logo': IDL.Text,
//     'name': IDL.Text,
//     'symbol': IDL.Text,
//     'canisterId': IDL.Text,
//   });
//   const TokensInfoAsResponse = IDL.Record({
//     'Icrc1_Glds': Metadata,
//     'Dip20_Sli': Metadata,
//     'Dip20_Glds': Metadata,
//     'Icrc1_Sli': Metadata,
//   });
//   const Result_3 = IDL.Variant({ 'ok': IDL.Vec(IDL.Nat8), 'err': IDL.Text });
//   const UserRole = IDL.Variant({
//     'Anonymous': IDL.Null,
//     'NormalUser': IDL.Null,
//     'Admin': IDL.Null,
//     'Owner': IDL.Null,
//   });
//   const Result_1 = IDL.Variant({ 'ok': IDL.Principal, 'err': IDL.Text });
//   return IDL.Service({
//     'AddAdminUser': IDL.Func([IDL.Principal], [Result], []),
//     'AddNewApprovedGldsWallet': IDL.Func([IDL.Principal], [Result], []),
//     'AddNewApprovedSliWallet': IDL.Func([IDL.Principal], [Result], []),
//     'ApprovedWalletsPrincipalExist': IDL.Func(
//       [IDL.Principal],
//       [IDL.Bool],
//       ['query'],
//     ),
//     'CanUserDepositGldsDip20': IDL.Func([IDL.Principal], [Result], ['query']),
//     'CanUserDepositSliDip20': IDL.Func([IDL.Principal], [Result], ['query']),
//     'ConvertOldGldsDip20Tokens': IDL.Func([IDL.Vec(IDL.Nat8)], [Result], []),
//     'ConvertOldSliDip20Tokens': IDL.Func([IDL.Vec(IDL.Nat8)], [Result], []),
//     'DepositGldsDip20Tokens': IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
//     'DepositSliDip20Tokens': IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
//     'GetGldsDip20DepositedAmount': IDL.Func([], [Result_4], []),
//     'GetGldsSwapWalletForPrincipal': IDL.Func(
//       [IDL.Principal],
//       [ResponseGetUsersSwapWallet],
//       ['query'],
//     ),
//     'GetIcrc1Balance': IDL.Func([IDL.Principal], [Result_2], []),
//     'GetListOfAdminUsers': IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
//     'GetNumberOfGldsApprovedWallets': IDL.Func(
//       [],
//       [IDL.Nat, IDL.Nat],
//       ['query'],
//     ),
//     'GetNumberOfSliApprovedWallets': IDL.Func(
//       [],
//       [IDL.Nat, IDL.Nat],
//       ['query'],
//     ),
//     'GetSliDip20DepositedAmount': IDL.Func([], [Result_4], []),
//     'GetSliSwapWalletForPrincipal': IDL.Func(
//       [IDL.Principal],
//       [ResponseGetUsersSwapWallet],
//       ['query'],
//     ),
//     'GetSwapAppPrincipalText': IDL.Func([], [IDL.Text], ['query']),
//     'GetTokensInfos': IDL.Func([], [TokensInfoAsResponse], ['query']),
//     'GetUserIdForGlds': IDL.Func([], [Result_3], ['query']),
//     'GetUserIdForSli': IDL.Func([], [Result_3], ['query']),
//     'GetUserRole': IDL.Func([], [UserRole], ['query']),
//     'GldsIcrc1_GetCanisterId': IDL.Func([], [IDL.Text], ['query']),
//     'GldsIcrc1_GetCurrentTotalSupply': IDL.Func([], [Result_2], []),
//     'GldsIcrc1_GetCurrentTransferFee': IDL.Func([], [Result_2], []),
//     'GldsIcrc1_SetCanisterId': IDL.Func([IDL.Principal], [Result], []),
//     'RemoveAdminUser': IDL.Func([IDL.Principal], [Result], []),
//     'SliIcrc1_GetCanisterId': IDL.Func([], [IDL.Text], ['query']),
//     'SliIcrc1_GetCurrentTotalSupply': IDL.Func([], [Result_2], []),
//     'SliIcrc1_GetCurrentTransferFee': IDL.Func([], [Result_2], []),
//     'SliIcrc1_SetCanisterId': IDL.Func([IDL.Principal], [Result], []),
//     'archive_cycles_balance': IDL.Func([], [IDL.Nat], []),
//     'archive_get_canisterId': IDL.Func([], [Result_1], ['query']),
//     'archive_set_canisterId': IDL.Func([IDL.Principal], [Result], []),
//     'changing_icrc1_canister_ids_has_locked_state': IDL.Func(
//       [],
//       [IDL.Bool],
//       ['query'],
//     ),
//     'cycles_balance': IDL.Func([], [IDL.Nat], ['query']),
//     'deposit_cycles': IDL.Func([], [], []),
//     'set_changing_icrc1_canister_ids_to_locked_state': IDL.Func(
//       [],
//       [Result],
//       [],
//     ),
//   });

// };


export const TrabyterTokenInterface = ({ IDL }) => {
  const ArchiveInterface = IDL.Rec();
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Balance__3 = IDL.Nat;
  const CanisterStatsResponse = IDL.Record({
    'cycles_balance' : Balance__3,
    'principal' : IDL.Text,
    'name' : IDL.Text,
  });
  const CanisterAutoTopUpDataResponse = IDL.Record({
    'autoCyclesTopUpTimerId' : IDL.Nat,
    'autoCyclesTopUpMinutes' : IDL.Nat,
    'autoCyclesTopUpEnabled' : IDL.Bool,
    'autoCyclesTopUpOccuredNumberOfTimes' : IDL.Nat,
  });
  const BackupType = IDL.Variant({
    'tokenCommonData' : IDL.Null,
    'tokenTransactionsBuffer' : IDL.Null,
    'tokenAccounts' : IDL.Null,
  });
  const BackupParameter = IDL.Record({
    'currentIndex' : IDL.Opt(IDL.Nat),
    'backupType' : BackupType,
    'chunkCount' : IDL.Opt(IDL.Nat),
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Tuple(IDL.Bool, IDL.Vec(IDL.Nat8)),
    'err' : IDL.Text,
  });
  const Subaccount__1 = IDL.Vec(IDL.Nat8);
  const Balance__2 = IDL.Nat;
  const BurnArgs = IDL.Record({
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(Subaccount__1),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance__2,
  });
  const TxIndex = IDL.Nat;
  const Timestamp = IDL.Nat64;
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : Balance__2 }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : TxIndex }),
    'BadFee' : IDL.Record({ 'expected_fee' : Balance__2 }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : Timestamp }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Balance__2 }),
  });
  const TransferResult = IDL.Variant({ 'Ok' : TxIndex, 'Err' : TransferError });
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Account__2 = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(Subaccount),
  });
  const Account__1 = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(Subaccount),
  });
  const AllowanceInfo = IDL.Record({
    'allowance' : IDL.Nat,
    'expires_at' : IDL.Opt(IDL.Nat64),
    'spender' : Account__1,
  });
  const Burn = IDL.Record({
    'from' : Account__1,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance__2,
  });
  const Mint = IDL.Record({
    'to' : Account__1,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance__2,
  });
  const Transfer = IDL.Record({
    'to' : Account__1,
    'fee' : Balance__2,
    'from' : Account__1,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance__2,
  });
  const Transaction__1 = IDL.Record({
    'burn' : IDL.Opt(Burn),
    'kind' : IDL.Text,
    'mint' : IDL.Opt(Mint),
    'timestamp' : Timestamp,
    'index' : TxIndex,
    'transfer' : IDL.Opt(Transfer),
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const TxIndex__1 = IDL.Nat;
  const GetTransactionsRequest__1 = IDL.Record({
    'start' : TxIndex,
    'length' : IDL.Nat,
  });
  const Transaction = IDL.Record({
    'burn' : IDL.Opt(Burn),
    'kind' : IDL.Text,
    'mint' : IDL.Opt(Mint),
    'timestamp' : Timestamp,
    'index' : TxIndex,
    'transfer' : IDL.Opt(Transfer),
  });
  const TransactionRange__1 = IDL.Record({
    'transactions' : IDL.Vec(Transaction),
  });
  ArchiveInterface.fill(
    IDL.Service({
      'append_transactions' : IDL.Func(
          [IDL.Vec(Transaction__1)],
          [Result_1],
          [],
        ),
      'cycles_available' : IDL.Func([], [IDL.Nat], ['query']),
      'deposit_cycles' : IDL.Func([], [], []),
      'get_first_tx' : IDL.Func([], [IDL.Nat], ['query']),
      'get_last_tx' : IDL.Func([], [IDL.Nat], ['query']),
      'get_next_archive' : IDL.Func([], [ArchiveInterface], ['query']),
      'get_prev_archive' : IDL.Func([], [ArchiveInterface], ['query']),
      'get_transaction' : IDL.Func(
          [TxIndex__1],
          [IDL.Opt(Transaction__1)],
          ['query'],
        ),
      'get_transactions' : IDL.Func(
          [GetTransactionsRequest__1],
          [TransactionRange__1],
          ['query'],
        ),
      'get_transactions_by_principal' : IDL.Func(
          [IDL.Principal, IDL.Nat, IDL.Nat],
          [IDL.Vec(Transaction__1)],
          ['query'],
        ),
      'get_transactions_by_principal_count' : IDL.Func(
          [IDL.Principal],
          [IDL.Nat],
          ['query'],
        ),
      'heap_max' : IDL.Func([], [IDL.Nat], ['query']),
      'heap_total_used' : IDL.Func([], [IDL.Nat], ['query']),
      'init' : IDL.Func([IDL.Nat, IDL.Nat, IDL.Nat], [IDL.Principal], []),
      'max_memory' : IDL.Func([], [IDL.Nat], ['query']),
      'memory_is_full' : IDL.Func([], [IDL.Bool], ['query']),
      'memory_total_used' : IDL.Func([], [IDL.Nat], ['query']),
      'remaining_heap_capacity' : IDL.Func([], [IDL.Nat], ['query']),
      'remaining_memory_capacity' : IDL.Func([], [IDL.Nat], ['query']),
      'set_next_archive' : IDL.Func([ArchiveInterface], [Result_1], []),
      'set_prev_archive' : IDL.Func([ArchiveInterface], [Result_1], []),
      'total_transactions' : IDL.Func([], [IDL.Nat], ['query']),
    })
  );
  const AccountBalanceInfo = IDL.Record({
    'balance' : Balance__3,
    'account' : Account__2,
  });
  const GetTransactionsRequest = IDL.Record({
    'start' : TxIndex,
    'length' : IDL.Nat,
  });
  const TransactionRange = IDL.Record({
    'transactions' : IDL.Vec(Transaction),
  });
  const QueryArchiveFn = IDL.Func(
      [GetTransactionsRequest],
      [TransactionRange],
      ['query'],
    );
  const ArchivedTransaction = IDL.Record({
    'callback' : QueryArchiveFn,
    'start' : TxIndex,
    'length' : IDL.Nat,
  });
  const GetTransactionsResponse = IDL.Record({
    'first_index' : TxIndex,
    'log_length' : IDL.Nat,
    'transactions' : IDL.Vec(Transaction),
    'archived_transactions' : IDL.Vec(ArchivedTransaction),
  });
  const Balance__1 = IDL.Nat;
  const Value = IDL.Variant({
    'Int' : IDL.Int,
    'Nat' : IDL.Nat,
    'Blob' : IDL.Vec(IDL.Nat8),
    'Text' : IDL.Text,
  });
  const MetaDatum = IDL.Tuple(IDL.Text, Value);
  const SupportedStandard = IDL.Record({ 'url' : IDL.Text, 'name' : IDL.Text });
  const TransferArgs = IDL.Record({
    'to' : Account__1,
    'fee' : IDL.Opt(Balance__2),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(Subaccount__1),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance__2,
  });
  const AllowanceArgs = IDL.Record({
    'account' : Account__1,
    'spender' : Account__1,
  });
  const Allowance = IDL.Record({
    'allowance' : IDL.Nat,
    'expires_at' : IDL.Opt(IDL.Nat64),
  });
  const Memo = IDL.Vec(IDL.Nat8);
  const ApproveArgs = IDL.Record({
    'fee' : IDL.Opt(Balance__2),
    'memo' : IDL.Opt(Memo),
    'from_subaccount' : IDL.Opt(Subaccount__1),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance__2,
    'expected_allowance' : IDL.Opt(IDL.Nat),
    'expires_at' : IDL.Opt(IDL.Nat64),
    'spender' : Account__1,
  });
  const ApproveError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'AllowanceChanged' : IDL.Record({ 'current_allowance' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'Expired' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const ApproveResult = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : ApproveError });
  const TransferFromArgs = IDL.Record({
    'to' : Account__1,
    'fee' : IDL.Opt(Balance__2),
    'spender_subaccount' : IDL.Opt(Subaccount__1),
    'from' : Account__1,
    'memo' : IDL.Opt(Memo),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : Balance__2,
  });
  const TransferFromError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const TransferFromResponse = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : TransferFromError,
  });
  const RestoreInfo = IDL.Record({
    'isFirstChunk' : IDL.Bool,
    'dataType' : BackupType,
    'bytes' : IDL.Vec(IDL.Nat8),
  });
  const SetParameterError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
  });
  const SetNat8ParameterResult = IDL.Variant({
    'Ok' : IDL.Nat8,
    'Err' : SetParameterError,
  });
  const Balance = IDL.Nat;
  const SetBalanceParameterResult = IDL.Variant({
    'Ok' : Balance,
    'Err' : SetParameterError,
  });
  const SetTextParameterResult = IDL.Variant({
    'Ok' : IDL.Text,
    'Err' : SetParameterError,
  });
  return IDL.Service({
    'admin_add_admin_user' : IDL.Func([IDL.Principal], [Result], []),
    'admin_remove_admin_user' : IDL.Func([IDL.Principal], [Result], []),
    'all_canister_stats' : IDL.Func([], [IDL.Vec(CanisterStatsResponse)], []),
    'auto_topup_cycles_disable' : IDL.Func([], [Result], []),
    'auto_topup_cycles_enable' : IDL.Func([IDL.Opt(IDL.Nat)], [Result], []),
    'auto_topup_cycles_status' : IDL.Func(
        [],
        [CanisterAutoTopUpDataResponse],
        ['query'],
      ),
    'backup' : IDL.Func([BackupParameter], [Result_2], []),
    'burn' : IDL.Func([BurnArgs], [TransferResult], []),
    'cycles_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'deposit_cycles' : IDL.Func([], [], []),
    'feewhitelisting_add_principal' : IDL.Func([IDL.Principal], [Result], []),
    'feewhitelisting_get_list' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'feewhitelisting_remove_principal' : IDL.Func(
        [IDL.Principal],
        [Result],
        [],
      ),
    'get_allowance_list' : IDL.Func(
        [Account__2],
        [IDL.Vec(AllowanceInfo)],
        ['query'],
      ),
    'get_archive' : IDL.Func([], [ArchiveInterface], ['query']),
    'get_archive_stored_txs' : IDL.Func([], [IDL.Nat], ['query']),
    'get_burned_amount' : IDL.Func([], [IDL.Nat], ['query']),
    'get_holders' : IDL.Func(
        [IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],
        [IDL.Vec(AccountBalanceInfo)],
        ['query'],
      ),
    'get_holders_count' : IDL.Func([], [IDL.Nat], ['query']),
    'get_max_supply' : IDL.Func([], [IDL.Nat], ['query']),
    'get_total_tx' : IDL.Func([], [IDL.Nat], ['query']),
    'get_transaction' : IDL.Func([TxIndex], [IDL.Opt(Transaction)], []),
    'get_transactions' : IDL.Func(
        [GetTransactionsRequest],
        [GetTransactionsResponse],
        ['query'],
      ),
    'get_transactions_by_index' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(Transaction)],
        [],
      ),
    'get_transactions_by_principal' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [IDL.Vec(Transaction)],
        [],
      ),
    'get_transactions_by_principal_count' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat],
        [],
      ),
    'icrc1_balance_of' : IDL.Func([Account__2], [Balance__1], ['query']),
    'icrc1_decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee' : IDL.Func([], [Balance__1], ['query']),
    'icrc1_metadata' : IDL.Func([], [IDL.Vec(MetaDatum)], ['query']),
    'icrc1_minting_account' : IDL.Func([], [IDL.Opt(Account__2)], ['query']),
    'icrc1_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_supported_standards' : IDL.Func(
        [],
        [IDL.Vec(SupportedStandard)],
        ['query'],
      ),
    'icrc1_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_total_supply' : IDL.Func([], [Balance__1], ['query']),
    'icrc1_transfer' : IDL.Func([TransferArgs], [TransferResult], []),
    'icrc2_allowance' : IDL.Func([AllowanceArgs], [Allowance], ['query']),
    'icrc2_approve' : IDL.Func([ApproveArgs], [ApproveResult], []),
    'icrc2_transfer_from' : IDL.Func(
        [TransferFromArgs],
        [TransferFromResponse],
        [],
      ),
    'list_admin_users' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'min_burn_amount' : IDL.Func([], [Balance__1], ['query']),
    'mint' : IDL.Func([Mint], [TransferResult], []),
    'real_fee' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [Balance__1],
        ['query'],
      ),
    'restore' : IDL.Func([RestoreInfo], [Result], []),
    'set_decimals' : IDL.Func([IDL.Nat8], [SetNat8ParameterResult], []),
    'set_fee' : IDL.Func([Balance__1], [SetBalanceParameterResult], []),
    'set_logo' : IDL.Func([IDL.Text], [SetTextParameterResult], []),
    'set_min_burn_amount' : IDL.Func(
        [Balance__1],
        [SetBalanceParameterResult],
        [],
      ),
    'set_name' : IDL.Func([IDL.Text], [SetTextParameterResult], []),
    'set_symbol' : IDL.Func([IDL.Text], [SetTextParameterResult], []),
    'token_operation_continue' : IDL.Func([], [Result], []),
    'token_operation_pause' : IDL.Func([IDL.Nat], [Result], []),
    'token_operation_status' : IDL.Func([], [IDL.Text], ['query']),
    'tokens_amount_downscale' : IDL.Func([IDL.Nat8], [Result], []),
    'tokens_amount_upscale' : IDL.Func([IDL.Nat8], [Result], []),
  });
};