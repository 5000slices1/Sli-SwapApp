import { GetResultFromVariant, GetCustomResultFromVariant, GetCustomDictionaryFromVariant, ConvertResponseToConversionStartedArchiveItem, ConvertResponseToConversionCompletedArchiveItem } from "../../modules/Utils/CommonUtils";
import { SliSwapApp_archive } from "../../../../declarations/SliSwapApp_archive";
import { ArchivedDepositItem } from "../../modules/Types/CommonTypes";
import { SpecifiedTokenInterfaceType } from "../../modules/Types/CommonTypes";
import { TokenBalance } from "../../modules/SubModules/Token/TokenBalance";
import { Principal } from "@dfinity/principal";
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
import { Buffer } from "buffer";


var archiveCompletedTransactions = new Array();
var archiveCompletedTransactionsMappingsConversionIdToIndex = {};

var archiveStartedTransactions = new Array();
var archiveStartedTransactionsMappingsConversionIdToIndex = {};
var archiveStartedTransactionsMappingsDepositIdsToIndex = {};

var archiveDeposits = new Array();
var ArchiveDepositsTransactions_filterInput = "";

function HistoryDepositsTransactions_HtmlPage_Exist() {

    return document.getElementById('ArchiveDepositsTransactions_HtmlPage') != null;
}


function applyFiler() {
    ArchiveDepositsTransactions_filterInput = document.getElementById('ArchiveDepositsTransactions_filterInput').value;
    ArchiveDepositsTransactions_filterInput = ArchiveDepositsTransactions_filterInput.replace(/\s/g, "");
    historyDepositsTransactions_UpdateUiFromModel();
}

