import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Result "mo:base/Result";
import List "mo:base/List";
import Text "mo:base/Text";
import T "../Types/TypesCommon";
import ICRC1 "../Types/TypesICRC1"

module{

    public type SliSwapAppInterface = actor{
        GetUserRole:shared query() -> async T.UserRole;
        GetSwapAppPrincipalText:shared query() -> async Text;
        
        SliIcrc1_SetCanisterId: shared (canisterId:Text) -> async Result.Result<Text, Text>;
        GldsIcrc1_SetCanisterId: shared (canisterId:Text) -> async Result.Result<Text, Text>;
        
        SliIcrc1_GetCanisterId: shared query () -> async Text;
        GldsIcrc1_GetCanisterId: shared query () -> async Text;

        AddAdminUser: shared(principal:Text) -> async Result.Result<Text, Text>;
        RemoveAdminUser: shared(principal:Text) -> async Result.Result<Text, Text>;
        GetListOfAdminUsers: shared query () -> async [Text];
        //IcrcGetMetaData: shared (canisterId:Text) -> async ICRC1.MetaData;
        //IcrcGetBalance: shared (canisterId:Text, principalText:Text)-> async Result.Result<ICRC1.Balance, Text>
    };

};
