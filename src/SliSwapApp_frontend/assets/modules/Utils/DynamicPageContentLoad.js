import { pageIds, pageIdValues } from "../Types/CommonTypes";
import { convertSliDip20_init } from "../../Pages/ConvertSliDip20/ConvertSliDip20";
import { convertGldsDip20_init } from "../../Pages/ConvertGldsDip20/ConvertGldsDip20";
import { admin_section_init } from "../../Pages/AdminSection/PageAdminSection";
import { historyTransactions_init } from "../../Pages/ArchivedTransactions/PageHistorySwapTransactions";
import { historyDepositsTransactions_init } from "../../Pages/ArchivedTransactions/PageHistorySwapDeposits";
async function init_javascript_code(tagValue) {


  switch (tagValue) {
    case pageIdValues.PageConvertSliDip20: {
      await convertSliDip20_init();
    }
      break;
    case pageIdValues.PageConvertGldsDip20: {
      await convertGldsDip20_init();
    }
      break;
    case pageIdValues.PageAdminSection: {
      await admin_section_init();
    }
      break;
    case pageIdValues.PageHistorySwapTransactions: {
      await historyTransactions_init();
    }
    case pageIdValues.PageHistorySwapDeposits: {

      await historyDepositsTransactions_init();
    }
      break;
    default:
      break;
  }
}


async function DynamicPageContentLoadRemoveAllPreviousContent() {
  var z, i, elmnt;
  z = document.getElementsByTagName("div");

  for (i = 0; i < z.length; i++) {

    elmnt = z[i];
    let enumValues = Object.values(pageIds);

    for (const key of enumValues) {

      let pageIdValue = elmnt.getAttribute(key)
      if (!pageIdValue) {
        continue;
      }
      elmnt.innerHTML = "";
    }
  }
}

export async function DynamicPageContentLoad(tagName, tagValueToSearch) {

  await DynamicPageContentLoadRemoveAllPreviousContent();

  var z, i, elmnt, xhttp;
  z = document.getElementsByTagName("div");

  var allNavigationButtons = document.getElementsByClassName("button-navigation");
    
  for (i = 0; i < allNavigationButtons.length; i++) {
    let item = allNavigationButtons[i];
    var id = item.getAttribute("id");
    if (id == tagValueToSearch) {
      item.classList.add("button-navigation-activated");
    }
    else {
      item.classList.remove("button-navigation-activated");
    }
  };

  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    let pageIdValue = elmnt.getAttribute(tagName)
    if (!pageIdValue) {
      continue;
    }
    if (pageIdValue != tagValueToSearch) {
      elmnt.innerHTML = "";
      continue;
    }

    let htmlSource = elmnt.getAttribute("html-source");
    if (!htmlSource) {
      continue;
    }


    /* Make an HTTP request using the attribute value as the file name: */
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function () {
      if (this.readyState == 4) {
        if (this.status == 200) {
          var htmlToShow = this.responseText;
          htmlToShow += "<br/><br/><br/><br/><br/>"; // so that footer is not overlapping content during scrolling
          elmnt.innerHTML = htmlToShow;
          await init_javascript_code(tagValueToSearch);
        }
        if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
      }
    }
    xhttp.open("GET", htmlSource, true);
    xhttp.send();

    return;
  }
}


export async function DynamicPageContentLoad_InitHandlers(tagName) {

  var items = document.getElementsByTagName("div");
  var dict = {};

  for (var i = 0; i < items.length; i++) {
    let elmnt = items[i];
    let pageIdValue = elmnt.getAttribute(tagName)
    if (!pageIdValue) {
      continue;
    }

    let htmlPage = elmnt.getAttribute("html-source");
    if (!htmlPage) {
      continue;
    }
    dict[pageIdValue] = htmlPage;
  }

  let buttons = document.getElementsByTagName("button");
  for (var j = 0; j < buttons.length; j++) {
    let buttonItem = buttons[j];

    let buttonIdValue = buttonItem.getAttribute("id");
    let htmlPageValue = dict[buttonIdValue];
    if (htmlPageValue) {

      buttonItem.addEventListener('click',
        function () { DynamicPageContentLoad(tagName, buttonIdValue); }, false);

    }
  }

}