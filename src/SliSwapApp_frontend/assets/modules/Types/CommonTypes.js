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
    'PageStartPage', 'PageHistorySwapTransactions', 'PageAdminSection'
  ]
)

export class ResultInfo {
  Result;
  ResultValue;

  constructor(result = ResultTypes.unknown, resultValue = "") {
    this.Result = result;
    this.ResultValue = resultValue;
  }

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

export const CommonIdentityProvider = new IdentiyProvider();
export const SwapAppActorProvider = new SwapAppActorFetcher();