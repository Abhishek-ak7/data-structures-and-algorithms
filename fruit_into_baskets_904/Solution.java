
package fruit_into_baskets_904;
import java.util.*;
import java.util.HashMap;
import java.util.Map;

public class Solution {
        public static int totalFruit(int[] fruits) {
        int left=0;
        int maxfurits=0; 

    // HashMap:
    // Key   -> Fruit Type
    // Value -> Current window me us fruit ki frequency
        Map<Integer, Integer> map = new HashMap<>();

            // Right pointer se window ko expand karo
        for(int right=0;right<fruits.length;right++){
             int ch = fruits[right];
            map.put(ch, map.getOrDefault(ch, 0) + 1);
            while(map.size()>2){
            int ch1=fruits[left];
            map.put(ch1, map.get(ch1) - 1);

            if (map.get(ch1) == 0) {
                map.remove(ch1);
            }
        left++;
            }
        // Ab window valid hai (maximum 2 fruit types)
        // Current window size se answer update karo
            maxfurits = Math.max(maxfurits, right - left + 1);
        }
        return maxfurits;
        }
  
    
    public static void main(String[] args){
        int[] arr={1,2,1};
        int result=totalFruit(arr);
        System.out.println(result);
    }
}
