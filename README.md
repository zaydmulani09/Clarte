

# ✨ Clarte

Clarte is a custom interpreted programming language designed to be simple, readable, and beginner-friendly, while still having powerful features. It comes with its own desktop IDE built using Python, making it easy to write, run, and test code in one place.

## 🌐 Project Links

* GitHub: [https://github.com/zaydmulani09/Clarte](https://github.com/zaydmulani09/Clarte)
* Website: [https://clarte-omega.vercel.app/](https://clarte-omega.vercel.app/)

## 🧠 Overview

Clarte was built to make coding feel more natural and less confusing, especially for beginners. The syntax is clean and readable, but still supports real programming concepts like functions, loops, and data structures.

It’s not just a language — it’s a full environment with its own interpreter and IDE.

## ⚙️ Core Features

### 🧩 Language Features

* Typed variables: `num`, `dec`, `txt`, `truth`, `listo`, `let`, `const`
* Control flow: `when`, `otherwise`, `also when`, `cycle`, `repeat`
* Functions: `func`, `do`, returns, recursion, default + named parameters
* Lambdas: `fn(x) => ...`
* Data structures: Lists, `Map`, `Set`
* Operators:

  * `@` (string concat)
  * `??` (fallback/default)
  * `not in`
* Multi-line strings
* Module imports (`import`, aliases, `clarte:` standard modules)

### ⚠️ Error System

* `[Clarte Error]`
* `[Clarte Runtime]`
* `[Clarte Warn]`
* `[Clarte Info]`
* `[Clarte Type]`
* `[Clarte Import]`

## 🖥️ IDE Features

* Built with Python (Tkinter)
* Dark mode UI
* Syntax highlighting (keywords, comments, strings, numbers)
* Run button with live output
* File open/save support

## 📦 Getting Started

### Prerequisites

* Python 3 installed

### Run the Interpreter

```bash
python clarte_interpreter.py
```

### Run the IDE

```bash
python clarte_ide.py
```

## 📁 Project Structure

```
clarte_interpreter.py   # core interpreter  
clarte_ide.py           # desktop IDE  
examples/               # sample .clarte files  
```

## 💡 Example Code

```clarte
num x = 10

func add(a, b) {
    return a + b
}

txt result = add(x, 5)
print(result)
```

## 🚧 Future Plans

* Better debugging tools
* More built-in modules
* Improved error messages
* Cross-platform IDE improvements

## 👤 Author

Made by @zaydmulani09

---
