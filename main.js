"use strict";
// ************************************************************************************/
//                                  Application selectors
//**************************************************************************************/
const middleStatusDiv = document
  .querySelector(".status-div__middle-div")
  .cloneNode(true);
const form = document.getElementById("form");
const todoInputEl = document.getElementById("todo");
const todoList = document.querySelector(".todosList");
let todoArray = JSON.parse(localStorage.getItem("todos")) || [];
let icon = document.getElementById("icon");
let styleSheet = localStorage.getItem("styleSheet") || "";
let theme = localStorage.getItem("theme") || "images/icon-sun.svg";
const counterSpanEl = document.querySelector("[data-counter]");
const emptyMsg = document.querySelector(".empty-message");
const clearCompleteBtn = document.querySelector(".status-div button");
const filterBtns = document.querySelectorAll(".status-div__middle-div button");
let filterBtnsLargeScreens;
const lightModeTag = document.getElementById("lightMode");
const themeSwitcherBtn = document.querySelector("header button");

// ************************************************************************************/
//                                  Application functions
//**************************************************************************************/

function initializeFilterDiv() {
  if (window.innerWidth >= 768) {
    const desktopStatusDiv = document.querySelector(".middle-div");
    // we can update the class of cloned element in two different methods:
    // - First method:
    // middleStatusDiv.classList.remove('status-div__middle-div')
    // middleStatusDiv.classList.add('status-div__middle-div--flex')
    // - Second method by overriding original class name using className property:
    middleStatusDiv.className = "status-div__middle-div--flex";
    desktopStatusDiv.appendChild(middleStatusDiv);
    filterBtnsLargeScreens = document.querySelectorAll(
      ".status-div__middle-div--flex button"
    );
    filterBtnsLargeScreens.forEach((element) => {
      element.addEventListener("click", filterTodo);
    });
  }
}

function removeFilterDiv() {
  if (window.innerWidth < 768) {
    if (middleStatusDiv) {
      middleStatusDiv.remove();
    }
  }
}

initializeFilterDiv();

function displayTodo(todoArray) {
  let todoText = "";
  todoArray.forEach((todo, index) => {
    todoText += `
        <li class="todo-item" data-id="${index}" draggable="true">
            <div class="checkbox-div">
                <label for="checkbox${index}" class="label">checkbox</label>
                <input type="checkbox" id="checkbox${index}" class="checkbox-round" ${
      todo.todoStatus ? " checked" : ""
    }/>
                <p class="todo-text">${todo.todoItem}</p>
            </div>
            <button type="button">
                <img src="images/icon-cross.svg" alt="delete todo item" />
            </button>
        </li>

        `;
  });
  todoList.innerHTML = todoText;
  handleEmptyMessage();
}

function addTodo(e) {
  let duplicateStatus = false;
  e.preventDefault();
  if (todoInputEl.value === "") {
    alert("Enter todo...");
    return;
  }
  todoArray.forEach((element) => {
    if (element.todoItem === todoInputEl.value) {
      alert("Todo already exists..🛑. Try something else");
      duplicateStatus = true;
      todoInputEl.value = "";
      return;
    }
  });
  if (duplicateStatus === true) return;

  let todoItem = todoInputEl.value.trim();
  let todoStatus = false;
  todoArray.push({
    todoItem,
    todoStatus,
  });

  displayTodo(todoArray);
  handleEmptyMessage();
  getTodoCount();
  saveToLocalStorage(todoArray);
  todoInputEl.value = "";
}

function removeTodo(e) {
  if (e.target.nodeName !== "IMG") return;
  const removedItem =
    e.target.parentNode.previousElementSibling.children[2].textContent;
  todoArray = todoArray.filter((todo) => {
    if (todo.todoItem !== removedItem) return todo;
  });

  if (window.confirm(`Are you sure you want to delete: ${removedItem}`)) {
    e.target.parentNode.parentNode.remove();
    handleEmptyMessage();
    getTodoCount();
  } else return;
  saveToLocalStorage(todoArray);
}

function handleEmptyMessage() {
  if (todoList.children.length > 0) {
    emptyMsg.classList.add("hide");
  } else {
    emptyMsg.classList.remove("hide");
  }
}

function getTodoCount() {
  let countArray = todoArray.filter((element) => {
    if (element.todoStatus === false) return element;
  });
  counterSpanEl.textContent = countArray.length;
}

