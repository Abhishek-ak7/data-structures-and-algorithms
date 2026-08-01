package backspace_string_compare_844;
import java.util.*;
public class Solution{

    static String removeHas(String s){
        Stack<Character> stack = new Stack<>();

        int i=0;
        while(i<s.length()){

            if(s.charAt(i)=='#'){
                if (!stack.isEmpty()) {
                    stack.pop();
                }
            }else{
                stack.push(s.charAt(i));
            }
            i++;
        }

        StringBuilder sb = new StringBuilder();

        for (char ch : stack) {
            sb.append(ch);
        }

        String result = sb.toString();
        return result;
    }
    public static void main(String[] args){

        String s="ab#c" ,t="ad#c";

        System.out.println(removeHas(s).equals(removeHas(t)));
    }
}