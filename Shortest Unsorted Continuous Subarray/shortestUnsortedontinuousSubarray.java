
import java.util.*;
public class shortestUnsortedontinuousSubarray {
    public int findUnsortedSubarray(int[] arr) {
        int i=0;
        int j=arr.length-1;

        int idx1=0,idx2=0;
        int result=0;
        while(i<arr.length){
            if(arr[i]>arr[i+1]){
                idx1=i;
                break;
            } 
            else i++;
        }
        while (j>0) {
            if(arr[j]>arr[j-1]){
                idx2=j;
                break;
            } 
            else j--;
        }
        result=idx2-idx1;
        return result;
    }
    public static void main(String[] args){
        int[] arr={2,6,4,8,10,9,15};

        int result= findUnsortedSubarray(arr);
        System.out.println(arr);

    }
}
