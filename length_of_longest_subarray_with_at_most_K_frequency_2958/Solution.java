package length_of_longest_subarray_with_at_most_K_frequency_2958;

import java.util.Hashtable;

public class Solution {
    public static int maxSubarrayLength(int[] nums, int k) {
        int left = 0;
        int length = 0;
        int maxSubArrays = 0;
        Hashtable<Integer, Integer> freq = new Hashtable<>();

        for (int right = 0; right < nums.length; right++) {
            int ch = nums[right];

            // Current element ki frequency increase kar rahe hain.
            // Agar element pehle se nahi hai -> 0 + 1, warna existing freq + 1.
            freq.put(ch, freq.getOrDefault(ch, 0) + 1);

            // Agar current element ki frequency k se exceed ho gayi,
            // toh window ko left se shrink karenge jab tak frequency valid na ho jaye.
            while (freq.get(ch) > k) {
                int ch1 = nums[left];

                // Left wale element ko window se remove kar rahe hain,
                // isliye uski frequency 1 se decrease karni hai.
                freq.put(ch1, freq.get(ch1) - 1);

                left++;
            }

            // Ab [left ... right] ek valid window hai,
            // jisme kisi bhi element ki frequency k se zyada nahi hai.
            length = right - left + 1;

            // Har valid window me maximum length maintain kar rahe hain.
            maxSubArrays = Math.max(maxSubArrays, length);

        }
        return maxSubArrays;
    }

    public static void main(String[] args) {
        int[] arr={1,2,3,1,2,3,1,2};
        int k=2;
        int result=maxSubarrayLength(arr, k);
        System.out.println(result);
    }
}
