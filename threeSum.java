import java.util.*;
public class threeSum{
    public static void main(String[] args){

        int[] arr={0,0,0,0};

        Arrays.sort(arr);

        ArrayList<int[]> list = new ArrayList<>();

        for(int tar=0;tar<arr.length-2;tar++){
            int small=tar+1;
            int large=arr.length-1;
            while(small<large){
                if(arr[small]+arr[large]==(-arr[tar])){
                    int[] arr1={arr[small],arr[tar],arr[large]};
                    list.add(arr1);
                    break;
                }else if(arr[small]+arr[large]<(-arr[tar])) small++;
                else large--;
            }
        }
        for (int[] num : list) {
            System.out.println(Arrays.toString(num));
        }
    }
}