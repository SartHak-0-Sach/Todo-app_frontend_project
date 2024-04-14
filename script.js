/* eslint-disable */
import {
    appThemetoggleElement,
    bodyElement,
    addTaskButton,
    inputElement,
    taskListElement,
    getDeleteElements,
    getListItemElements,
    allButtonElement,
    activeButtonElement,
    completedButtonElement,
    clearButtonElement,
    getCurrentListElements,
} from './scripts/elements';

import {
    fetchData,
    saveListElementsToLocalStorge,
    renderTaskList,
    removeClassFromAllButtons,
    convertNodeListToArrayOfObjects,
    isTaskValueValid,
    toggleCompletedTask,
    renderEmptyState,
    countItemLeft,
    initializeApp,
} from './scripts/utils';

// DeleteTask
const deleteTask = (event) => {
    const tasks = fetchData('tasks');
    const taskValue = event.target.closest('li').querySelector('.todo-text').textContent;

    tasks.splice(tasks.findIndex((task) => task.value === taskValue), 1);
    saveListElementsToLocalStorge('tasks', tasks);

    event.target.closest('li').classList.add('deleted');
    setTimeout(() => {
        initTaskList(tasks);
    }, 400);
    removeClassFromAllButtons();
    allButtonElement.classList.add('blue--button');
};

// DeleteCompletedTask
const deleteCompletedTasks = () => {
    removeClassFromAllButtons();
    allButtonElement.classList.add('blue--button');

    const tasks = fetchData('tasks') || [];
    const newTasks = tasks.filter((task) => !task.isCompleted);
    saveListElementsToLocalStorge('tasks', newTasks);
    initTaskList(fetchData('tasks'));
};

// All list Element Filter function
const filterAllElements = () => {
    removeClassFromAllButtons();
    allButtonElement.classList.add('blue--button');
    const tasks = fetchData('tasks') || [];
    initTaskList(tasks);
};

// Active button Filter function
const filterActiveElements = () => {
    removeClassFromAllButtons();
    activeButtonElement.classList.add('blue--button');

    const tasks = fetchData('tasks') || [];
    const newTasks = tasks.filter((task) => !task.isCompleted);
    initTaskList(newTasks);
    countItemLeft();
};

// Completed button Filter function
const filterCompletedElements = () => {
    removeClassFromAllButtons();
    completedButtonElement.classList.add('blue--button');

    const tasks = fetchData('tasks') || [];
    const newTasks = tasks.filter((task) => task.isCompleted);
    initTaskList(newTasks);
    countItemLeft();
};

// Button Listener
const initButtonsListeners = () => {
    clearButtonElement.addEventListener('click', deleteCompletedTasks);
    allButtonElement.addEventListener('click', filterAllElements);
    activeButtonElement.addEventListener('click', filterActiveElements);
    completedButtonElement.addEventListener('click', filterCompletedElements);
};

// InitTaskListeners Function
const initTaskListeners = () => {
    const deleteElements = getDeleteElements();
    const listElements = getListItemElements();

    deleteElements.forEach((element) => {
        element.addEventListener('click', (event) => deleteTask(event));
    });

    listElements.forEach((element) => {
        element.addEventListener('click', (event) => toggleCompletedTask(event.currentTarget));
    });

    initButtonsListeners();
};

// Order Localstorge list based on index after the user darg and drop
const updateLocalStorageWithNewOrder = () => {
    const newOrderedList = convertNodeListToArrayOfObjects(getCurrentListElements());
    saveListElementsToLocalStorge('tasks', newOrderedList);
};

// AddTask Function
const addTask = (event) => {
    event.preventDefault();
    const taskValue = inputElement.value;

    try {
        if (!taskValue || !isTaskValueValid(taskValue)) {
            return;
        }
    } catch (error) {
        alert(error.message);
        inputElement.value = '';
        return;
    }

    const task = {
        value: taskValue,
        isCompleted: false,
    };

    const tasks = fetchData('tasks') || [];
    tasks.push(task);
    saveListElementsToLocalStorge('tasks', tasks);
    initTaskList(tasks);
};

// DarkTheme
const toggleDarkMode = () => {
    let isDarkMode = false;

    // Check if dark mode flag exists in local storage
    if (fetchData('darkModeFlag')) {
        isDarkMode = true;
        bodyElement.classList.add('App--isDark');
    }

    appThemetoggleElement.addEventListener('click', () => {
        isDarkMode = !isDarkMode;

        // Toggle the 'App--isDark' class
        bodyElement.classList.toggle('App--isDark');
        saveListElementsToLocalStorge('darkModeFlag', bodyElement?.classList.contains('App--isDark'));
    });
};

const initDataOnStartup = () => {
    addTaskButton.addEventListener('click', addTask);
    fetchData('darkModeFlag') ? toggleDarkMode() : toggleDarkMode();
    initTaskList(fetchData('tasks'));
};

// Function to initialize drag and drop functionality
const initDragAndDrop = () => {
    let draggingElement;

    taskListElement.addEventListener('dragstart', (event) => {
        draggingElement = event.target.closest('.draggable');
        if (draggingElement) {
            draggingElement.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', draggingElement.innerHTML);
        }
    });

    taskListElement.addEventListener('dragend', () => {
        if (draggingElement) {
            draggingElement.classList.remove('dragging');
            draggingElement = null;
        }
    });

    taskListElement.addEventListener('dragover', (event) => {
        event.preventDefault();
        const target = event.target.closest('.draggable');
        if (draggingElement && target && draggingElement !== target) {
            const bounding = target.getBoundingClientRect();
            const offset = bounding.y + bounding.height / 2;
            if (event.clientY < offset) {
                taskListElement.insertBefore(draggingElement, target);
            } else {
                taskListElement.insertBefore(draggingElement, target.nextSibling);
            }
        }
        // here shuld be if statment to handle if order form active or completed list
        if (!allButtonElement.classList.contains('blue--button')) return;
        updateLocalStorageWithNewOrder();
    });
};

// InitTaskList Function
const initTaskList = (tasks) => {
    const data = tasks || fetchData('tasks') || []; // Use provided tasks. Otherwise, try to fetch tasks from the database
    if (!data.length) {
        renderEmptyState();
        return;
    }
    renderTaskList(data);
    initTaskListeners();
    countItemLeft();
};

initializeApp();
initDataOnStartup();
initDragAndDrop();