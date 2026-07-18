import java.util.*;
public class threeSumclose {

    public static void main(String[] args){
        int[] arr={-1,2,1,-4};
        int target=1;
        Arrays.sort(arr);
        int out_put=0;
        int minDiff=Integer.MAX_VALUE;

  
        for(int tar=0;tar<arr.length-2;tar++){
            
            if(tar>0 && arr[tar]==arr[tar-1]){
                continue;
            }
            int small=tar+1;
            int large=arr.length-1;
            while(small<large){
                int sum=arr[small]+arr[large]+arr[tar];
                int diff=Math.abs(sum-target);  //diff<<<< out_put=sum
                if(sum==target){
                out_put=sum;
                break;
                }else if(sum<target){
                    if(diff<minDiff){
                        minDiff=diff;
                       out_put=sum; 
                    } 
                    small++;    
                }else{
                       if(diff < minDiff){
                        minDiff = diff;
                        out_put = sum;
                    }
                    large--;
                
                }
             
            }
        }
        System.out.print(out_put);
    }
}
