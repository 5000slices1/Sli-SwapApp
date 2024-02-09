import { CommonIdentityProvider, SpecifiedTokenInterfaceType, SwapAppActorProvider } from "../../modules/Types/CommonTypes";
import { PubSub } from "../../modules/Utils/PubSub";
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { GetResultFromVariant, GetCustomResultFromVariant } from "../../modules/Utils/CommonUtils";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";
import { Principal } from "@dfinity/principal";
import { ResultTypes } from "../../modules/Types/CommonTypes";
import { SliSwapApp_archive } from "../../../../declarations/SliSwapApp_archive";







export const historyTransactions_init = async function initHistoryTransactions(){

    console.log("initHistoryTransactions");
    let count = await SliSwapApp_archive.conversion_Completed_Total_Count();
    console.log("conversion total count =");
    console.log(count);
    let allItemsResponse = await SliSwapApp_archive.conversion_Completed_Get_Items(BigInt(0) ,BigInt(count));
    console.log("list:");
    console.log(allItemsResponse);


    let resultResponse = GetResultFromVariant(allItemsResponse);
    let arrayOfAllItems =  resultResponse.ResultValue;
    console.log("array:");
    console.log(arrayOfAllItems);


}