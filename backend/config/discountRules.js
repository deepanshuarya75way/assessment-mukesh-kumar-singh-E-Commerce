const discountRules = {
  mumbai : {percentage : 10},
  delhi : {percentage : 15},
  bangalore : {percentage : 12},
  bangaluru : {percentage : 12},
  chenai : {percentage : 8},
  hyderabad : {percentage : 10}
};

export function getDiscountForCity(city){
  if(!city || typeof city !== 'string') return 0;
  const rule = discountRules[city.trim().toLowerCase()];
  return rule ? rule.percentage : 0;
}

export default discountRules;

