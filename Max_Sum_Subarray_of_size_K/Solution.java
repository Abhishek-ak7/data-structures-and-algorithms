package Max_Sum_Subarray_of_size_K;

public class Solution {
	public static int maxSumSubarray(int[] arr, int k) {
	    int windowSum=0;
		for(int i=0;i<k;i++){
			windowSum+=arr[i];
		}
		int prevSum=windowSum;
		int maxSum=windowSum;
		for(int i=k;i<arr.length;i++){
			prevSum=prevSum+arr[i]-arr[i-k];
			if(prevSum>maxSum) maxSum=prevSum;
		}
		return maxSum;
	}

	public static void main(String[] args) {
		int[] arr = {100, 200, 300, 400};
		System.out.println(maxSumSubarray(arr, 2)); 
	}
}
