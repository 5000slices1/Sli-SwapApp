import {ResultInfo, ResultTypes} from "../Types/CommonTypes";

//Helper function, so that fake-enum's can be created
export function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
      enumObject[val] = val;
    }
    return Object.freeze(enumObject);
  }


export function GetResultFromVariant(item){
              
    if (Object.hasOwn(item,'err')){
      return new ResultInfo(ResultTypes.err, item['err']);
    }

    if (Object.hasOwn(item,'Err')){
      return new ResultInfo(ResultTypes.err, item['Err']);
    }

    if (Object.hasOwn(item,'ok')){
      return new ResultInfo(ResultTypes.ok, item['ok']);
    }

    if (Object.hasOwn(item,'Ok')){
      return new ResultInfo(ResultTypes.ok, item['Ok']);
    }

    return new ResultInfo(ResultTypes.unknown, "");    
}




