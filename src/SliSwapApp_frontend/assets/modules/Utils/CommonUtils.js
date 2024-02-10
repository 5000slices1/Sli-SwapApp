import { ResultInfo, CustomResultInfo,ConversionCompletedArchiveItem, 
  SpecifiedTokenInterfaceType,ResultTypes, TokenInfos, TokenInfo } from "../Types/CommonTypes";
import { SliSwapApp_backend } from "../../../../declarations/SliSwapApp_backend";
//import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { TokenBalance } from "../SubModules/Token/TokenBalance";
import { Principal } from "@dfinity/principal";
import { Buffer } from "buffer";
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

//Only the first property is used
export function GetCustomResultFromVariant(item){
  for (var key in item) {
    if (Object.hasOwn(item, key)) {

       let resultValue = item[key];
       return new CustomResultInfo(key, resultValue);
    }
  }
}

export function GetCustomDictionaryFromVariant(item){
  var map = Object.create(null);
  for (var itemKey in item) {
    if (Object.hasOwn(item, itemKey)) {
       map[itemKey] = item[itemKey];    
    }
  }
  return map;
}


export function ConvertResponseToConversionCompletedArchiveItem(responseItem){

  let singleItem = GetCustomDictionaryFromVariant(responseItem); 

  var result = new ConversionCompletedArchiveItem();
  var decimals = 8; // we can hardcode this, because sli and glds DIP20 has decimals=8 set
  let tokenType = GetCustomResultFromVariant(singleItem['tokenType']);
  let amount = singleItem['amount'];
  
  let tokenBalance = new TokenBalance(BigInt(amount), Number(decimals));
  result.AmountBigInt = tokenBalance.GetRawValue();
  result.AmountDecimal = tokenBalance.GetValue();

  if (tokenType.Result == SpecifiedTokenInterfaceType.Dip20Sli){
    result.IsSliToken = true;
    result.IsGldsToken = false;
    result.TokenType = "SLI";
  } else if (tokenType.Result == SpecifiedTokenInterfaceType.Dip20Glds){

    result.IsSliToken = false;
    result.IsGldsToken = true;
    result.TokenType = "GLDS";
  }

  let rawPrincipal = singleItem['userPrincipal'];
  result.UserPrincipal =  Principal.fromHex(rawPrincipal.toHex()).toText();

  let timeTicksNanoSeconds = Number(singleItem['time']);
  let timeTicksMilliSeconds = Math.trunc(Number(timeTicksNanoSeconds / 1000000));
  let date = new Date(Number(timeTicksMilliSeconds));
  result.RawTimeTicks =Number(timeTicksMilliSeconds);
  result.DateTime = date;
  result.TimeLocalTimeString = date.toLocaleString();

  let conversionIdUintArray = singleItem['conversionId'];
  let conversionId = Buffer.from(conversionIdUintArray).toString('hex');
  result.ConversionId = conversionId;
  return result;

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
  result.fee.SetRawValue(obj['fee']);


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


export function GetRandomIdentity() { 
    return Secp256k1KeyIdentity.generate();
}

export function SeedToIdentity(seed) {
  const seedBuf = new Uint8Array(new ArrayBuffer(32));
  if (seed.length && seed.length > 0 && seed.length <= 32) {
    seedBuf.set(new TextEncoder().encode(seed));
    return Secp256k1KeyIdentity.generate(seedBuf);
    //Ed25519KeyIdentity.generate(seedBuf);
  }
  return null;
}

export function GetRandomString(stringLength){
 
  let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var result = "";
  for(var i = 0; i < stringLength; i++){
    result += getRandomChar(characters);
  }
  return result;
}

export function Get2DimArray(numberOfWallets, bucketSize) {
  const indexArray = [[]];

  for (var i = 0; i < numberOfWallets; i = i + bucketSize) {

      var end = i + bucketSize;
      end = Math.min(end, numberOfWallets);
      if (i == end) {
          break;
      }
      const innerArray = [];
      for (var j = i; j < end; j++) {
          innerArray.push(j);
      }
      if (i == 0) {
          indexArray[0] = innerArray;
      }
      else {
          indexArray.push(innerArray);
      }
  }
  return indexArray;
}

//Internal functions:

function getCryptoRandomBetween(min, max){
  //the highest random value that crypto.getRandomValues could store in a Uint32Array
  var MAX_VAL = 4294967295;
  
  //find the number of randoms we'll need to generate in order to give every number between min and max a fair chance
  var numberOfRandomsNeeded = Math.ceil((max - min) / MAX_VAL);
  
  //grab those randoms
  var cryptoRandomNumbers = new Uint32Array(numberOfRandomsNeeded);
  crypto.getRandomValues(cryptoRandomNumbers);
  
  //add them together
  for(var i = 0, sum = 0; i < cryptoRandomNumbers.length; i++){
    sum += cryptoRandomNumbers[i];
  }
  
  //and divide their sum by the max possible value to get a decimal
  var randomDecimal = sum / (MAX_VAL * numberOfRandomsNeeded);
  
  //if result is 1, retry. otherwise, return decimal.
  return randomDecimal === 1 ? getCryptoRandomBetween(min, max) : Math.floor(randomDecimal * (max - min + 1) + min);
}

function getRandomChar(str){
  return str.charAt(getCryptoRandomBetween(0, str.length - 1));
}




