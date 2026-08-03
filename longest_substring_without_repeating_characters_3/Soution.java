package longest_substring_without_repeating_characters_3;

import java.util.HashMap;

public class Soution {
    public static int lengthOfLongestSubstring(String s) {
        int left = 0;
        HashMap<Character, Integer> map = new HashMap<>();
        int maxSubString = -1;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            map.put(ch, map.getOrDefault(ch, 0) + 1);
            while (map.get(ch) > 1) {
                char ch1 = s.charAt(left);
                map.put(ch1, map.get(ch1) - 1);
                left++;
            }
            int length = right - left+1;
            maxSubString = Math.max(length, maxSubString);
        }
        return maxSubString;
    }

    public static void main(String[] args) {
        String s = "pwwkew";
        int result = lengthOfLongestSubstring(s);
        System.out.println(result);
    }
}
