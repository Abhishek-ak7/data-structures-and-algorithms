package permutation_in_string_567;

import java.util.*;

public class Solution {
    public static boolean checkInclusion(String s1, String s2) {
        int left=0;
        int count=s1.length();
           HashMap<Character, Integer> freq = new HashMap<>();

        for (char ch : s1.toCharArray()) {
            freq.put(ch, freq.getOrDefault(ch, 0) + 1);
        }
        for(int right=0;right<s2.length();right++){
        char ch=s2.charAt(right);
        if(freq.containsKey(ch)){
           if(freq.get(ch)>0) count--;
            freq.put(ch, freq.get(ch) - 1);
}
while(count==0){
    char ch1=s2.charAt(left);
    int length=right-left+1;
    if(length==s1.length()) return true;
    if(freq.containsKey(ch1)){
       freq.put(ch1, freq.get(ch1) + 1);
        if(freq.get(ch1)>0) count++;
        
}
left++;
}

    }
    return false;
    }

    public static void main(String[] args) {
        String s1 = "ab";
        String s2 = "eidboaooo";
        boolean result = checkInclusion(s1, s2);
        System.out.println(result);
    }
}
