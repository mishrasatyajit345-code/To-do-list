/*
  script.js — The BRAIN / BEHAVIOR of your website
  ==================================================
  This file handles all interactions:
  - Dark mode toggle
  - To-do list (add, complete, delete, filter tasks)
  - Contact form validation and submission

  It is linked in index.html at the BOTTOM of <body>:
  <script src="script.js"></script>

  HOW JAVASCRIPT WORKS WITH HTML:
  1. document.getElementById("someId") → finds an element by its id=""
  2. element.textContent = "..."       → changes the text inside it
  3. element.classList.add("class")   → adds a CSS class to it
  4. element.addEventListener(...)    → listens for user actions

  JavaScript runs TOP TO BOTTOM when the page loads.
*/


/* =============================================
   AUTO-SET FOOTER YEAR
   This sets the current year automatically.
   No need to update it manually every year!
============================================= */

// document.getElementById finds the <span id="year"> in index.html
// new Date().getFullYear() gets the current year (e.g. 2025)
document.getElementById("year").textContent = new Date().getFullYear();


/* =============================================
   NAVBAR SCROLL EFFECT
   Adds a subtle shadow to navbar when you scroll down.
============================================= */

// window.addEventListener listens for events on the browser window
// "scroll" fires every time the user scrolls
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");

  // window.scrollY = how many pixels you've scrolled from the top
  if (window.scrollY > 50) {
    navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.1)";
  } else {
    navbar.style.boxShadow = "none";
  }
});


/* =============================================
   DARK MODE TOGGLE
   When user clicks the moon/sun button,
   we add or remove the "dark" class on <body>.
   CSS in style.css handles the actual color change.
============================================= */

// Find the toggle button by its id="themeBtn"
const themeBtn  = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");

