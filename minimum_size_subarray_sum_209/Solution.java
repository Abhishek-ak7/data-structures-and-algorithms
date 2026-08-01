package minimum_size_subarray_sum_209;

import java.util.*;

class Solution {
    public static int minSubArrayLen(int target, int[] nums) {
        int left = 0; // same virable sliding window template follow
        int sum = 0;
        int minSubArr = Integer.MAX_VALUE;
        boolean flag = false;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) {
                flag = true;
                sum -= nums[left];
                int count = right - left + 1;
                minSubArr = Math.min(count, minSubArr);
                left++;

            }

        }
        if (flag)
            return minSubArr;
        else
            return 0;

    }

    public static void main(String[] args) {
        int[] arr = { 12, 28, 83, 4, 25, 26, 25, 2, 25, 25, 25, 12 };

        int result = minSubArrayLen(213, arr);
        System.out.println(result);
    }
}