function FilterFound(item) {

    let search = ArchiveDepositsTransactions_filterInput.toLowerCase();

    if (item.Amount.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.TimeLocalTimeString.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.TokenType.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.From.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.To.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.DepositId.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }


    if (item.ConversionId.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.ConversionStatusText.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.ConversionUsedOwnerPrincipal.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    if (item.ConversionUsedOwnerSubAccount.toString().toLowerCase().indexOf(search) != -1) {
        return true;
    }

    return false;
}

function historyDepositsTransactions_UpdateUiFromModel() {

    if (HistoryDepositsTransactions_HtmlPage_Exist() == false) {
        return;
    }

    var htmlString = "";

    let filterHasContent = ArchiveDepositsTransactions_filterInput.length > 0;

    for (var i = 0; i < archiveDeposits.length; i++) {

        let item = archiveDeposits[i];

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

        htmlString += "<td style=\"font-size: 12px;width: 80px;padding-left: 8px;\">";
        htmlString += item.TokenType + "</td>\n";

        htmlString += "<td style=\"font-size: 12px;width: 120px;padding-left: 8px;\">";
        htmlString += item.Amount + "</td>\n";

        htmlString += "<td style=\"width: 500px;font-size: 12px;padding: 0px; margin: 0px;\">";
        htmlString += "<table style=\"border: none;padding: 0px; margin-top: -10px;\nmargin-bottom: -10px;" +
            "margin-left: -10px;\n\">\n<tr style=\"height: 10px;\">\n<td style=\"border: none;width: 70px;height: 10px;\">\n" +
            "Deposit-ID:"
            + "\n</td>\n<td style=\"border: none;height: 10px;\">\n" +
            item.DepositId
            + "\n</td>\n</tr>\n\n<tr style=\"height: 10px;\">\n<td style=\"border: none;width: 70px;height: 10px;\">\n" +
            "From:"
            + "\n</td>\n<td style=\"border: none;height: 10px;\">\n" +
            item.From
            + "\n</td>\n</tr>\n\n<tr style=\"height: 10px;\">\n<td style=\"border: none;width: 70px;\nheight: 10px;\">\n" +
            "To:"
            + "\n</td>\n<td style=\"border: none;height: 0px;\">\n" +
            item.To
            + "\n</td>\n</tr>\n</table>";
        htmlString += "</td>";


        htmlString += "<td style=\"width: 640px;font-size: 12px;\">\n<table style=\"border: none;padding: 0px; margin-top: -20px;\nmargin-bottom: -20px;margin-left: -10px;\">\n \n<tr style=\"height: 10px;\">\n<td style=\"border: none;width: 160px;\nheight: 10px;\">\n" +
            "Status:"
            + "\n</td>\n<td style=\"border: none;height: 0px;\">\n" +
            item.ConversionStatusText
            + "\n</td>\n</tr>\n<tr style=\"height: 10px;\">\n<td style=\"border: none;width: 160px;height: 10px;\">\n" +
            "Conversion-Id:"
            + "\n</td>\n<td style=\"border: none;height: 10px;\">\n" +
            item.ConversionId
            + "\n</td>\n</tr>\n<tr style=\"height: 10px;\">\n<td style=\"border: none;width: 160px;height: 10px;\">\n" +
            "From Owner:"
            + "\n</td>\n<td style=\"border: none;height: 10px;\">\n" +
            item.ConversionUsedOwnerPrincipal
            + "\n</td>\n</tr>\n<tr style=\"height: 10px;\">\n<td style=\"border: none;width: 160px;height: 10px;\">\n" +
            "From Owner SubAccount:"
            + "\n</td>\n<td style=\"border: none;height: 10px;\">\n" +
            item.ConversionUsedOwnerSubAccount
            + "\n</td>\n</tr>\n\n</table>\n</td>";


        htmlString += "</tr>\n";

    }
    document.getElementById('ArchiveDepositsTransaction_tbody').innerHTML = htmlString;

}


function setDepositTableBodySizeAutomatically() {

    if (HistoryDepositsTransactions_HtmlPage_Exist() == false) {
        return;
    }

    let elementTableBody = document.getElementById('ArchiveDepositsTransaction_tbody');
    let elementSwapControl = document.getElementById('ArchiveDepositsTransactions_swapControl');

    const height = window.innerHeight || document.documentElement.clientHeight ||
        document.body.clientHeight;
    var newHeight = height - 250;
    newHeight = Math.max(newHeight, 350);

    elementSwapControl.style.height = newHeight + "px";
    elementTableBody.style.height = (newHeight - 200) + "px";

}



async function CreateDepositItems() {

    //We need these too, because some property values of these are needed
    await CreateCompletedConversionsItems();
    await CreateStartedConversionsItems();

    let count = Number(await SliSwapApp_archive.deposit_Total_Count());
    var bucketSize = 500;
    bucketSize = Math.min(bucketSize, count);
    archiveDeposits = new Array();
    let swapAppPrincipal = await SliSwapApp_backend.GetSwapAppPrincipalText();

    for (var i = 0; i < count; i += bucketSize) {

        let allItemsResponse = await SliSwapApp_archive.deposit_Get_Items(BigInt(i), BigInt(bucketSize));
        let resultResponse = GetResultFromVariant(allItemsResponse);

        let arrayOfAllItems = resultResponse.ResultValue;
        var index = 0;

        let maxIndex = i + bucketSize;
        maxIndex = Math.min(maxIndex, count);
        for (var j = i; j < maxIndex; j++) {
            try {
                let itemToProcess = arrayOfAllItems[index];
                let singleItem = GetCustomDictionaryFromVariant(itemToProcess);
                let tokenType = GetCustomResultFromVariant(singleItem['tokenType']);


                let result = new ArchivedDepositItem();
                result.ConversionStatusText = "&lt;Conversion Not started&gt;";
                if (tokenType.Result == SpecifiedTokenInterfaceType.Dip20Sli) {
                    result.IsSliToken = true;
                    result.IsGldsToken = false;
                    result.TokenType = "$SLI-DIP20";
                } else if (tokenType.Result == SpecifiedTokenInterfaceType.Dip20Glds) {

                    result.IsSliToken = false;
                    result.IsGldsToken = true;
                    result.TokenType = "$GLDS-DIP20";
                }

                let amount = singleItem['amount'];
                let tokenBalanceAmount = new TokenBalance(BigInt(amount), 8);
                let realAmount = singleItem['realAmount'];
                let tokenBalanceRealAmount = new TokenBalance(BigInt(realAmount), 8);
                result.Amount = tokenBalanceAmount.GetValue();
                result.RealAmount = tokenBalanceRealAmount.GetValue();

                result.From = Principal.fromHex(singleItem['from'].toHex()).toText();
                result.To = Principal.fromHex(singleItem['to'].toHex()).toText();
                result.DepositId = Buffer.from(singleItem['depositId']).toString('hex');;

                let timeTicksNanoSeconds = Number(singleItem['time']);
                let timeTicksMilliSeconds = Math.trunc(Number(timeTicksNanoSeconds / 1000000));
                let date = new Date(Number(timeTicksMilliSeconds));

                result.RawTimeTicks = Number(timeTicksMilliSeconds);
                result.DateTime = date;
                result.TimeLocalTimeString = date.toLocaleString();

                result.ConversionWasStarted = false;
                result.ConversionWasCompleted = false;
                result.ConversionId = "";
                result.ConversionUsedOwnerPrincipal = "";
                result.ConversionUsedOwnerSubAccount = "";

                let conversionStartedIndex = archiveStartedTransactionsMappingsDepositIdsToIndex[result.DepositId];

                if (conversionStartedIndex != null && conversionStartedIndex != undefined) {
                    let convStartedItem = archiveStartedTransactions.at(Number(conversionStartedIndex));
                    if (convStartedItem != null && convStartedItem != undefined) {


                        result.ConversionWasStarted = true;
                        result.ConversionId = convStartedItem.ConversionId;
                        result.ConversionUsedOwnerPrincipal = swapAppPrincipal;
                        result.ConversionUsedOwnerSubAccount = convStartedItem.SubAccount;
                        result.ConversionStatusText = "&lt;Conversion Started&gt;";

                        //check if conversion is also completed or not:
                        let convCompletedIndex = archiveCompletedTransactionsMappingsConversionIdToIndex[result.ConversionId];
                        if (convCompletedIndex != null && convCompletedIndex != undefined) {
                            let convCompletedItem = archiveCompletedTransactions.at(Number(convCompletedIndex));
                            if (convCompletedItem != null && convCompletedItem != undefined) {
                                result.ConversionWasCompleted = true;
                                result.ConversionStatusText = "&lt;Conversion Completed&gt;";
                            }
                        }
                    }
                }
                archiveDeposits.push(result);

            } catch (error) {
                //do nothing
            }

            index++;
        }
    }
    archiveDeposits.sort(function (a, b) {
        return b.RawTimeTicks - a.RawTimeTicks;
    });
}

async function CreateStartedConversionsItems() {
    let count = Number(await SliSwapApp_archive.conversion_Started_Total_Count());
    var bucketSize = 500;
    bucketSize = Math.min(bucketSize, count);
    archiveStartedTransactions = new Array();
    for (var i = 0; i < count; i += bucketSize) {

        let allItemsResponse = await SliSwapApp_archive.conversion_Started_Get_Items(BigInt(i), BigInt(bucketSize));
        let resultResponse = GetResultFromVariant(allItemsResponse);

        let arrayOfAllItems = resultResponse.ResultValue;
        var index = 0;

        let maxIndex = i + bucketSize;
        maxIndex = Math.min(maxIndex, count);
        for (var j = i; j < maxIndex; j++) {
            try {
                let newItem = ConvertResponseToConversionStartedArchiveItem(arrayOfAllItems[index]);
                archiveStartedTransactions.push(newItem);
            } catch (error) {
                //do nothing
            }

            index++;
        }
    }
    archiveStartedTransactions.sort(function (a, b) {
        return b.RawTimeTicks - a.RawTimeTicks;
    });

    archiveStartedTransactionsMappingsConversionIdToIndex = {};
    archiveStartedTransactionsMappingsDepositIdsToIndex = {};

    for (i = 0; i < archiveStartedTransactions.length; i++) {
        let item = archiveStartedTransactions[i];
        archiveStartedTransactionsMappingsConversionIdToIndex[item.ConversionId] = i;
        let depositIds = item.DepositIds;
        for (var u = 0; u < depositIds.length; u++) {
            let depositId = depositIds[u];
            archiveStartedTransactionsMappingsDepositIdsToIndex[depositId] = i;
        }
    }
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

    archiveCompletedTransactionsMappingsConversionIdToIndex = {};
    for (i = 0; i < archiveCompletedTransactions.length; i++) {
        let item = archiveCompletedTransactions[i];
        archiveCompletedTransactionsMappingsConversionIdToIndex[item.ConversionId] = i;
    }
}



export const historyDepositsTransactions_init = async function initHistoryDepositsTransactions() {

    if (HistoryDepositsTransactions_HtmlPage_Exist() == false) {
        return;
    }
    document.getElementById('ArchiveDepositsTransactions_filterInput').value = ArchiveDepositsTransactions_filterInput;

    setDepositTableBodySizeAutomatically();

    window.removeEventListener('resize', function (event) {
        setDepositTableBodySizeAutomatically();
    }, true);

    window.addEventListener('resize', function (event) {
        setDepositTableBodySizeAutomatically();
    }, true);

    historyDepositsTransactions_UpdateUiFromModel();

    let elementApplyFilter = document.getElementById('ArchiveDepositsTransactions_button_filter_apply');
    if (elementApplyFilter != null) {
        elementApplyFilter.removeEventListener('click', async () => { applyFiler(); });
        elementApplyFilter.addEventListener('click', async () => { applyFiler(); });
    }

    await CreateDepositItems();

    historyDepositsTransactions_UpdateUiFromModel();

}
