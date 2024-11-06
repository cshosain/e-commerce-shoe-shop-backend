const formatPrice = (text) => {
  let slicedPrice = { maxRange: 9999, minRange: 0 };

  //if the price section includes 'above' min price written befor '-' else after '-'
  if (text.indexOf("above") != -1) {
    slicedPrice.minRange = parseFloat(
      text.slice(1, text.indexOf("-") - 1).trim()
    );
  } else {
    slicedPrice.maxRange = parseFloat(text.slice(text.indexOf("-") + 1).trim());
    slicedPrice.minRange = parseFloat(
      text.slice(1, text.indexOf("-") - 1).trim()
    );
    console.log(
      "format function val: ",
      parseFloat(text.slice(1, text.indexOf("-") - 1).trim())
    );
  }
  return slicedPrice;
};

module.exports = formatPrice;
