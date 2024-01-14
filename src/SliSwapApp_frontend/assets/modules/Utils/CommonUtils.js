import { ResultInfo, ResultTypes, TokenInfos, TokenInfo } from "../Types/CommonTypes";
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";


//Returns true if the object has all the fileds included
export function hasFieldsSet(item, ...fieldNames) {
  for (let fieldName of fieldNames) {
    if (Object.hasOwn(item, fieldName) == false) {
      return false;
    }
  }
  return true;
}

//Helper function, so that fake-enum's can be created
export function createEnum(values) {
  const enumObject = {};
  for (const val of values) {
    enumObject[val] = val;
  }
  return Object.freeze(enumObject);
}


export function GetResultFromVariant(item) {

  if (Object.hasOwn(item, 'err')) {
    return new ResultInfo(ResultTypes.err, item['err']);
  }

  if (Object.hasOwn(item, 'Err')) {
    return new ResultInfo(ResultTypes.err, item['Err']);
  }

  if (Object.hasOwn(item, 'ok')) {
    return new ResultInfo(ResultTypes.ok, item['ok']);
  }

  if (Object.hasOwn(item, 'Ok')) {
    return new ResultInfo(ResultTypes.ok, item['Ok']);
  }

  return new ResultInfo(ResultTypes.unknown, "");
}



function GetTokenInfo_Internal(obj) {
  let result = new TokenInfo();

  if (hasFieldsSet(obj, 'canisterId', 'decimals', 'fee') == false) {
    return result;
  }

  result.canisterId = obj['canisterId'];
  result.decimals = obj['decimals'];
  result.fee.SetDecimals(result.decimals);
  result.fee.SetRawBalance(obj['fee']);


  if (hasFieldsSet(obj, 'logo')) {
    result.logo = obj['logo'];
  }

  if (hasFieldsSet(obj, 'name')) {
    result.name = obj['name'];
  }

  if (hasFieldsSet(obj, 'symbol')) {
    result.symbol = obj['symbol'];
  }

  return result;

}

export async function GetTokensInfos() {

  let data = await SliSwapApp_backend.GetTokensInfos();

  let result = new TokenInfos();
  result.Dip20_Sli = GetTokenInfo_Internal(data['Dip20_Sli']);
  result.Icrc1_Sli = GetTokenInfo_Internal(data['Icrc1_Sli']);
  result.Dip20_Glds = GetTokenInfo_Internal(data['Dip20_Glds']);
  result.Icrc1_Glds = GetTokenInfo_Internal(data['Icrc1_Glds']);

  return result;

}




