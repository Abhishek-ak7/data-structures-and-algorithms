package longest_repeating_character_replacement_424;

import java.util.*;
import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int characterReplacement(String s, int k) {
        int left=0;
        Map<Character, Integer> map = new HashMap<>();
        int maxFreq=Integer.MIN_VALUE;
        int length=0;
        int maxSubString=0;

        for(int right=0;right<s.length();right++){
            char ch=s.charAt(right);
            map.put(ch, map.getOrDefault(ch, 0) + 1);
            maxFreq=Math.max(maxFreq,map.get(ch));
            
            
            while((right-left+1)-maxFreq>k){
                char ch1=s.charAt(left);
                map.put(ch1, map.get(ch1) - 1);
                left++;
            }
        length=right-left+1;
        maxSubString=Math.max(length,maxSubString);
 
        }
        return maxSubString;
    }

    public static void main(String[] args) {
        String s = "AABABBA";
        int k = 1;
        int result = characterReplacement(s, k);
        System.out.println(result);
    }
}