import { pageIds, pageIdValues } from "../Types/CommonTypes";
import { convertSliDip20_init } from "../../Pages/ConvertSliDip20/ConvertSliDip20";
import { convertGldsDip20_init } from "../../Pages/ConvertGldsDip20/ConvertGldsDip20";
import { admin_section_init } from "../../Pages/AdminSection/PageAdminSection";


async function init_javascript_code(tagValue){


        switch(tagValue)
        {
            case pageIdValues.PageConvertSliDip20:{
                await convertSliDip20_init();
            };
            break;
            case pageIdValues.PageConvertGldsDip20:{
                await convertGldsDip20_init();
            };
            break;
            case pageIdValues.PageAdminSection:{              
              await admin_section_init();
            };
            break;
            default:
                break;
        }
}


async function DynamicPageContentLoadRemoveAllPreviousContent(){
    var z, i, elmnt, file, xhttp; 
    z = document.getElementsByTagName("div");
    
    for (i = 0; i < z.length; i++) {

        elmnt = z[i];
        let enumValues = Object.values(pageIds);

        for(const key of enumValues){

            let pageIdValue = elmnt.getAttribute(key)
            if (!pageIdValue){
                continue;
            }
            elmnt.innerHTML = "";        
        }     
    }
};

export async function DynamicPageContentLoad(tagName, tagValueToSearch) {
      
    await DynamicPageContentLoadRemoveAllPreviousContent();
    var z, i, elmnt, file, xhttp; 
    z = document.getElementsByTagName("div");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];      
      let pageIdValue = elmnt.getAttribute(tagName)
      if (!pageIdValue){
        continue;
      }
      if (pageIdValue != tagValueToSearch){
        elmnt.innerHTML = "";
        continue;
      };
  
      let htmlSource = elmnt.getAttribute("html-source");
      if (!htmlSource){
        continue;
      }
     
      let javascript_init_method = elmnt.getAttribute("javascript-init-method");
      /* Make an HTTP request using the attribute value as the file name: */
      
      
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = async function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;                                     
            await init_javascript_code(tagValueToSearch);            
          }
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}          
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
      if (!pageIdValue){
        continue;
      }
      
      let htmlPage = elmnt.getAttribute("html-source");
      if (!htmlPage){
        continue;
      }
      dict[pageIdValue] = htmlPage;
    }
    
    let buttons = document.getElementsByTagName("button");    
    for (var i = 0; i < buttons.length; i++) {
      let buttonItem = buttons[i];

      let buttonIdValue = buttonItem.getAttribute("id");      
      let htmlPageValue = dict[buttonIdValue];      
      if (htmlPageValue){

        buttonItem.addEventListener('click', 
          function(){ DynamicPageContentLoad(tagName, buttonIdValue);}, false);

      };      
    }
        
  }