module.exports = (template, product) => {
  let cardHtml = template.replace(/{%PRODUCT_NAME%}/g, product.productName);
  cardHtml = cardHtml.replace(/{%PRODUCT_IMAGE%}/g, product.image);
  cardHtml = cardHtml.replace(/{%PRODUCT_ID%}/g, product.id);
  cardHtml = cardHtml.replace(/{%FROM%}/g, product.from);
  cardHtml = cardHtml.replace(/{%NUTRIENTS%}/g, product.nutrients);
  cardHtml = cardHtml.replace(/{%PRICE%}/g, product.price);
  cardHtml = cardHtml.replace(/{%QUANTITY%}/g, product.quantity);
  if (!product.organic) {
    cardHtml = cardHtml.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  }
  cardHtml = cardHtml.replace(/{%DESCRIPTION%}/g, product.description);
  return cardHtml;
};
