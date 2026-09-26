import { toBoolean } from "../../utils/apiNormalizers";

export function countActive(items) {
  return items.filter(function (item) {
    return toBoolean(item && item.product_status);
  }).length;
}

export function countWithoutPrice(items) {
  return items.filter(function (item) {
    return !toBoolean(item && item.has_price);
  }).length;
}
