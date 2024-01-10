import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Result "mo:base/Result";
import List "mo:base/List";
import Text "mo:base/Text";
import T "../Types/TypesCommon";
import lib "../Modules/lib";
import Interfaces "../Interfaces/Interfaces";
import TypesCommon "../Types/TypesCommon";
import Icrc1 "../Types/TypesICRC1";
import Error "mo:base/Error";
import { setTimer; recurringTimer;cancelTimer } = "mo:base/Timer";


shared ({ caller = creator }) actor class SliSwapApp():async Interfaces.InterfaceSwapApp = this{

  stable var wasInitialized = false;
  stable var initializeTimerId = 0;

  stable var appSettings:T.AppSettings = lib.SwapAppInit(creator);
  stable var tokensInfo:T.TokensInfo = lib.TokensInfoInit();

  
  //Returns the current user-role
  public shared query ({ caller }) func GetUserRole():async T.UserRole{        
     return lib.GetUserRole(appSettings, caller);    
  };

  //Returns the principal (==canisterId) of this dApp
  public shared query func GetSwapAppPrincipalText():async Text{    
    let principal:Principal = Principal.fromActor(this);
    return Principal.toText(principal);
  };


  //------------------------------------------------------------------------------
  //Sli related
  
  public shared query func SliIcrc1_GetCanisterId(): async Text{
    return tokensInfo.Icrc1_Sli.canisterId;            
  };

  public shared query func SliIcrc1_GetMetadata(): async TypesCommon.Metadata{
    return tokensInfo.Icrc1_Sli;            
  };

   //Set the sli-icrc1-canisterId for the token that should be transfered to users during the conversion process
  public shared ({caller}) func SliIcrc1_SetCanisterId (canisterId:Text): async Result.Result<Text, Text>{        
    var result = await* lib.SliIcrc1_SetCanisterId(caller,appSettings,tokensInfo, canisterId);    
    Debug.print("Metadatas:");
    Debug.print(debug_show(tokensInfo));
    return result;
  };


  //------------------------------------------------------------------------------
  

  //------------------------------------------------------------------------------
  //Glds related
  public shared query func GldsIcrc1_GetCanisterId(): async Text{
    return tokensInfo.Icrc1_Glds.canisterId;           
  };
  
  public shared query func GldsIcrc1_GetMetadata(): async TypesCommon.Metadata{
    return tokensInfo.Icrc1_Glds;            
  };

  //Set the glds-icrc1-canisterId for the token that should be transfered to users during the conversion process
  public shared ({caller}) func GldsIcrc1_SetCanisterId (canisterId:Text): async Result.Result<Text, Text>{        
    return await* lib.GldsIcrc1_SetCanisterId(caller,appSettings,tokensInfo,canisterId);    
  };


  //------------------------------------------------------------------------------


  public shared ({caller}) func AddAdminUser (principal:Text): async Result.Result<Text, Text>{
    return await* lib.AddAdminUser(caller, appSettings, principal);
  };

  public shared ({caller}) func RemoveAdminUser (principal:Text): async Result.Result<Text, Text>{
    return await* lib.RemoveAdminUser(caller, appSettings, principal);
  };

  public shared query func ListAdminUsers (): async [Text]{
        return lib.ListAdminUsers(appSettings);        
  };

  
  //Here create new deposit-address and encrypt this adress and send back 
  //new identity seed -> (principal + random text)
  // public shared ({ caller }) func GetDepositAddress():async Principal{

  //   Debug.print("principal: " #debug_show(caller));
  //   return Principal.fromText("aaaaa-aa");
  // };

  // public shared ({caller})func SetSwapAppUiPrincipal(UiPrincipal:Principal){


  // }

  public shared query func GetTokensInfos(): async T.TokensInfoAsResponse{

    let result:T.TokensInfoAsResponse = {
      Icrc1_Sli = tokensInfo.Icrc1_Sli;
      Dip20_Sli = tokensInfo.Dip20_Sli;
      Icrc1_Glds = tokensInfo.Icrc1_Glds;
      Dip20_Glds = tokensInfo.Dip20_Glds;
    };

    return result;
  };


    private func InitTokenMetaDatas(): async (){
      
      try
      {        
        ignore await* lib.SetTokenMetaDataByCanisterId(appSettings, tokensInfo, #Dip20Sli, "zzriv-cqaaa-aaaao-a2gjq-cai", creator);                
        ignore await* lib.SetTokenMetaDataByCanisterId(appSettings, tokensInfo, #Dip20Glds, "7a6j3-uqaaa-aaaao-a2g5q-cai", creator);                                
        cancelTimer(initializeTimerId);
        wasInitialized:=true;

      }
      catch(error)
      {
        
      }
      
    };
    
    wasInitialized:=false;
    if (wasInitialized == false){
        initializeTimerId := setTimer(#seconds 1, func():async(){ 
           await InitTokenMetaDatas();
        });             
    };



      system func inspect(args : {caller : Principal;arg : Blob;}) : Bool {
        let caller = args.caller;       
        let msgArg = args.arg;

        //Set max allowed passed argument size to 1024 bytes, 
        //because 'Text' is provided as argument in some of the above methods.
        if (msgArg.size() > 1024) { return false };       
        return true;
    };

};



