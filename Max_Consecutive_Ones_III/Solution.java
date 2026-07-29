
package Max_Consecutive_Ones_III;
import java.util.*;
public class Solution {

    public static int longestOnes(int[] nums, int k) {
        int left=0;
        int count=0;
        int maxLength=0;
        for(int right=0;right<nums.length;right++){

            if(nums[right]==0) count++;
            while(count>k){
                if(nums[left] ==0 )count--;
                left++;
            }
            int length=right-left+1;
            maxLength=Math.max(length,maxLength);   
        }
        return maxLength;
    }
    public static void main(String[] args){
        int[] arr={0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1};
        int k=3;

        int result=longestOnes(arr, k);
        System.out.println(result);
    }
}