// Add a click listener — this function runs every time the button is clicked
themeBtn.addEventListener("click", function () {

  // document.body is the <body> element
  // classList.toggle adds the class if missing, removes it if present
  document.body.classList.toggle("dark");

  // Check if dark mode is now ON or OFF
  const isDark = document.body.classList.contains("dark");

  // Change the icon: moon 🌙 in light mode, sun ☀️ in dark mode
  themeIcon.textContent = isDark ? "☀️" : "🌙";

  // localStorage saves data in the browser so it persists
  // even after refreshing the page
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// On page load, check if user previously chose dark mode
// localStorage.getItem retrieves saved data
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeIcon.textContent = "☀️";
}


/* =============================================
   TO-DO LIST
   We store tasks as an array of objects:
   [
     { id: 1, text: "Study CSS", done: false },
     { id: 2, text: "Watch tutorial", done: true },
   ]
   Then we "render" (draw) them into the HTML.
============================================= */

// Our tasks array — starts empty
let tasks = [];

// Which filter is active: "all", "active", or "done"
let currentFilter = "all";

// Counter to give each task a unique id
let taskIdCounter = 1;


/*
  addTask()
  Called when the user clicks "Add Task" button (onclick="addTask()")
  Reads the input value, creates a task object, adds it to the array,
  then re-renders the list.
*/
function addTask() {
  // Get the input element by its id
  const input = document.getElementById("taskInput");

  // .value is the text the user typed
  // .trim() removes spaces from the start and end
  const text = input.value.trim();

  // Don't add empty tasks
  if (text === "") {
    // Briefly shake the input to signal an error
    input.style.borderColor = "var(--error)";
    setTimeout(function () {
      input.style.borderColor = "";
    }, 1000);
    return; // Stop the function here
  }

  // Create a new task object
  const newTask = {
    id: taskIdCounter,   // Unique id
    text: text,          // The task text
    done: false          // Not completed yet
  };

  taskIdCounter++; // Increment for next task

  // Push (add) the task to our array
  tasks.push(newTask);

  // Clear the input field
  input.value = "";
  input.focus(); // Put cursor back in input

  // Re-draw the list
  renderTasks();
}

// Also allow pressing Enter key to add task
document.getElementById("taskInput").addEventListener("keypress", function (e) {
  // e.key is which key was pressed
  if (e.key === "Enter") {
    addTask();
  }
});


/*
  toggleTask(id)
  Called when user clicks the circle checkbox.
  Finds the task by id and flips its done value.
*/
function toggleTask(id) {
  // Find the task in our array that has this id
  // .find() returns the first item where the condition is true
  const task = tasks.find(function (t) { return t.id === id; });

  if (task) {
    // ! means "opposite of" — flips true to false, false to true
    task.done = !task.done;
  }

  renderTasks(); // Re-draw
}


/*
  deleteTask(id)
  Removes a task from the array using .filter()
  .filter() keeps only items where the condition is true
*/
function deleteTask(id) {
  // Keep all tasks EXCEPT the one with this id
  tasks = tasks.filter(function (t) { return t.id !== id; });
  renderTasks();
}


/*
  clearCompleted()
  Removes all tasks where done === true
*/
function clearCompleted() {
  tasks = tasks.filter(function (t) { return !t.done; });
  renderTasks();
}


/*
  filterTasks(filter, buttonEl)
  Changes which tasks are shown (all/active/done)
  Also updates which filter button looks "active"
*/
function filterTasks(filter, buttonEl) {
  currentFilter = filter;

  // Remove "active" class from all filter buttons
  // querySelectorAll returns all elements matching the CSS selector
  const allBtns = document.querySelectorAll(".filter-btn");
  allBtns.forEach(function (btn) {
    btn.classList.remove("active");
  });

  // Add "active" to the clicked button
  buttonEl.classList.add("active");

  renderTasks();
}


/*
  renderTasks()
  This is the MAIN function that draws the task list.
  It runs every time tasks change.

  Steps:
  1. Filter tasks based on currentFilter
  2. Clear the <ul> list in HTML
  3. If no tasks, show empty message
  4. Otherwise, loop through tasks and create <li> elements
  5. Update the footer count
*/
function renderTasks() {
  const taskList   = document.getElementById("taskList");
  const todoFooter = document.getElementById("todoFooter");
  const taskCount  = document.getElementById("taskCount");

  // Step 1: Filter
  let filtered;
  if (currentFilter === "active") {
    filtered = tasks.filter(function (t) { return !t.done; });
  } else if (currentFilter === "done") {
    filtered = tasks.filter(function (t) { return t.done; });
  } else {
    filtered = tasks; // Show all
  }

  // Step 2: Clear existing list
  // innerHTML = "" removes everything inside the <ul>
  taskList.innerHTML = "";

  // Step 3: Empty state
  if (filtered.length === 0) {
    const emptyMsg = tasks.length === 0
      ? "No tasks yet! Add one above. ✨"
      : "No tasks in this filter.";
    taskList.innerHTML = '<li class="task-empty">' + emptyMsg + '</li>';
  } else {
    // Step 4: Create an <li> for each task
    filtered.forEach(function (task) {
      // Create a list item element
      const li = document.createElement("li");

      // Set its CSS classes
      // If task.done is true, add "done" class (CSS adds strikethrough)
      li.className = "task-item" + (task.done ? " done" : "");

      // Set its HTML content (using template literal `` ` `` )
      // The onclick calls functions with this task's id
      li.innerHTML = `
        <button
          class="task-check ${task.done ? "checked" : ""}"
          onclick="toggleTask(${task.id})"
          title="${task.done ? "Mark incomplete" : "Mark complete"}"
        >${task.done ? "✓" : ""}</button>

        <span class="task-text">${escapeHtml(task.text)}</span>

        <button class="task-delete" onclick="deleteTask(${task.id})" title="Delete task">
          ✕
        </button>
      `;

      // appendChild adds this <li> to the <ul>
      taskList.appendChild(li);
    });
  }

  // Step 5: Update footer
  if (tasks.length > 0) {
    // Show footer
    todoFooter.style.display = "flex";
    // Count only active (not done) tasks
    const remaining = tasks.filter(function (t) { return !t.done; }).length;
    taskCount.textContent = remaining + " task" + (remaining !== 1 ? "s" : "") + " remaining";
  } else {
    todoFooter.style.display = "none";
  }
}

/*
  escapeHtml(text)
  Safety function: prevents users from injecting HTML/scripts
  by replacing special characters like < > & with safe versions.
  IMPORTANT: Always do this before inserting user input into innerHTML!
*/
function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return text.replace(/[&<>"']/g, function (c) { return map[c]; });
}

// Initial render (shows empty state on page load)
renderTasks();


/* =============================================
   CONTACT FORM VALIDATION & SUBMISSION
   Called when user submits the form:
   <form onsubmit="return handleSubmit(event)">

   Steps:
   1. Prevent page from refreshing (e.preventDefault)
   2. Get values from inputs
   3. Validate each field
   4. Show success or error message
============================================= */

function handleSubmit(event) {
  // Step 1: Stop the form from refreshing the page
  // (default browser behavior for forms)
  event.preventDefault();

  // Step 2: Get field values
  const name    = document.getElementById("name").value.trim();
  const email   = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  // Step 3: Validate — check each field and show errors
  let hasError = false; // Track if any field failed

  // Validate Name
  if (name === "") {
    showError("nameError", "Please enter your name.");
    hasError = true;
  } else if (name.length < 2) {
    showError("nameError", "Name must be at least 2 characters.");
    hasError = true;
  } else {
    clearError("nameError"); // All good — clear any previous error
  }

  // Validate Email
  if (email === "") {
    showError("emailError", "Please enter your email address.");
    hasError = true;
  } else if (!isValidEmail(email)) {
    showError("emailError", "Please enter a valid email (e.g. you@gmail.com).");
    hasError = true;
  } else {
    clearError("emailError");
  }

  // Validate Message
  if (message === "") {
    showError("messageError", "Please write a message.");
    hasError = true;
  } else if (message.length < 10) {
    showError("messageError", "Message should be at least 10 characters.");
    hasError = true;
  } else {
    clearError("messageError");
  }

  // Step 4: If any error, stop here
  if (hasError) return false;

  // Step 4b: All valid! Show success message
  // In a real project, you'd send data to a server here using fetch()
  showToast("✅ Message sent successfully! I'll get back to you soon.", "success");

  // Clear the form
  document.getElementById("contactForm").reset();

  // return false prevents any further form action
  return false;
}


/*
  showError(elementId, message)
  Finds the error <span> by id and sets its text.
*/
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message; // Set the error text
}

/*
  clearError(elementId)
  Removes the error message from a field.
*/
function clearError(elementId) {
  document.getElementById(elementId).textContent = "";
}

/*
  isValidEmail(email)
  Uses a Regular Expression (regex) to check if email format is valid.
  A regex is a pattern for matching strings.
  /.../ is how you write a regex in JavaScript.
*/
function isValidEmail(email) {
  // This pattern means: something @ something . something
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email); // .test() returns true or false
}

/*
  showToast(message, type)
  Shows a notification box below the form.
  type is "success" or "error-toast"
*/
function showToast(message, type) {
  const toast = document.getElementById("formToast");

  // Set message and style
  toast.textContent = message;
  toast.className = "form-toast " + type + " show"; // Add classes

  // Hide toast after 4 seconds
  // setTimeout runs a function after a delay (in milliseconds)
  setTimeout(function () {
    toast.classList.remove("show");
  }, 4000); // 4000ms = 4 seconds
}


/*
  LIVE VALIDATION
  Clear error on each field as the user starts typing.
  This gives instant feedback — much better UX!
*/
document.getElementById("name").addEventListener("input", function () {
  clearError("nameError");
});

document.getElementById("email").addEventListener("input", function () {
  clearError("emailError");
});

document.getElementById("message").addEventListener("input", function () {
  clearError("messageError");
});