function updateTodoStatus(event) {
  const status = event.target.checked;
  const targetElText = event.target.nextElementSibling.textContent;
  todoArray.forEach((element) => {
    if (element.todoItem === targetElText) {
      element.todoStatus = status;
    }
  });
  getTodoCount();
  saveToLocalStorage(todoArray);
}

function clearCompleted() {
  todoArray = todoArray.filter((element) => element.todoStatus === false);
  displayTodo(todoArray);
  getTodoCount();
  saveToLocalStorage(todoArray);
}

function filterTodo(event) {
  if (event.target.textContent === "All") displayTodo(todoArray);

  if (event.target.textContent === "Active") {
    const itemsCount = todoArray.filter(
      (element) => element.todoStatus === false
    ).length;
    if (itemsCount === 0) {
      alert("No Active items found 🤚");
    } else {
      displayTodo(todoArray.filter((element) => element.todoStatus === false));
    }
  }
  if (event.target.textContent === "Completed") {
    const itemsCount = todoArray.filter(
      (element) => element.todoStatus === true
    ).length;

    itemsCount === 0
      ? alert("No completed items found 🤚")
      : displayTodo(todoArray.filter((element) => element.todoStatus === true));
  }
}

// drag and drop functionality
function dragStart(e) {
  e.dataTransfer.setData("dragStartIndex", e.target.getAttribute("data-id"));
}

function dragEnter(e) {
  e.target.classList.add("draggable");
}

function dragLeave(e) {
  e.target.classList.remove("draggable");
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const dragStartIndex = e.dataTransfer.getData("dragStartIndex");
  const dragEndIndex = parseInt(e.target.getAttribute("data-id"), 10);
  console.log(dragEndIndex);
  swapTodos(dragStartIndex, dragEndIndex);
  e.target.classList.remove("draggable");
}

function swapTodos(fromIndex, toIndex) {
  const sourceEl = todoList.querySelector(`[data-id= "${fromIndex}"]`);
  const targetEl = todoList.querySelector(`[data-id= "${toIndex}"]`);
  console.log(sourceEl, targetEl);
  // swap the source and target element by array destructuring method
  [todoArray[fromIndex], todoArray[toIndex]] = [
    todoArray[toIndex],
    todoArray[fromIndex],
  ];
  displayTodo(todoArray);
  saveToLocalStorage(todoArray);
}

function changeTheme(e) {
  if (
    e.currentTarget.firstElementChild.getAttribute("src") ===
    "images/icon-sun.svg"
  ) {
    e.currentTarget.firstElementChild.setAttribute(
      "src",
      "images/icon-moon.svg"
    );
    lightModeTag.setAttribute("href", "lightMode.css");
    localStorage.setItem("theme", "images/icon-moon.svg");
    localStorage.setItem("styleSheet", "lightMode.css");
  } else if (
    e.currentTarget.firstElementChild.getAttribute("src") ===
    "images/icon-moon.svg"
  ) {
    e.currentTarget.firstElementChild.setAttribute(
      "src",
      "images/icon-sun.svg"
    );
    lightModeTag.removeAttribute("href", "lightMode.css");
    localStorage.setItem("theme", "images/icon-sun.svg");
    localStorage.setItem("styleSheet", "");
  }
}

function saveToLocalStorage(todo) {
  localStorage.setItem("todos", JSON.stringify(todo));
}

function loadTheme(icon, styleSheet) {
  icon.setAttribute('src',theme);
  lightModeTag.setAttribute('href',styleSheet);
}
// application functionality [event listeners]
window.addEventListener("resize", initializeFilterDiv);
window.addEventListener("resize", removeFilterDiv);
form.addEventListener("submit", addTodo);
todoList.addEventListener("click", removeTodo);
todoList.addEventListener("dragstart", dragStart);
todoList.addEventListener("dragenter", dragEnter);
todoList.addEventListener("dragleave", dragLeave);
todoList.addEventListener("dragover", dragOver);
todoList.addEventListener("drop", drop);
todoList.addEventListener("change", updateTodoStatus);
clearCompleteBtn.addEventListener("click", clearCompleted);
filterBtns.forEach((element) => {
  element.addEventListener("click", filterTodo);
});

themeSwitcherBtn.addEventListener("click", changeTheme);

function init() {
  loadTheme(icon,styleSheet );
  todoInputEl.focus();
  displayTodo(todoArray);
}

init();
