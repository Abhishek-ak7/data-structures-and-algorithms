package maximum_subarray_53;

class Solution {
    public int maxSubArray(int[] nums) {

        // Current subarray ka maximum sum
        int currentSum = nums[0];

        // Overall maximum sum
        int maxSum = nums[0];

        for (int i = 1; i < nums.length; i++) {

            // Continue karo ya new subarray start karo
            currentSum = Math.max(nums[i], currentSum + nums[i]);

            // Overall max update karo
            maxSum = Math.max(maxSum, currentSum);
        }

        // Maximum subarray sum
        return maxSum;
    }
}