# Backspace String Compare — The Typing Stack

A Java solution to the **Backspace String Compare** problem, paired with an interactive React visualization that explains the stack technique to anyone — technical or not.

**Given two strings that may contain `#` (a backspace key), check if they end up equal after applying all the backspaces.**

**click here 👇**

🔗 **[Try the live visualization](https://ptmmdf.csb.app/)**

![Backspace compare stack animation](./backspace-walk.gif)

---

## 📌 Problem Statement

You are given two strings made of lowercase letters and the character `#`, where `#` means "delete the previous character" (like pressing Backspace on a keyboard).

Apply the backspaces in both strings and check if the final typed text is identical.

**Example**
```
S: "ab#c"  →  type a, type b, backspace (removes b), type c  →  "ac"
T: "ad#c"  →  type a, type d, backspace (removes d), type c  →  "ac"

"ac" == "ac"  →  true
```

## 🧠 Core Idea

1. Go through the string **one character at a time**.
2. If it's a normal letter, **push it onto a stack** (type it).
3. If it's `#`, **pop the top of the stack** — but only if the stack isn't already empty (backspace).
4. After processing the whole string, the stack (bottom to top) is the final typed text.
5. Do this for **both strings**, then compare the two final results for equality.

A stack is the perfect fit here because backspace always removes the *most recently typed* character — exactly what "pop the top" does.

---


**Complexity**
- Time: `O(n + m)` — each string is scanned once, where `n` and `m` are the string lengths.
- Space: `O(n + m)` for the two stacks holding the final characters.

---



## ✅ Why This Approach Works

- A **stack naturally models "undo the last action"** — which is exactly what backspace does.
- Checking `!stack.isEmpty()` before popping means extra backspaces (like `"###a"`) never crash or wrongly delete something that isn't there.
- Comparing the two final stacks handles every case — different backspace patterns can still land on the exact same final text.
