package mnimum_window_substring_76;

import java.util.Hashtable;

public class Solution {

    public static String minWindow(String s, String t) {

        if (t.length() > s.length()) {
            return "";
        }

        Hashtable<Character, Integer> freq = new Hashtable<>();

        // t ke har character ki required frequency store kar rahe hain.
        for (char ch : t.toCharArray()) {
            freq.put(ch, freq.getOrDefault(ch, 0) + 1);
        }

        int left = 0;

        // count batata hai ki current window me abhi kitne required characters missing hain.
        int count = t.length();

        int minLength = Integer.MAX_VALUE;
        int startIndex = 0;

        for (int right = 0; right < s.length(); right++) {

            char ch = s.charAt(right);

            if (freq.containsKey(ch)) {

                // Sirf required character milne par count decrease hoga; extra character par nahi.
                if (freq.get(ch) > 0) {
                    count--;
                }

                // Character window me add hua, isliye uski remaining frequency decrease karo.
                freq.put(ch, freq.get(ch) - 1);
            }

            // count == 0 means current window valid hai, ab left se shrink karenge.
            while (count == 0) {

                int windowLength = right - left + 1;

                // Har valid window ko previous minimum se compare karke smallest window save karo.
                if (windowLength < minLength) {
                    minLength = windowLength;
                    startIndex = left;
                }

                char leftChar = s.charAt(left);

                if (freq.containsKey(leftChar)) {

                    // Left character remove ho raha hai, isliye uski frequency wapas increase karo.
                    freq.put(leftChar, freq.get(leftChar) + 1);

                    // Frequency positive hui to required character missing hai, so window invalid ho gayi.
                    if (freq.get(leftChar) > 0) {
                        count++;
                    }
                }

                left++;
            }
        }

        if (minLength == Integer.MAX_VALUE) {
            return "";
        }

        return s.substring(startIndex, startIndex + minLength);
    }

    public static void main(String[] args) {

        String s = "ADOBECODEBANC";
        String t = "ABC";

        System.out.println(minWindow(s, t));
    }
}