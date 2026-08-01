import java.util.*;

public class Solution {
    public static int longestKSubstr(String s, int k) {
    int left=0;
    int maxLength=-1;
    Map<Character, Integer> map = new HashMap<>();

    for(int right=0;right<s.length();right++){
        char ch = s.charAt(right);
        map.put(ch, map.getOrDefault(ch, 0) + 1);
        while(map.size()>k){
            char ch1=s.charAt(left);
            map.put(ch1, map.get(ch1) - 1);

            if (map.get(ch1) == 0) {
                map.remove(ch1);
            }
        left++;

        }
        if(map.size()==k){
            int length=right-left+1;
            maxLength=Math.max(length,maxLength);
        }
    }
    return maxLength;    
    }
    public static void main(String[] args){
        String s="aabacbebebe";
        int k=3;
        int result= longestKSubstr(s, k);
        System.out.println(result);
    }
}
