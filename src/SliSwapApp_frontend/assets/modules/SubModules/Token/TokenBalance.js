
export class TokenBalance {

  #RawValue;
  #Decimals;

  SetDecimals(decimals) {
    this.#Decimals = Number(decimals);
    return this;
  }

  SetRawValue(balanceValue) {
    this.#RawValue = balanceValue;
    return this;
  }

  SetValue(amount) {

    var withprecision = Number(amount);
    withprecision = parseFloat(withprecision.toFixed(this.#Decimals));
    var tempNumber = (Number(withprecision) * (10 ** Number(this.#Decimals)));
    tempNumber = parseFloat(tempNumber.toFixed(0));

    this.#RawValue = BigInt(tempNumber);
    return this;
  }

  //Raw balance as BigInteger with 10⁸ notation
  GetRawValue() {
    return BigInt(this.#RawValue);
  }

  //Display-Balance
  GetValue() {
    let number = Math.max(Number(this.#RawValue), 0);
    return number / (10 ** Number(this.#Decimals));
  }

  static FromNumber(numberValue, decimals = 8) {
    return new TokenBalance().SetDecimals(decimals).SetValue(numberValue);
  }

  constructor(tokenBalanceBigInt = BigInt(0), decimals = 8) {
    this.#RawValue = BigInt(tokenBalanceBigInt);
    this.#Decimals = Number(decimals);
  }

  Reset() {
    this.#RawValue = BigInt(0);
  }

}

