import { GetResultFromVariant, ConvertResponseToConversionStartedArchiveItem,ConvertResponseToConversionCompletedArchiveItem } from "../../modules/Utils/CommonUtils";
import { SliSwapApp_archive } from "../../../../declarations/SliSwapApp_archive";


var archiveCompletedTransactions = new Array();
var archiveStartedTransactions = new Array();
var archiveDeposits = new Array();
var ArchiveDepositsTransactions_filterInput = "";

function HistoryDepositsTransactions_HtmlPage_Exist(){

    return document.getElementById('ArchiveDepositsTransactions_HtmlPage') != null;
}


function applyFiler(){
    ArchiveDepositsTransactions_filterInput = document.getElementById('ArchiveDepositsTransactions_filterInput').value;
    ArchiveDepositsTransactions_filterInput = ArchiveDepositsTransactions_filterInput.replace(/\s/g, "");
    historyDepositsTransactions_UpdateUiFromModel();
}

function FilterFound(item){

    let search = ArchiveDepositsTransactions_filterInput.toLowerCase();
    if (item.UserPrincipal.toString().toLowerCase().indexOf(search) != -1){
        return true;
    }

    if (item.AmountDecimal.toString().toLowerCase().indexOf(search) != -1){
        return true;
    }

    if (item.TimeLocalTimeString.toString().toLowerCase().indexOf(search) != -1){
        return true;
    }

    if (item.TokenType.toString().toLowerCase().indexOf(search) != -1){
        return true;
    }

    if (item.ConversionId.toString().toLowerCase().indexOf(search) != -1){
        return true;
    }
    return false;
}

function historyDepositsTransactions_UpdateUiFromModel(){

    if (HistoryDepositsTransactions_HtmlPage_Exist() == false){
        return;
    }

    var htmlString = "";
   
    let filterHasContent = ArchiveDepositsTransactions_filterInput.length > 0;

    for(var i=0; i<archiveDeposits.length; i++){

        let item = archiveDeposits[i];

        if (filterHasContent == true){

             if (FilterFound(item) == false){
                continue;
             }
        }

        if (item.IsSliToken == true){
            htmlString+="<tr class=\"spaceUnder\" style=\"font-size: 12px;background-color: rgb(67, 2, 220);vertical-align: middle;\">\n";

        }else{
            htmlString+="<tr class=\"spaceUnder\" style=\"font-size: 12px;background-color: rgb(37, 5, 112);vertical-align: middle;\">\n";
        }
        htmlString+="<td style=\"font-size: 12px;width: 150px;padding-left: 8px;\">";
        htmlString+=item.TimeLocalTimeString + "</td>\n";

        htmlString+="<td style=\"font-size: 12px;width: 55px;padding-left: 8px;\">";
        htmlString+=item.TokenType + "</td>\n";

        htmlString+="<td style=\"font-size: 12px;width: 60px;padding-left: 8px;\">";
        htmlString+=item.AmountDecimal + "</td>\n";

        htmlString+="<td style=\"font-size: 12px;width: 450px;padding-left: 8px;\">";
        htmlString+=item.UserPrincipal + "</td>\n";
    
        htmlString+="<td style=\"font-size: 12px;width: 450px;padding-left: 8px;\">";
        htmlString+=item.ConversionId + "</td>\n";

        htmlString+="</tr>\n";
    }

    document.getElementById('ArchiveDepositsTransaction_tbody').innerHTML = htmlString;

}


function setTableBodySizeAutomatically(){
    let elementTableBody = document.getElementById('ArchiveDepositsTransaction_tbody');
    let elementSwapControl = document.getElementById('ArchiveDepositsTransactions_swapControl');

    const height = window.innerHeight|| document.documentElement.clientHeight|| 
    document.body.clientHeight;
    var newHeight = height - 250;
    newHeight = Math.max(newHeight, 350);

    elementSwapControl.style.height = newHeight + "px";
    elementTableBody.style.height  = (newHeight-200) + "px";
 
}

export const historyDepositsTransactions_init = async function initHistoryDepositsTransactions(){

    if (HistoryDepositsTransactions_HtmlPage_Exist() == false)
    {
        return;
    }
    document.getElementById('ArchiveDepositsTransactions_filterInput').value = ArchiveDepositsTransactions_filterInput;

    setTableBodySizeAutomatically();

    window.addEventListener('resize', function(event) {
        setTableBodySizeAutomatically();
    }, true);
    
    historyDepositsTransactions_UpdateUiFromModel();

    let elementApplyFilter = document.getElementById('ArchiveDepositsTransactions_button_filter_apply');
    if (elementApplyFilter != null) {
        elementApplyFilter.removeEventListener('click', async () => { applyFiler(); });
        elementApplyFilter.addEventListener('click', async () => { applyFiler(); });
    }

    await CreateCompletedConversionsItems();
    await CreateStartedConversionsItems();


    historyDepositsTransactions_UpdateUiFromModel();


}


async function CreateStartedConversionsItems() {
    let count = Number(await SliSwapApp_archive.conversion_Started_Total_Count());
    var bucketSize = 2;
    bucketSize = Math.min(bucketSize, count);
    archiveStartedTransactions = new Array();
    for (var i = 0; i < count; i += bucketSize) {

        let allItemsResponse = await SliSwapApp_archive.conversion_Started_Get_Items(BigInt(i), BigInt(bucketSize));
        let resultResponse = GetResultFromVariant(allItemsResponse);
      
        let arrayOfAllItems = resultResponse.ResultValue;
        console.log("conversion started elements");
        console.log(arrayOfAllItems);

        var index = 0;

        let maxIndex = i + bucketSize;
        maxIndex = Math.min(maxIndex, count);
        for (var j = i; j < maxIndex; j++) {
            let newItem = ConvertResponseToConversionStartedArchiveItem(arrayOfAllItems[index]);
            archiveStartedTransactions.push(newItem);
            index++;
        }
    }
    archiveStartedTransactions.sort(function (a, b) {
        return b.RawTimeTicks - a.RawTimeTicks;
    });

    console.log("archiveStartedTransactions");
    console.log(archiveStartedTransactions);
}

async function CreateCompletedConversionsItems() {
    let count = Number(await SliSwapApp_archive.conversion_Completed_Total_Count());
    var bucketSize = 500;
    bucketSize = Math.min(bucketSize, count);
    archiveCompletedTransactions = new Array();
    for (var i = 0; i < count; i += bucketSize) {

        let allItemsResponse = await SliSwapApp_archive.conversion_Completed_Get_Items(BigInt(i), BigInt(bucketSize));
        let resultResponse = GetResultFromVariant(allItemsResponse);
        let arrayOfAllItems = resultResponse.ResultValue;
        var index = 0;

        let maxIndex = i + bucketSize;
        maxIndex = Math.min(maxIndex, count);
        for (var j = i; j < maxIndex; j++) {
            let newItem = ConvertResponseToConversionCompletedArchiveItem(arrayOfAllItems[index]);
            archiveCompletedTransactions.push(newItem);
            index++;
        }
    }
    archiveCompletedTransactions.sort(function (a, b) {
        return b.RawTimeTicks - a.RawTimeTicks;
    });
}
