package theeSum;

import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] arr) {
        Arrays.sort(arr);
        List<List<Integer>> list = new ArrayList<>();
        for (int tar = 0; tar < arr.length - 2; tar++) {
            if (tar > 0 && arr[tar] == arr[tar - 1]) {
                continue;
            }
            int small = tar + 1;
            int large = arr.length - 1;
            while (small < large) {
                if (arr[small] + arr[large] == (-arr[tar])) {
                    list.add(Arrays.asList(arr[tar], arr[small], arr[large]));
                    small++;
                    large--;
                    while (small < large && arr[small] == arr[small - 1]) small++;
                    while (small < large && arr[large] == arr[large + 1]) large--;
                } else if (arr[small] + arr[large] < (-arr[tar])) small++;
                else large--;
            }
        }
        return list;
    }
}