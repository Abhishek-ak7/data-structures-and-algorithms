import java.util.ArrayList;

public class prefixsum{
    public static void main(String[] args){
        int[] arr={3,4,7,8,3,19};

        int prefixSum1=arr[0];
        ArrayList<Integer> array = new ArrayList<>();
        
        for(int i=1;i<arr.length;i++){
            array.add(prefixSum1);
            prefixSum1+=arr[i];
        }
         for(int i=0;i<array.size();i++){
            System.out.println(array.get(i));
        }
    }
}