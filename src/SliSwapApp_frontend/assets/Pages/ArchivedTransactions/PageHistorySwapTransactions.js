import { GetResultFromVariant, ConvertResponseToConversionCompletedArchiveItem } from "../../modules/Utils/CommonUtils";
import { SliSwapApp_archive } from "../../../../declarations/SliSwapApp_archive";


var archiveCompletedTransactions = new Array();
var archiveCompletedTransactions_filter = "";

function HistoryTransactions_HtmlPage_Exist() {

    return document.getElementById('ArchiveTransactions_HtmlPage') != null;
}


function applyFiler() {
    archiveCompletedTransactions_filter = document.getElementById('ArchiveTransactions_filterInput').value;
    archiveCompletedTransactions_filter = archiveCompletedTransactions_filter.replace(/\s/g, "");
    historyTransactions_UpdateUiFromModel();
}

function FilterFound(item) {

    let search = archiveCompletedTransactions_filter.toLowerCase();
    if (item.UserPrincipal.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.AmountDecimal.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.TimeLocalTimeString.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.TokenType.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.ConversionId.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }
    return false;
}

function historyTransactions_UpdateUiFromModel() {

    if (HistoryTransactions_HtmlPage_Exist() == false) {
        return;
    }

    var htmlString = "";

    let filterHasContent = archiveCompletedTransactions_filter.length > 0;


    for (var i = 0; i < archiveCompletedTransactions.length; i++) {

        let item = archiveCompletedTransactions[i];

        if (filterHasContent == true) {

            if (FilterFound(item) == false) {
                continue;
            }
        }

        if (item.IsSliToken == true) {
            htmlString += "<tr class=\"spaceUnder\" style=\"font-size: 12px;background-color: rgb(67, 2, 220);vertical-align: middle;\">\n";

        } else {
            htmlString += "<tr class=\"spaceUnder\" style=\"font-size: 12px;background-color: rgb(37, 5, 112);vertical-align: middle;\">\n";
        }
        htmlString += "<td style=\"font-size: 12px;width: 150px;padding-left: 8px;\">";
        htmlString += item.TimeLocalTimeString + "</td>\n";

        htmlString += "<td style=\"font-size: 12px;width: 55px;padding-left: 8px;\">";
        htmlString += item.TokenType + "</td>\n";

        htmlString += "<td style=\"font-size: 12px;width: 80px;padding-left: 8px;\">";
        htmlString += item.AmountDecimal + "</td>\n";

        htmlString += "<td style=\"font-size: 12px;width: 150px;padding-left: 8px;\">";
        htmlString += item.TransactionIndex + "</td>\n";

        htmlString += "<td style=\"font-size: 12px;width: 450px;padding-left: 8px;\">";
        htmlString += item.UserPrincipal + "</td>\n";

        htmlString += "<td style=\"font-size: 12px;width: 450px;padding-left: 8px;\">";
        htmlString += item.ConversionId + "</td>\n";

        htmlString += "</tr>\n";
    }

    document.getElementById('ArchiveTransaction_tbody').innerHTML = htmlString;

}


function setTableBodySizeAutomatically() {
    let elementTableBody = document.getElementById('ArchiveTransaction_tbody');
    let elementSwapControl = document.getElementById('ArchiveTransactions_swapControl');

    const height = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight;
    var newHeight = height - 250;
    newHeight = Math.max(newHeight, 350);

    elementSwapControl.style.height = newHeight + "px";
    elementTableBody.style.height = (newHeight - 200) + "px";

}

export const historyTransactions_init = async function initHistoryTransactions() {

    if (HistoryTransactions_HtmlPage_Exist() == false) {
        return;
    }
    document.getElementById('ArchiveTransactions_filterInput').value = archiveCompletedTransactions_filter;

    setTableBodySizeAutomatically();

    window.removeEventListener('resize', function (event) {
        setTableBodySizeAutomatically();
    }, true);

    window.addEventListener('resize', function (event) {
        setTableBodySizeAutomatically();
    }, true);

    historyTransactions_UpdateUiFromModel();

    let elementApplyFilter = document.getElementById('ArchiveTransactions_button_filter_apply');
    if (elementApplyFilter != null) {
        elementApplyFilter.removeEventListener('click', async () => { applyFiler(); });
        elementApplyFilter.addEventListener('click', async () => { applyFiler(); });
    }

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
            try {
                let newItem = ConvertResponseToConversionCompletedArchiveItem(arrayOfAllItems[index]);
                archiveCompletedTransactions.push(newItem);
            }
            catch (error) {
                //do nothing
            }

            index++;
        }
    }
    archiveCompletedTransactions.sort(function (a, b) {
        return b.RawTimeTicks - a.RawTimeTicks;
    });

    historyTransactions_UpdateUiFromModel();


}