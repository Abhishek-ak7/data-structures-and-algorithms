# Max Sum Subarray of Size K — The Sliding Window

A Java solution to the **Max Sum Subarray of Size K** problem, paired with an interactive React visualization that explains the sliding window technique to anyone — technical or not.

**Given a list of numbers and a fixed size K, find the maximum sum among all contiguous groups of K numbers.**


**click here 👇**

🔗 **[Try the live visualization](https://t66qzf.csb.app/)**

![Sliding window animation](./sliding-window-walk.gif)

---

## 📌 Problem Statement

You're given a list of numbers and a number `k`. Look at every group of `k` numbers that sit **next to each other** in the list, add each group up, and report the **largest total** you can find.

**Example**
```
Array: [100, 200, 300, 400], k = 2

Groups of 2 neighbours:
[100,200] = 300
[200,300] = 500
[300,400] = 700   ← largest

Answer: 700
```


## 🧠 Core Idea

1. Add up the **first `k` numbers** — that's your starting window and your first "best so far."
2. **Slide the window one step to the right**: add the new number entering on the right, subtract the number leaving on the left.
3. If this new total beats the best so far, **update the best so far**.
4. Keep sliding until the window reaches the end of the list.
5. The best total you ever saw is the answer.

This avoids recomputing the sum of every group from scratch — each slide is just one addition and one subtraction, no matter how big `k` is.

---



---

## 💻 The Java Solution


**Complexity**
- Time: `O(n)` — every number is added once (into the window) and subtracted once (as it leaves).
- Space: `O(1)` extra — just a couple of running totals, no matter how big the array or `k` is.

---

## 🎬 Interactive version

`SlidingWindowVisualizer.jsx` renders the algorithm as a window frame gliding across the array: the tiles inside the frame are highlighted gold, the entering value is marked in teal, the leaving value in crimson, and the running max updates live as it's beaten.


```

## ✅ Why This Approach Works

- **Every number is touched at most twice** — once when it enters the window, once when it leaves — instead of being re-summed for every possible group.
- The window always has a **fixed size**, so there's no need to track its boundaries beyond a single index sliding forward.
- Comparing against the running max after every slide guarantees the true best is found, without ever storing all the sums.
