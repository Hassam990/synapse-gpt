
export interface StudySlide {
    id: string;
    title: string;
    intro: {
        en: string;
        ur: string; // Roman Urdu
    };
    explanation: {
        en: string;
        ur: string;
    };
    quiz: {
        question: string;
        type: 'syntax' | 'logic' | 'comment' | 'problem';
        options: string[];
        answer: string;
        explanation: string;
    }[];
    practice: {
        difficulty: 'Easy' | 'Medium' | 'Hard';
        mode?: 'write' | 'repair';
        description: string;
        initialCode: string;
        solution: string;
        conceptReminder?: string;
    }[];
}

export const OOPS_COURSE: StudySlide[] = [
    {
        id: 'slide-1',
        title: 'Python Lists (Week 2B)',
        intro: {
            en: 'Welcome to Python Lists! Lists are ordered, mutable collections that can store any data type.',
            ur: 'Python Lists mein khush-amdeed! Lists ordered aur mutable collections hain jo kisi bhi data type ko store kar sakti hain.'
        },
        explanation: {
            en: '1. Lists are ordered: Every item has a number (index) starting from 0. \n2. Mutable: You can change any item like "fruits[0] = \'mango\'". \n3. Dynamic: They can grow or shrink. \n\n*Line-by-Line Breakdown:* \n- "my_list = [1, 2]": Creates a list with two items. \n- "my_list.append(3)": Adds 3 at the very end. \n- "my_list.pop()": Removes the last item (3). \n- "my_list.remove(val)": Finds "val" and deletes it.',
            ur: '1. Lists ordered hain: Har item ka ek fixed number (index) hota hai jo 0 se start hota hai. \n2. Mutable: Aap kisi bhi item ko change kar sakte hain, maslan "fruits[0] = \'mango\'". \n3. Dynamic: Inka size barh ya kam sakta hai. \n\n*Line-by-Line Samajhein:* \n- "my_list = [1, 2]": Do items wali list banata hai. \n- "my_list.append(3)": End par 3 add karta hai. \n- "my_list.pop()": Aakhri item (3) ko nikaal deta hai. \n- "my_list.remove(val)": "val" ko dhoond kar delete karta hai.'
        },
        quiz: [
            {
                question: '[Easy] Which method adds an item to the end of a list?',
                type: 'syntax',
                options: ['insert()', 'add()', 'append()', 'extend()'],
                answer: 'append()',
                explanation: 'append() takes ONE item and puts it at the very end of the list. It is the most common way to grow a list.'
            },
            {
                question: '[Medium] L = ["a", "b", "c"]; L[1:3] = ["x", "y"]. What is L now?',
                type: 'logic',
                options: ['["a", "x", "y"]', '["a", "x", "y", "c"]', '["x", "y", "c"]', 'Error'],
                answer: '["a", "x", "y"]',
                explanation: 'Slicing substitution! indices 1 and 2 are replaced by "x" and "y". Index 3 is NOT included in the slice [1:3].'
            },
            {
                question: '[Hard] Difference between append([4,5]) and extend([4,5])?',
                type: 'logic',
                options: ['Same thing', 'append adds one list item, extend adds elements individually', 'extend is faster', 'append only works for strings'],
                answer: 'append adds one list item, extend adds elements individually',
                explanation: 'append([4,5]) adds the WHOLE list as ONE item: [1,2, [4,5]]. extend([4,5]) adds them separate: [1,2,4,5].'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                description: 'Create a list "nums" with values [1, 2, 3].',
                initialCode: 'nums = [...]',
                solution: 'nums = [1, 2, 3]'
            },
            {
                difficulty: 'Medium',
                description: 'Add the number 4 to the end of the list "nums".',
                initialCode: 'nums = [1, 2, 3]\n# Append 4 here:',
                solution: 'nums = [1, 2, 3]\nnums.append(4)'
            },
            {
                difficulty: 'Hard',
                description: 'Remove the last item from the list "nums" and store it in a variable "val".',
                initialCode: 'nums = [1, 2, 3, 4]\n# Pop here:',
                solution: 'nums = [1, 2, 3, 4]\nval = nums.pop()'
            }
        ]
    },
    {
        id: 'slide-2',
        title: 'Loops & Control (Week 2A)',
        intro: {
            en: 'Loops are used to repeat tasks. "for" loops are for sequences, "while" loops are for conditions.',
            ur: 'Loops ko repetitive tasks ke liye use kiya jata hai. "for" loops sequences ke liye hote hain aur "while" loops conditions ke liye.'
        },
        explanation: {
            en: '1. For Loop: Go through a sequence one by one. \n2. While Loop: Runs as long as a condition is True. \n3. range(start, stop, step): Your generator. \n\n*Line-by-Line Breakdown:* \n- "for i in range(1, 5)": "i" starts at 1, repeats, then becomes 2, then 3, then 4. It STOPS before 5. \n- "while x < 10": Each time the loop ends, it checks: is x still < 10? If yes, it runs again. \n- "if x == 5: break": "break" kills the loop immediately, skipping the else block.',
            ur: '1. For Loop: Ek ek karke sequence se guzarta hai. \n2. While Loop: Jab tak condition True ho, chalta rehta hai. \n3. range(start, stop, step): Number peda karne wala function. \n\n*Line-by-Line Samajhein:* \n- "for i in range(1, 5)": "i" pehle 1 hoga, phir 2, 3, aur 4. (5 par ruk jayega). \n- "while x < 10": Har baar loop khatam hone par check hota hai: kya x < 10 hai? Agar haan, toh phir chalta hai. \n- "if x == 5: break": "break" loop ko foran khatam kar deta hai.'
        },
        quiz: [
            {
                question: '[Easy] What will range(5) generate?',
                type: 'logic',
                options: ['1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '0, 1, 2, 3, 4, 5', '1, 2, 3, 4'],
                answer: '0, 1, 2, 3, 4',
                explanation: 'range(n) starts at 0 and stops at n-1. So range(5) goes up to 4.'
            },
            {
                question: '[Medium] What is the output of range(10, 0, -2)?',
                type: 'logic',
                options: ['10, 8, 6, 4, 2', '10, 8, 6, 4, 2, 0', '8, 6, 4, 2', 'Error'],
                answer: '10, 8, 6, 4, 2',
                explanation: 'Start=10, Stop=0 (exclusive), Step=-2. So it decrements until it hits 2.'
            },
            {
                question: '[Hard] When does an "else" block in a "for" loop execute?',
                type: 'logic',
                options: ['Every time', 'Only if loop is broken', 'Only if loop completes WITHOUT being broken', 'Never'],
                answer: 'Only if loop completes WITHOUT being broken',
                explanation: 'The else block in a Python loop is special. It runs only if the loop finishes normally without a "break" statement.'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                description: 'Write a loop to print numbers 0 to 4.',
                initialCode: 'for i in range(...):\n    print(i)',
                solution: 'for i in range(5):\n    print(i)'
            },
            {
                difficulty: 'Medium',
                description: 'Write a loop that prints only even numbers from 2 to 10 (inclusive).',
                initialCode: '# Hint: use range(start, stop, step)\nfor i in range(..., ..., ...):\n    print(i)',
                solution: 'for i in range(2, 11, 2):\n    print(i)'
            },
            {
                difficulty: 'Hard',
                description: 'Use a break statement to stop the loop when i reaches 5.',
                initialCode: 'for i in range(1, 11):\n    if i == ...:\n        ...\n    print(i)',
                solution: 'for i in range(1, 11):\n    if i == 5:\n        break\n    print(i)'
            }
        ]
    },
    {
        id: 'slide-3',
        title: 'Dictionaries & Sets',
        intro: {
            en: 'Dictionaries store Key-Value pairs. Sets store unique elements only.',
            ur: 'Dictionaries Key-Value pairs store karti hain. Sets sirf unique elements store karte hain.'
        },
        explanation: {
            en: '1. Dictionaries: Key-Value pairs like "Ali": 20. Keys must be unique and immutable! \n2. Sets: Unordered collection of unique items. \n\n*Line-by-Line Breakdown:* \n- "d = {\'a\': 1}": Creates dict. \'a\' (String) is the Key, 1 is the Value. \n- "d[\'b\'] = 2": In memory, it maps \'b\' to 2. If \'b\' existed, it overwrites it. \n- "s = {1, 2, 2}": Python looks at the second "2", sees it is a duplicate, and throws it away!',
            ur: '1. Dictionaries: Key-Value pairs jaise "Ali": 20. Keys unique aur immutable honi chahiye! \n2. Sets: Unordered collection sirf unique items ki. \n\n*Line-by-Line Samajhein:* \n- "d = {\'a\': 1}": Dict banata hai. \'a\' Key hai aur 1 uski Value. \n- "d[\'b\'] = 2": Memory mein \'b\' ko 2 se map karta hai. Agar \'b\' pehle se hota, toh update ho jata. \n- "s = {1, 2, 2}": Python dusre "2" ko dekh kar samajh jata hai ke ye duplicate hai, toh use discard kar deta hai!'
        },
        quiz: [
            {
                question: '[Easy] Which data structure stores unique elements only?',
                type: 'logic',
                options: ['List', 'Dictionary', 'Set', 'Tuple'],
                answer: 'Set',
                explanation: 'A Set is an unordered collection with no duplicate elements. If you add "2" twice, it only stores it once.'
            },
            {
                question: '[Medium] How do you safely get a value from dict "d" without crashing if key "k" is missing?',
                type: 'syntax',
                options: ['d["k"]', 'd.get("k")', 'd.fetch("k")', 'd.value("k")'],
                answer: 'd.get("k")',
                explanation: 'd.get("key") returns None instead of raising a KeyError if the key is missing. You can also provide a default value: d.get("k", 0).'
            },
            {
                question: '[Hard] Are Dictionary keys mutable or immutable?',
                type: 'logic',
                options: ['Mutable', 'Immutable', 'Both', 'Depends on Python version'],
                answer: 'Immutable',
                explanation: 'Keys must be hashable, which means they must be immutable (like strings, numbers, or tuples of immutable objects).'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                description: 'Create a dictionary "person" with name="Ali".',
                initialCode: 'person = {...}',
                solution: 'person = {"name": "Ali"}'
            },
            {
                difficulty: 'Medium',
                description: 'Add "age": 20 to the "person" dictionary.',
                initialCode: 'person = {"name": "Ali"}\n# Add age here',
                solution: 'person = {"name": "Ali", "age": 20}'
            },
            {
                difficulty: 'Hard',
                description: 'Safely get the "salary" from "person" using .get(), providing 0 as default.',
                initialCode: 'person = {"name": "Ali", "age": 20}\n# Get salary here:',
                solution: 'person = {"name": "Ali", "age": 20}\nsal = person.get("salary", 0)'
            }
        ]
    },
    {
        id: 'slide-4',
        title: 'User-Defined Functions',
        intro: {
            en: 'Functions are blocks of reusable code. Think of them as recipes you can use anytime.',
            ur: 'Functions reusable code ke blocks hain. Inhein aap recipes samajhein jo aap kahin bhi use kar sakte hain.'
        },
        explanation: {
            en: '1. def: Keyword to define a function. \n2. return: Sends code result back. \n\n*Line-by-Line Breakdown:* \n- "def add(a, b):": Function ka naam aur parameters "a, b". \n- "result = a + b": Code logic jo repeat karni hai. \n- "return result": Jawab bahar bhej deta hai.',
            ur: '1. def: Function banane wala keyword. \n2. return: Code ka jawab wapis bhejne ke liye. \n\n*Line-by-Line Samajhein:* \n- "def add(a, b):": Function ka naam aur parameters "a, b". \n- "result = a + b": Code ki logic jo bar bar chalani hai. \n- "return result": Final jawab function se bahar nikal deta hai.'
        },
        quiz: [
            {
                question: '[Easy] What keyword is used to start a function definition?',
                type: 'syntax',
                options: ['func', 'define', 'def', 'function'],
                answer: 'def',
                explanation: 'In Python, "def" is used to define a new function.'
            },
            {
                question: '[Medium] What is the result of a function that has no "return" statement?',
                type: 'logic',
                options: ['0', 'None', 'Error', 'Empty string'],
                answer: 'None',
                explanation: 'If no return statement is specified, Python functions implicitly return the special value "None".'
            },
            {
                question: '[Hard] What are *args and **kwargs used for?',
                type: 'syntax',
                options: ['Math operations', 'Passing variable number of arguments', 'Private variables', 'Async functions'],
                answer: 'Passing variable number of arguments',
                explanation: '*args allows a variable number of non-keyword arguments, while **kwargs allows a variable number of keyword (named) arguments.'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                description: 'Define a function "hi" that just returns "Hi".',
                initialCode: 'def hi():\n    ...',
                solution: 'def hi():\n    return "Hi"'
            },
            {
                difficulty: 'Medium',
                description: 'Define a function "add" that takes a and b and returns their sum.',
                initialCode: 'def add(a, b):\n    ...',
                solution: 'def add(a, b):\n    return a + b'
            },
            {
                difficulty: 'Hard',
                description: 'Define a function "greet" that takes a name and returns "Hello [name]".',
                initialCode: 'def greet(name):\n    ...',
                solution: 'def greet(name):\n    return f"Hello {name}"'
            }
        ]
    },
    {
        id: 'slide-5',
        title: 'Classes and Objects (OOP)',
        intro: {
            en: 'OOP models real-world entities using Classes (blueprints) and Objects (instances).',
            ur: 'OOP real-world entities ko Classes (blueprints) aur Objects (instances) ki madad se model karta hai.'
        },
        explanation: {
            en: '1. Class: A blueprint or template (e.g., a "Student" form). \n2. Object: A real person filling that form (e.g., Ali). \n3. State: The data (name, age, roll_no). \n4. Behavior: What it does (study(), play()). \n\n*Line-by-Line Breakdown:* \n- "class Student:": Defines the blueprint. \n- "obj = Student()": Creates an individual "instance" or object. \n- "obj.name = \'Ali\'": Sets the state for that specific object.',
            ur: '1. Class: Ek blueprint ya template hai (maslan "Student" ka form). \n2. Object: Wo asal banda jo form bharta hai (maslan Ali). \n3. State: Sara data (naam, umer, roll number). \n4. Behavior: Wo kya karta hai (parhna, khelna). \n\n*Line-by-Line Samajhein:* \n- "class Student:": Blueprint define karta hai. \n- "obj = Student()": Ek naya object ya "instance" banata hai. \n- "obj.name = \'Ali\'": Us khaas object ka data set karta hai.'
        },
        quiz: [
            {
                question: '[Easy] What is the blueprint/template in OOP?',
                type: 'logic',
                options: ['Object', 'Class', 'Attribute', 'Method'],
                answer: 'Class',
                explanation: 'A Class is the abstract blueprint; an Object is a concrete instance of that blueprint.'
            },
            {
                question: '[Medium] What represents the "behavior" of an object?',
                type: 'logic',
                options: ['State', 'Identity', 'Method', 'Attribute'],
                answer: 'Method',
                explanation: 'In OOP, State is stored in Attributes, and Behavior is defined in Methods (functions inside classes).'
            },
            {
                question: '[Hard] Which of these is NOT one of the 3 characteristics of an object?',
                type: 'logic',
                options: ['State', 'Inheritance', 'Behavior', 'Identity'],
                answer: 'Inheritance',
                explanation: 'An Object is characterized by State, Behavior, and Identity. Inheritance is a relationship between Classes.'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                description: 'Define an empty class "Animal".',
                initialCode: 'class ...:\n    pass',
                solution: 'class Animal:\n    pass'
            },
            {
                difficulty: 'Medium',
                description: 'Create a "Dog" class with an __init__ method that sets "name".',
                initialCode: 'class Dog:\n    def __init__(self, name):\n        ...',
                solution: 'class Dog:\n    def __init__(self, name):\n        self.name = name'
            },
            {
                difficulty: 'Hard',
                description: 'Add a method "speak" to "Dog" that returns "[name] barks".',
                initialCode: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        ...',
                solution: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f"{self.name} barks"'
            }
        ]
    },
    {
        id: 'slide-6',
        title: 'Access Modifiers',
        intro: {
            en: 'Encapsulation controls access using Public, Protected (_), and Private (__).',
            ur: 'Encapsulation access ko control karti hai: Public, Protected (_), aur Private (__) ke zariye.'
        },
        explanation: {
            en: '1. Public: No underscores. Anyone can see and change it. \n2. Protected (_): One underscore. A hint to others: "Please don\'t use outside the class!". \n3. Private (__): Two underscores. Strictly hidden. \n\n*Line-by-Line Breakdown:* \n- "self.name": Public attribute. \n- "self._bank": Protected (use with caution). \n- "self.__pin": Private (cannot be accessed directly as obj.__pin).',
            ur: '1. Public: Koi underscore nahi. Koi bhi dekh ya badal sakta hai. \n2. Protected (_): Ek underscore. Ye ek ishara hai ke "Class se bahar use na karein". \n3. Private (__): Do underscores. Bilkul chupa hua data. \n\n*Line-by-Line Samajhein:* \n- "self.name": Public variable. \n- "self._bank": Protected (careful use). \n- "self.__pin": Private (obj.__pin ke zariye access nahi ho sakta).'
        },
        quiz: [
            {
                question: '[Easy] How do you denote a private member in Python?',
                type: 'syntax',
                options: ['_member', '__member', 'private member', '#member'],
                answer: '__member',
                explanation: 'Double underscore (__) is used for private members to trigger Name Mangling.'
            },
            {
                question: '[Medium] What does a single underscore prefix (_name) conventionally mean?',
                type: 'logic',
                options: ['Private', 'Protected / Internal use only', 'Global', 'Static'],
                answer: 'Protected / Internal use only',
                explanation: 'A single underscore is a "weak" internal indicator. It hints that the member is for internal use, but Python doesn\'t strictly enforce it.'
            },
            {
                question: '[Hard] To access __balance in class Acc from outside, what is the mangled name?',
                type: 'syntax',
                options: ['obj.__balance', 'obj._Acc__balance', 'obj.Acc__balance', 'obj._balance'],
                answer: 'obj._Acc__balance',
                explanation: 'Name Mangling rule: _ClassName__VariableName. So it becomes _Acc__balance.'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                description: 'Define a private attribute "__secret" in class "Vault".',
                initialCode: 'class Vault:\n    def __init__(self, val):\n        ...',
                solution: 'class Vault:\n    def __init__(self, val):\n        self.__secret = val'
            },
            {
                difficulty: 'Medium',
                description: 'Define a protected attribute "_internal" in class "System".',
                initialCode: 'class System:\n    def __init__(self, val):\n        ...',
                solution: 'class System:\n    def __init__(self, val):\n        self._internal = val'
            },
            {
                difficulty: 'Hard',
                description: 'In "Bank", create a private "__balance" and a public "get_balance" method.',
                initialCode: 'class Bank:\n    def __init__(self, b):\n        ...\n    def get_balance(self):\n        ...',
                solution: 'class Bank:\n    def __init__(self, b):\n        self.__balance = b\n    def get_balance(self):\n        return self.__balance'
            }
        ]
    },
    {
        id: 'slide-7',
        title: 'Static Attributes & Methods',
        intro: {
            en: 'Static members are shared by ALL objects of a class and don\'t belong to a specific instance.',
            ur: 'Static members saare objects ke darmiyan shared hote hain aur kisi khaas object se belong nahi karte.'
        },
        explanation: {
            en: '1. Static Attribute: Shared by all objects. Shared memory! \n2. Static Method: Utility function. Doesn\'t need "self". \n\n*Line-by-Line Breakdown:* \n- "class Car: count = 0": "count" is static. All cars share it. \n- "@staticmethod": Decorator that says "No self needed here!". \n- "Car.count += 1": Access static vars using the Class Name.',
            ur: '1. Static Attribute: Saare objects ke liye ek hi variable. Shared memory! \n2. Static Method: Utility function. "self" ki zaroorat nahi hoti. \n\n*Line-by-Line Samajhein:* \n- "class Car: count = 0": "count" static hai. Har car ise share karegi. \n- "@staticmethod": Decorator jo batata hai ke "self zaroori nahi". \n- "Car.count += 1": Static variables ko Class Name se access karein.'
        },
        quiz: [
            {
                question: '[Easy] A static member is shared by ___ instances of a class?',
                type: 'logic',
                options: ['Zero', 'One', 'Two', 'All'],
                answer: 'All',
                explanation: 'Static members belong to the class itself, so all objects share the same copy.'
            },
            {
                question: '[Medium] Which decorator defines a static method?',
                type: 'syntax',
                options: ['@static', '@method', '@staticmethod', '@classmethod'],
                answer: '@staticmethod',
                explanation: '@staticmethod tells Python that this function doesn\'t need "self" or "cls" as its first argument.'
            },
            {
                question: '[Hard] Can a static method access instance attributes using "self"?',
                type: 'logic',
                options: ['Yes', 'No', 'Only if passed as argument', 'Depends on scope'],
                answer: 'No',
                explanation: 'Static methods do not receive "self", so they cannot access instance variables directly.'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                description: 'Add a static attribute "count = 0" to class "User".',
                initialCode: 'class User:\n    ...',
                solution: 'class User:\n    count = 0'
            },
            {
                difficulty: 'Medium',
                description: 'Create a static method "info()" that returns "I am a static method".',
                initialCode: 'class Utils:\n    @...\n    def info():\n        ...',
                solution: 'class Utils:\n    @staticmethod\n    def info():\n        return "I am a static method"'
            },
            {
                difficulty: 'Hard',
                description: 'In class "Counter", increment the static "val" every time __init__ runs.',
                initialCode: 'class Counter:\n    val = 0\n    def __init__(self):\n        ...',
                solution: 'class Counter:\n    val = 0\n    def __init__(self):\n        Counter.val += 1'
            }
        ]
    },
    {
        id: 'slide-8',
        title: 'Final OOP Challenges',
        intro: {
            en: 'Now, let\'s solve some real-world problems using everything we\'ve learned.',
            ur: 'Ab hum real-world problems solve karein ge jo hum ne ab tak seekha hai.'
        },
        explanation: {
            en: 'We will look at Banking, Employee management, and Temperature conversion classes.',
            ur: 'Hum Banking, Employee management, aur Temperature conversion classes dekhein ge.'
        },
        quiz: [
            {
                question: '[Easy] In a Car class, "drive()" is a:',
                type: 'logic',
                options: ['State', 'Behavior/Method', 'Class', 'Object'],
                answer: 'Behavior/Method',
                explanation: 'Actions are behaviors, implemented as methods in OOP.'
            },
            {
                question: '[Medium] How many steps are in our Study Portal flow?',
                type: 'logic',
                options: ['2', '3', '4', '5'],
                answer: '4',
                explanation: 'Intro -> Explanation -> Quiz -> Practice. (The user needs to pay attention to the portal itself!)'
            },
            {
                question: '[Hard] Which of these is a valid way to create a list from a tuple (1,2,3)?',
                type: 'syntax',
                options: ['list((1,2,3))', 'tuple_to_list(1,2,3)', '[1,2,3].from_tuple()', 'None'],
                answer: 'list((1,2,3))',
                explanation: 'The list() constructor can take any iterable, including a tuple.'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                description: 'Create a class "Point" with attributes x and y.',
                initialCode: 'class Point:\n    ...',
                solution: 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y'
            },
            {
                difficulty: 'Medium',
                description: 'Create a "Shape" with a private "__color" and a method to "set_color".',
                initialCode: 'class Shape:\n    ...',
                solution: 'class Shape:\n    def __init__(self, c):\n        self.__color = c\n    def set_color(self, c):\n        self.__color = c'
            },
            {
                difficulty: 'Hard',
                description: 'Create "SmartRect" with private __l, __w, area() method, and static "count".',
                initialCode: 'class SmartRect:\n    count = 0\n    def __init__(self, l, w):\n        ...\n    def area(self):\n        ...',
                solution: 'class SmartRect:\n    count = 0\n    def __init__(self, l, w):\n        self.__l = l\n        self.__w = w\n        SmartRect.count += 1\n    def area(self):\n        return self.__l * self.__w'
            }
        ]
    },
    {
        id: 'slide-9',
        title: 'Final OOPS Question',
        intro: {
            en: 'CONGRATULATIONS! You have reached the Master Level. This final slide contains the ultimate challenge bank.',
            ur: 'MUBARAK HO! Aap Master Level par pahunch gaye hain. Ye slide aap ka aakhri aur sab se bara imtehaan hai.'
        },
        explanation: {
            en: 'This slide tests EVERYTHING: Lists, Loops, Functions, Classes, Private variables, and Static members. \n\n*Master Tip:* If you fail, the coach will tell you EXACTLY which slide to re-study!',
            ur: 'Ye slide SAB KUCH test karti hai: Lists, Loops, Functions, Classes, Private variables, aur Static members. \n\n*Master Tip:* Agar aap fail huye, toh coach batayega ke kaunsi slide dobara parhni hai!'
        },
        quiz: [
            {
                question: '[Master] What is the correct order of OOPS execution?',
                type: 'logic',
                options: ['Class -> Object -> Method', 'Object -> Class -> Method', 'Method -> Class -> Object', 'None'],
                answer: 'Class -> Object -> Method',
                explanation: 'First you define the blueprint (Class), then you create the specific instance (Object), then you call its behaviors (Method).'
            }
        ],
        practice: [
            {
                difficulty: 'Hard',
                description: 'Create a "SmartBankAccount" that has a static "total_accounts", private "__balance", and a method "withdraw" that only works if balance >= amount.',
                initialCode: 'class SmartBankAccount:\n    total_accounts = 0\n    def __init__(self, b):\n        ...\n    def withdraw(self, amount):\n        ...',
                solution: 'class SmartBankAccount:\n    total_accounts = 0\n    def __init__(self, b):\n        self.__balance = b\n        SmartBankAccount.total_accounts += 1\n    def withdraw(self, amount):\n        if self.__balance >= amount: self.__balance -= amount',
                conceptReminder: 'Review Slide 6 (Private Attributes), Slide 7 (Static), and Slide 2 (If Statements).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "GradingSystem" class. It should have a static "pass_mark = 50", private "__marks" list, and a method "get_passed_subjects()" using a loop.',
                initialCode: 'class GradingSystem:\n    pass_mark = 50\n    def __init__(self, marks):\n        self.__marks = marks\n    def get_passed_subjects(self):\n        ...',
                solution: 'class GradingSystem:\n    pass_mark = 50\n    def __init__(self, marks):\n        self.__marks = marks\n    def get_passed_subjects(self):\n        return [m for m in self.__marks if m >= GradingSystem.pass_mark]',
                conceptReminder: 'Review Slide 7 (Static), Slide 6 (Private), and Slide 2 (Loops & Logic).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "SecureList" class with a private "__data" list. Add a method "add_unique(val)" that only adds if val is not in the list.',
                initialCode: 'class SecureList:\n    def __init__(self):\n        self.__data = []\n    def add_unique(self, val):\n        ...',
                solution: 'class SecureList:\n    def __init__(self):\n        self.__data = []\n    def add_unique(self, val):\n        if val not in self.__data: self.__data.append(val)',
                conceptReminder: 'Review Slide 1 (Lists) and Slide 6 (Private Attributes).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "CarFactory" with a static "cars_made" and a private "__model". Every time a Car is created, increment static count.',
                initialCode: 'class Car:\n    cars_made = 0\n    def __init__(self, m):\n        ...',
                solution: 'class Car:\n    cars_made = 0\n    def __init__(self, m):\n        self.__model = m\n        Car.cars_made += 1',
                conceptReminder: 'Review Slide 7 (Static) and Slide 6 (Private Members).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "MathTools" class with a @staticmethod "square(x)" and "cube(x)".',
                initialCode: 'class MathTools:\n    @...\n    def square(x):\n        ...\n    @...\n    def cube(x):\n        ...',
                solution: 'class MathTools:\n    @staticmethod\n    def square(x): return x*x\n    @staticmethod\n    def cube(x): return x*x*x',
                conceptReminder: 'Review Slide 7 (Static Methods).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "SmartPoint" with private __x and __y. Add a method "reset()" that sets them to 0.',
                initialCode: 'class SmartPoint:\n    def __init__(self, x, y):\n        ...\n    def reset(self):\n        ...',
                solution: 'class SmartPoint:\n    def __init__(self, x, y):\n        self.__x = x\n        self.__y = y\n    def reset(self):\n        self.__x = 0\n        self.__y = 0',
                conceptReminder: 'Review Slide 6 (Private Attributes).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "UserCounter" with a static "total = 0" and a method "get_total()". Increment in __init__.',
                initialCode: 'class UserCounter:\n    total = 0\n    def __init__(self):\n        ...\n    def get_total(self):\n        ...',
                solution: 'class UserCounter:\n    total = 0\n    def __init__(self):\n        UserCounter.total += 1\n    def get_total(self):\n        return UserCounter.total',
                conceptReminder: 'Review Slide 7 (Static Attributes).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "TempConverter" with static methods "c_to_f(c)" and "f_to_c(f)".',
                initialCode: 'class TempConverter:\n    @...\n    def c_to_f(c): return (c * 9/5) + 32\n    @...\n    def f_to_c(f): ...',
                solution: 'class TempConverter:\n    @staticmethod\n    def c_to_f(c): return (c * 9/5) + 32\n    @staticmethod\n    def f_to_c(f): return (f - 32) * 5/9',
                conceptReminder: 'Review Slide 7 (Static Methods).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "Storage" class with a private "__items" list. Add "clear()" and "get_count()" methods.',
                initialCode: 'class Storage:\n    def __init__(self):\n        self.__items = []\n    def clear(self):\n        ...\n    def get_count(self):\n        ...',
                solution: 'class Storage:\n    def __init__(self):\n        self.__items = []\n    def clear(self):\n        self.__items = []\n    def get_count(self):\n        return len(self.__items)',
                conceptReminder: 'Review Slide 1 (Lists) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create "Teacher" class with public "name" and private "__subject". Add a method "teach()".',
                initialCode: 'class Teacher:\n    def __init__(self, n, s):\n        ...\n    def teach(self):\n        ...',
                solution: 'class Teacher:\n    def __init__(self, n, s):\n        self.name = n\n        self.__subject = s\n    def teach(self):\n        return f"{self.name} teaching {self.__subject}"',
                conceptReminder: 'Review Slide 5 (Classes) and Slide 6 (Access Modifiers).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "Rectangle" with private __width, __height, and a static "units = cm". Add "get_area()".',
                initialCode: 'class Rectangle:\n    units = "cm"\n    def __init__(self, w, h):\n        ...\n    def get_area(self):\n        ...',
                solution: 'class Rectangle:\n    units = "cm"\n    def __init__(self, w, h):\n        self.__width = w\n        self.__height = h\n    def get_area(self):\n        return self.__width * self.__height',
                conceptReminder: 'Review Slide 6 (Private) and Slide 7 (Static).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "Counter" that has a static "limit = 10" and a private "__val". Increment val in "tick()", but stop if it hits limit.',
                initialCode: 'class Counter:\n    limit = 10\n    def __init__(self):\n        self.__val = 0\n    def tick(self):\n        ...',
                solution: 'class Counter:\n    limit = 10\n    def __init__(self):\n        self.__val = 0\n    def tick(self):\n        if self.__val < Counter.limit: self.__val += 1',
                conceptReminder: 'Review Slide 7 (Static) and Slide 6 (Private Attributes).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "Product" with private "__price" and a static method "apply_tax(p)".',
                initialCode: 'class Product:\n    def __init__(self, p):\n        self.__price = p\n    @...\n    def apply_tax(p):\n        return p * 1.15',
                solution: 'class Product:\n    def __init__(self, p):\n        self.__price = p\n    @staticmethod\n    def apply_tax(p):\n        return p * 1.15',
                conceptReminder: 'Review Slide 7 (Static Methods) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "ScoreBoard" with a static "top_score = 100" and a private "__current". Update top_score if current exceeds it.',
                initialCode: 'class ScoreBoard:\n    top_score = 100\n    def __init__(self):\n        self.__current = 0\n    def update(self, s):\n        ...',
                solution: 'class ScoreBoard:\n    top_score = 100\n    def __init__(self):\n        self.__current = 0\n    def update(self, s):\n        self.__current = s\n        if s > ScoreBoard.top_score: ScoreBoard.top_score = s',
                conceptReminder: 'Review Slide 7 (Static) and Slide 2 (Logic).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "SmartList" that only allows adding strings. Use a loop to check.',
                initialCode: 'class SmartList:\n    def __init__(self):\n        self.data = []\n    def add(self, items):\n        for i in items:\n            ...',
                solution: 'class SmartList:\n    def __init__(self):\n        self.data = []\n    def add(self, items):\n        for i in items:\n            if isinstance(i, str): self.data.append(i)',
                conceptReminder: 'Review Slide 1 (Lists) and Slide 2 (Loops).'
            },
            {
                difficulty: 'Hard',
                description: 'Define a "Database" class with a private "__connection" string and a method "connect()".',
                initialCode: 'class Database:\n    def __init__(self, c):\n        ...\n    def connect(self):\n        ...',
                solution: 'class Database:\n    def __init__(self, c):\n        self.__connection = c\n    def connect(self):\n        return f"Connected to {self.__connection}"',
                conceptReminder: 'Review Slide 6 (Private Attributes).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "Vector" class with attributes x, y, and a method "length()" that returns (x**2 + y**2)**0.5.',
                initialCode: 'class Vector:\n    def __init__(self, x, y):\n        ...\n    def length(self):\n        ...',
                solution: 'class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def length(self):\n        return (self.x**2 + self.y**2)**0.5',
                conceptReminder: 'Review Slide 5 (Classes and Objects) and Slide 4 (Functions/Methods).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "SmartHome" with private "__devices" list and a static "power_status = True". Add a method "toggle_all()".',
                initialCode: 'class SmartHome:\n    power_status = True\n    def __init__(self):\n        self.__devices = []\n    def toggle_all(self):\n        ...',
                solution: 'class SmartHome:\n    power_status = True\n    def __init__(self):\n        self.__devices = []\n    def toggle_all(self):\n        SmartHome.power_status = not SmartHome.power_status',
                conceptReminder: 'Review Slide 7 (Static) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "TrafficLight" with private "__color" and a method "next()" that cycles Red->Green->Yellow.',
                initialCode: 'class TrafficLight:\n    def __init__(self):\n        self.__color = "Red"\n    def next(self):\n        ...',
                solution: 'class TrafficLight:\n    def __init__(self):\n        self.__color = "Red"\n    def next(self):\n        if self.__color == "Red": self.__color = "Green"\n        elif self.__color == "Green": self.__color = "Yellow"\n        else: self.__color = "Red"',
                conceptReminder: 'Review Slide 6 (Private) and Slide 2 (Logic).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "SimpleWallet" with private "__amount". Add "add(val)" and "spend(val)" with logic.',
                initialCode: 'class SimpleWallet:\n    def __init__(self):\n        self.__amount = 0\n    def spend(self, v):\n        ...',
                solution: 'class SimpleWallet:\n    def __init__(self):\n        self.__amount = 0\n    def add(self, v): self.__amount += v\n    def spend(self, v):\n        if self.__amount >= v: self.__amount -= v',
                conceptReminder: 'Review Slide 6 (Private) and Slide 2 (Logic).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "UserSession" with a static "active_count" and private "__user_id". Increment/Decrement in __init__ and delete.',
                initialCode: 'class UserSession:\n    active_count = 0\n    def __init__(self, uid):\n        ...\n    def end(self):\n        ...',
                solution: 'class UserSession:\n    active_count = 0\n    def __init__(self, uid):\n        self.__user_id = uid\n        UserSession.active_count += 1\n    def end(self):\n        UserSession.active_count -= 1',
                conceptReminder: 'Review Slide 7 (Static) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "Inventory" that uses a loop to find an item in a private list "__stock".',
                initialCode: 'class Inventory:\n    def __init__(self, s):\n        self.__stock = s\n    def find(self, item):\n        ...',
                solution: 'class Inventory:\n    def __init__(self, s):\n        self.__stock = s\n    def find(self, item):\n        return item in self.__stock',
                conceptReminder: 'Review Slide 1 (Lists) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Develop a "SystemLogger" with a static "log_history" (list) and a method "log(msg)".',
                initialCode: 'class SystemLogger:\n    log_history = []\n    def log(self, m):\n        ...',
                solution: 'class SystemLogger:\n    log_history = []\n    def log(self, m):\n        SystemLogger.log_history.append(m)',
                conceptReminder: 'Review Slide 7 (Static) and Slide 1 (Lists).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "Profile" with private "__name" and "@staticmethod validate_name(n)".',
                initialCode: 'class Profile:\n    @...\n    def validate_name(n):\n        return len(n) > 3',
                solution: 'class Profile:\n    @staticmethod\n    def validate_name(n):\n        return len(n) > 3',
                conceptReminder: 'Review Slide 7 (Static Methods) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create "MultiCounter" with static "c1", "c2". Methods to increment both.',
                initialCode: 'class MultiCounter:\n    c1, c2 = 0, 0\n    def inc(self):\n        ...',
                solution: 'class MultiCounter:\n    c1, c2 = 0, 0\n    def inc(self):\n        MultiCounter.c1 += 1\n        MultiCounter.c2 += 1',
                conceptReminder: 'Review Slide 7 (Static Attributes).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "StringTool" with a static method "is_empty(s)".',
                initialCode: 'class StringTool:\n    @...\n    def is_empty(s):\n        ...',
                solution: 'class StringTool:\n    @staticmethod\n    def is_empty(s):\n        return s == ""',
                conceptReminder: 'Review Slide 7 (Static Methods).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "SafeDict" with a private "__storage". Method "set(k, v)" and "get(k)".',
                initialCode: 'class SafeDict:\n    def __init__(self):\n        self.__storage = {}\n    def set(self, k, v):\n        ...',
                solution: 'class SafeDict:\n    def __init__(self):\n        self.__storage = {}\n    def set(self, k, v):\n        self.__storage[k] = v\n    def get(self, k):\n        return self.__storage.get(k)',
                conceptReminder: 'Review Slide 3 (Dictionaries) and Slide 6 (Private Attributes).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "SmartLamp" with a static "is_gloal_off" and private "__brightness".',
                initialCode: 'class SmartLamp:\n    is_global_off = False\n    def __init__(self, b):\n        ...',
                solution: 'class SmartLamp:\n    is_global_off = False\n    def __init__(self, b):\n        self.__brightness = b',
                conceptReminder: 'Review Slide 6 (Private) and Slide 7 (Static).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "PasswordManager" with a private "__vault" dict. Add "save(site, pass)" and "load(site)".',
                initialCode: 'class PasswordManager:\n    def __init__(self):\n        self.__vault = {}\n    def save(self, s, p):\n        ...',
                solution: 'class PasswordManager:\n    def __init__(self):\n        self.__vault = {}\n    def save(self, s, p): self.__vault[s] = p\n    def load(self, s): return self.__vault.get(s)',
                conceptReminder: 'Review Slide 3 (Dictionaries) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "Counter" with a @staticmethod "info()" and private "__name".',
                initialCode: 'class Counter:\n    @...\n    def info(): return "Static"\n    def __init__(self, n):\n        ...',
                solution: 'class Counter:\n    @staticmethod\n    def info(): return "Static"\n    def __init__(self, n): self.__name = n',
                conceptReminder: 'Review Slide 7 (Static Methods) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "Calculator" that has a private "__history" list of results.',
                initialCode: 'class Calculator:\n    def __init__(self):\n        self.__history = []\n    def add(self, a, b):\n        res = a + b\n        ...',
                solution: 'class Calculator:\n    def __init__(self):\n        self.__history = []\n    def add(self, a, b):\n        self.__history.append(a + b)\n        return a + b',
                conceptReminder: 'Review Slide 1 (Lists) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "Settings" class with static "theme = Dark" and private "__font".',
                initialCode: 'class Settings:\n    theme = "Dark"\n    def __init__(self, f):\n        ...',
                solution: 'class Settings:\n    theme = "Dark"\n    def __init__(self, f): self.__font = f',
                conceptReminder: 'Review Slide 7 (Static) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create "MultiAdder" with static "total" and method "add_multiple(items)".',
                initialCode: 'class MultiAdder:\n    total = 0\n    def add_multiple(self, items):\n        for i in items:\n            ...',
                solution: 'class MultiAdder:\n    total = 0\n    def add_multiple(self, items):\n        for i in items: MultiAdder.total += i',
                conceptReminder: 'Review Slide 7 (Static) and Slide 2 (Loops).'
            },
            {
                difficulty: 'Hard',
                description: 'Build "AppConfig" with private "__api_key" and static "version = 1.0".',
                initialCode: 'class AppConfig:\n    version = 1.0\n    def __init__(self, k):\n        ...',
                solution: 'class AppConfig:\n    version = 1.0\n    def __init__(self, k): self.__api_key = k',
                conceptReminder: 'Review Slide 6 (Private) and Slide 7 (Static).'
            },
            {
                difficulty: 'Hard',
                description: 'Create "MathLib" with static methods "add(a,b)" and "sub(a,b)".',
                initialCode: 'class MathLib:\n    @...\n    def add(a,b): ...',
                solution: 'class MathLib:\n    @staticmethod\n    def add(a,b): return a + b\n    @staticmethod\n    def sub(a,b): return a - b',
                conceptReminder: 'Review Slide 7 (Static Methods).'
            },
            {
                difficulty: 'Hard',
                description: 'Create "SecureUser" with private "__pin" and public method "check_pin(p)".',
                initialCode: 'class SecureUser:\n    def __init__(self, p):\n        self.__pin = p\n    def check_pin(self, p):\n        ...',
                solution: 'class SecureUser:\n    def __init__(self, p):\n        self.__pin = p\n    def check_pin(self, p): return self.__pin == p',
                conceptReminder: 'Review Slide 6 (Private Attributes).'
            },
            {
                difficulty: 'Hard',
                description: 'Build a "SafeCounter" with private "__val" and static "limit". Increment in "tick" but check limit.',
                initialCode: 'class SafeCounter:\n    limit = 5\n    def __init__(self):\n        self.__val = 0\n    def tick(self):\n        ...',
                solution: 'class SafeCounter:\n    limit = 5\n    def __init__(self):\n        self.__val = 0\n    def tick(self):\n        if self.__val < SafeCounter.limit: self.__val += 1',
                conceptReminder: 'Review Slide 7 (Static) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create a "ListSearcher" with a private "__data" list and method "has(v)".',
                initialCode: 'class ListSearcher:\n    def __init__(self, d):\n        self.__data = d\n    def has(self, v):\n        ...',
                solution: 'class ListSearcher:\n    def __init__(self, d):\n        self.__data = d\n    def has(self, v): return v in self.__data',
                conceptReminder: 'Review Slide 1 (Lists) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Build "AppInfo" with static "name = MyApp" and private "__key".',
                initialCode: 'class AppInfo:\n    name = "MyApp"\n    def __init__(self, k): ...',
                solution: 'class AppInfo:\n    name = "MyApp"\n    def __init__(self, k): self.__key = k',
                conceptReminder: 'Review Slide 7 (Static) and Slide 6 (Private).'
            },
            {
                difficulty: 'Hard',
                description: 'Create "MathUtil" with static method "is_even(n)".',
                initialCode: 'class MathUtil:\n    @...\n    def is_even(n): ...',
                solution: 'class MathUtil:\n    @staticmethod\n    def is_even(n): return n % 2 == 0',
                conceptReminder: 'Review Slide 7 (Static Methods).'
            },
            {
                difficulty: 'Hard',
                description: 'Build "Member" with private "__id" and public "get_id()".',
                initialCode: 'class Member:\n    def __init__(self, i): ...',
                solution: 'class Member:\n    def __init__(self, i): self.__id = i\n    def get_id(self): return self.__id',
                conceptReminder: 'Review Slide 6 (Access Modifiers).'
            }
        ]
    },
    {
        id: 'slide-10',
        title: 'Correct the Syntax (Paper Prep)',
        intro: {
            en: 'This slide is for Exam Paper preparation. You must find and fix errors in the provided code.',
            ur: 'Ye slide Exam Paper ki tabyari ke liye hai. Aap ko diye gaye code mein syntax errors dhoond kar theek karne hain.'
        },
        explanation: {
            en: 'Syntax errors are like grammar mistakes. Common ones: missing colons (:), wrong indentation, or incorrect keyword spelling.',
            ur: 'Syntax errors grammar ki galtiyon ki tarah hain. Maslan colons (:) ka na hona, space/indentation ki galti, ya keywords ke galat spelling.'
        },
        quiz: [
            {
                question: 'What is missing: "if x == 5"',
                type: 'syntax',
                options: ['Nothing', 'A colon (:) at the end', 'Parentheses ()', 'Square brackets []'],
                answer: 'A colon (:) at the end',
                explanation: 'In Python, if, for, while, and def statements MUST end with a colon (:).'
            }
        ],
        practice: [
            {
                difficulty: 'Easy',
                mode: 'repair',
                description: 'FIX THE SYNTAX: def hello() print("Hi")',
                initialCode: 'def hello()\nprint("Hi")',
                solution: 'def hello():\n    print("Hi")',
                conceptReminder: 'Missing colon (:) after function name and missing indentation for the print statement.'
            },
            {
                difficulty: 'Medium',
                mode: 'repair',
                description: 'FIX THE SYNTAX: class car def __init__(self, name) self.name = name',
                initialCode: 'class car\ndef __init__(self, name)\nself.name = name',
                solution: 'class car:\n    def __init__(self, name):\n        self.name = name',
                conceptReminder: 'Classes and methods both need colons (:) and proper indentation levels.'
            },
            {
                difficulty: 'Hard',
                mode: 'repair',
                description: 'FIX THE ERRORS: for i in range(5) print i',
                initialCode: 'for i in range(5)\nprint i',
                solution: 'for i in range(5):\n    print(i)',
                conceptReminder: 'For loops need a colon (:) and Python 3 handles print as a function with parentheses.'
            }
        ]
    }
];
