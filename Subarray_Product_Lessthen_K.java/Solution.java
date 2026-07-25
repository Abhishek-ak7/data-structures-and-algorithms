import java.util.*;
public class Solution{
    public static void main(String[] args){
        int[] nums={10,5,2,6};
        int K=100;

        int count=0;
        

        for(int fixed=0;fixed<nums.length;fixed++){
            int move=fixed;
            int preProduct=1;
            while(move<nums.length){
                preProduct=preProduct*nums[move];
                if(preProduct<K){
                    count++;
                    move++;
                }else{
                    break;
                } 
            }
        }

        System.out.println(count);

    }
}