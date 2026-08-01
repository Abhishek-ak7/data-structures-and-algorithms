package binary_subarrays_with_sum;

public class Solution {
    public static int numSubarraysWithSum(int[] nums, int goal) {
        int left=0;
        int sum=0;
        int count=-1;
        for(int right=0;right<nums.length;right++){
            sum=sum+nums[right];
            if(sum==goal) count++;

            while(sum>goal || (right==nums.length-1 && sum==goal && left<right)){
                sum=sum-nums[left];
                left++;
                count++;
            }
        }
        return count;
    }
    public static void main(String[] args){
        int[] nums={1,0,1,0,1};
        int goal=2;

        int result=numSubarraysWithSum(nums, goal);
        System.out.println(result);
    }
}
