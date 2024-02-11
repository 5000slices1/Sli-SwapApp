import { createEnum } from "../Utils/CommonUtils";
import { IdentiyProvider } from "../identityProvider";
import { SwapAppActorFetcher } from "../SubModules/ActorFetchers/SwapAppActorFetcher";
import { TokenBalance } from "../SubModules/Token/TokenBalance";

// export const TokenInterfaceType = createEnum(['Dip20', 'Icrc1']);
export const SpecifiedTokenInterfaceType = createEnum(['Dip20Sli', 'Dip20Glds', 'Icrc1Sli', 'Icrc1Glds']);
export const WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
export const ResultTypes = createEnum(['ok', 'err', 'unknown']);
export const pageIds = createEnum(
  [
    'mainContentPageId', 'leftContentPageId'
  ]
)

export const pageIdValues = createEnum(
  [
    'PageConvertSliDip20', 'PageConvertGldsDip20',
    'PageStartPage', 'PageHistorySwapTransactions','PageHistorySwapDeposits' ,'PageAdminSection'
  ]
)

export class ResultInfo {
  Result;
  ResultValue;

  constructor(result = ResultTypes.unknown, resultValue) {
    this.Result = result;
    this.ResultValue = resultValue;
  }

}

export class CustomResultInfo {
  Result;
  ResultValue;

  constructor(result, resultValue) {
    this.Result = result;
    this.ResultValue = resultValue;
  }
}

export class ConversionCompletedArchiveItem{

  AmountBigInt;
  AmountDecimal;
  RawTimeTicks;
  DateTime;
  TimeLocalTimeString;
  TokenType;
  UserPrincipal;
  ConversionId;
  IsSliToken;
  IsGldsToken;
  SubAccount;
  TransactionIndex;
}

export class ConversionStartedArchiveItem{

  AmountBigInt;
  AmountDecimal;
  RawTimeTicks;
  DateTime;
  TimeLocalTimeString;
  TokenType;
  UserPrincipal;
  ConversionId;
  IsSliToken;
  IsGldsToken;
  DepositIds;
  SubAccount;
}

export class ArchivedDepositItem{
  TokenType;
  Amount;
  RealAmount;
  From;
  To;
  DepositId;
  DateTime;
  RawTimeTicks;
  TimeLocalTimeString;
  IsSliToken;
  IsGldsToken;

  ConversionId;
  ConversionWasStarted;
  ConversionWasCompleted;
  ConversionStatusText;

  ConversionUsedOwnerPrincipal;
  ConversionUsedOwnerSubAccount;

}


export class TokenInfo {
  canisterId;
  logo;
  name;
  symbol;
  decimals;
  fee;

  constructor() {
    this.canisterId = "";
    this.logo = "";
    this.name = "";
    this.symbol = "";
    this.decimals = 0;
    this.fee = new TokenBalance();
  }

  hasData() {
    if (this.canisterId != null && this.canisterId != undefined && this.canisterId.length > 0) {
      return true;
    }
    return false;
  }
}

export class TokenInfos {
  Icrc1_Sli;
  Dip20_Sli;

  Icrc1_Glds;
  Dip20_Glds;

  constructor() {

    this.Icrc1_Sli = new TokenInfo();
    this.Dip20_Sli = new TokenInfo();
    this.Icrc1_Glds = new TokenInfo();
    this.Dip20_Glds = new TokenInfo();
  }
}

export class GlobalData {

  ApprovedWallets_Sli_Free;
  ApprovedWallets_Sli_InUse;
  ApprovedWallets_Glds_Free;
  ApprovedWallets_Glds_InUse;

  Dip20Sli_amount_InUserWallet;
  Dip20Glds_amount_InUserWallet;
  SwapApp_CanisterId_Text;

  Icrc1_Sli_CanisterId;
  Icrc1_Sli_TokenLogo;
  Icrc1_Sli_TokenSymbol;
  Icrc1_Sli_TokenName;
  Icrc1_Sli_TokenDecimals;
  Icrc1_Sli_TokenTotalSupply;
  Icrc1_Sli_TokenTransferFee;
  Icrc1_Sli_Deposited_In_SwapApp;

  Icrc1_Glds_CanisterId;
  Icrc1_Glds_TokenLogo;
  Icrc1_Glds_TokenSymbol;
  Icrc1_Glds_TokenName;
  Icrc1_Glds_TokenDecimals;
  Icrc1_Glds_TokenTotalSupply;
  Icrc1_Glds_TokenTransferFee;
  Icrc1_Glds_Deposited_In_SwapApp;

  constructor(){
    this.Dip20Sli_amount_InUserWallet = 0.0;
    this.Dip20Glds_amount_InUserWallet = 0.0;
    this.SwapApp_CanisterId_Text = "";

    this.Icrc1_Sli_CanisterId = "";
    this.Icrc1_Sli_TokenLogo = "";
    this.Icrc1_Sli_TokenSymbol = "";
    this.Icrc1_Sli_TokenName = "";
    this.Icrc1_Sli_TokenDecimals = 0;
    this.Icrc1_Sli_TokenTotalSupply = 0.0;
    this.Icrc1_Sli_TokenTransferFee = 0.0;
    this.Icrc1_Sli_Deposited_In_SwapApp = 0.0;

    this.Icrc1_Glds_CanisterId = "";
    this.Icrc1_Glds_TokenLogo = "";
    this.Icrc1_Glds_TokenSymbol = "";
    this.Icrc1_Glds_TokenName = "";
    this.Icrc1_Glds_TokenDecimals = 0;
    this.Icrc1_Glds_TokenTotalSupply = 0.0;
    this.Icrc1_Glds_TokenTransferFee = 0.0;
    this.Icrc1_Glds_Deposited_In_SwapApp = 0.0;

    this.ApprovedWallets_Sli_Free = 0;
    this.ApprovedWallets_Sli_InUse = 0;
    this.ApprovedWallets_Glds_Free = 0;
    this.ApprovedWallets_Glds_InUse = 0;
  }
}



export const CommonIdentityProvider = new IdentiyProvider();
export const SwapAppActorProvider = new SwapAppActorFetcher();
export const GlobalDataProvider = new GlobalData();