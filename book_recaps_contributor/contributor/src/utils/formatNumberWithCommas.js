export const turnNumberToVNDStr = (number = 0) => {
  return number.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const turnVNDStrToNumber = (str = "") => {
  if (!str) return str;
  return parseInt(str.replace(/\D/g, ""));
}