package lemonade_change_860;

public class Solution {

    public static boolean lemonadeChange(int[] bills) {

        // Hamare paas kitne $5 aur $10 ke notes hain
        int count5 = 0;
        int count10 = 0;

        // Har customer ko ek-ek karke handle karenge
        for (int i = 0; i < bills.length; i++) {

            // Agar customer ne $5 diya
            // Change dena nahi padega, bas note rakh lo
            if (bills[i] == 5) {
                count5++;
            }

            // Agar customer ne $10 diya
            else if (bills[i] == 10) {

                // $10 ke liye $5 ka change dena zaroori hai
                if (count5 == 0)
                    return false;

                // Ek $5 de diya aur ek $10 mil gaya
                count5--;
                count10++;
            }

            // Agar customer ne $20 diya
            else {

                // Sabse best option:
                // 1 x $10 + 1 x $5 ka change do
                // Kyunki future ke liye $5 bachana important hai
                if (count10 > 0 && count5 > 0) {
                    count10--;
                    count5--;
                }

                // Agar $10 nahi hai to 3 x $5 de do
                else if (count5 >= 3) {
                    count5 -= 3;
                }

                // Kisi bhi tarike se change nahi de paaye
                else {
                    return false;
                }
            }
        }

        // Sab customers ko successfully change mil gaya
        return true;
    }

    public static void main(String[] args) {

        int[] arr = {5, 5, 10, 10, 20};

        boolean result = lemonadeChange(arr);

        System.out.println(result);
    }
}