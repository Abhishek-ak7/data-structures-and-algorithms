package Maximum_Product_Subarray_152;
import java.util.*;

public class Solution {
    public static int maxProduct(int[] nums) {
        int currentProMax=nums[0];
        int currentProMin=nums[0];
        int maxProduct=nums[0];

        for(int i=1;i<nums.length;i++){
            int tempMax=currentProMax;
            currentProMax=Math.max(nums[i],Math.max(tempMax*nums[i],currentProMin*nums[i] ));
            currentProMin=Math.min(nums[i],Math.min(tempMax*nums[i],currentProMin*nums[i] ));
            maxProduct=Math.max(maxProduct,Math.max(currentProMax,currentProMin));
        }
        return maxProduct;
    }
    public static void main(String[] args){
        int[] nums= {2,3,-2,4};
        int result=maxProduct(nums);
        System.out.println(result);
    }
    
}
