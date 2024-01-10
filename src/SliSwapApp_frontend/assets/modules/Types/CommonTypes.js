import {createEnum} from "../Utils/CommonUtils";
import {IdentiyProvider} from "../identityProvider";
import {SwapAppActorFetcher} from "../SubModules/ActorFetchers/SwapAppActorFetcher";

// export const TokenInterfaceType = createEnum(['Dip20', 'Icrc1']);
export const SpecifiedTokenInterfaceType = createEnum(['Dip20Sli','Dip20Glds', 'Icrc1Sli','Icrc1Glds']);
export const WalletTypes = createEnum(['NoWallet','plug','stoic', 'dfinity']);
export const ResultTypes = createEnum(['ok','err','unknown']);
export const pageIds = createEnum(
  [
    'mainContentPageId','leftContentPageId'
  ]
);

export const pageIdValues = createEnum(
  [
    'PageConvertSliDip20','PageConvertGldsDip20',
   'PageStartPage', 'PageHistorySwapTransactions', 'PageAdminSection'
  ]
);

export class ResultInfo{
    Result;
    ResultText;

    constructor(result = ResultTypes.unknown, resultText = "")
    {
      this.Result = result;
      this.ResultText = resultText;
    }
    
};

export class MetadataInfo{  
    Fee;
    Decimals;
    OWner;
    Logo;
    Name;
    TotalSupply;
    Symbol;
  }

  export const CommonIdentityProvider = new IdentiyProvider();
  export const SwapAppActorProvider = new SwapAppActorFetcher();