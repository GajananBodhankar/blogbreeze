// /**
//  * @param {number[]} prices
//  * @return {number}
//  */
// var maxProfit = function (prices) {
//   let max = 0,
//     left = 0,
//     right = left;
//   while (left < prices.length) {
//     for (right = left; right < prices.length; right++) {
//       if (prices[right] > prices[left]) {
//         max = Math.max(max, prices[right] - prices[left]);
//       }
//     }
//     left++;
//   }
//   return max;
// };
// // maxProfit([7, 1, 5, 3, 6, 4]);
// // maxProfit([7, 6, 4, 3, 1]);
// console.log(maxProfit([2, 1, 2, 1, 0, 1, 2]));

function removeDuplicatesFromSortedArray(nums) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] == nums[i + 1]) {
      nums.splice(i + 1, 1);
      i--;
    }
  }
  console.log(nums);
}

removeDuplicatesFromSortedArray([2, 4, 4, 4, 6, 8, 8]);
