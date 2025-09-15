"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  MoreHorizontal,
  Calendar,
  ChevronDown,
  Filter,
  PlusIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from 'uuid';
import { createOrUpdateTodo, deleteTodo, getTodo, getUserTodos } from "@/lib/todoUtils";

import { SmartDatetimeInput } from "@/components/ui/extension/smart-datetime-input";
import useUserId from "@/hooks/useUserId";

// Utility function for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert 24-hour format to 12-hour format
  hours = hours % 12 || 12;

  // Format the output string with padded minutes
  return `${day}/${month}/${year} ${hours}:${minutes < 10 ? "0" + minutes : minutes
    } ${ampm}`;
};

// Filter Dropdown Component
const FilterDropdown = ({
  filterOpen,
  setFilterOpen,
  activeFilter,
  setActiveFilter,
  filterOptions,
}) => {
  return (
    <div className="relative w-full h-10 mb-10">
      <motion.button
        className="flex w-full h-full items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-[#444444] rounded-lg"
        onClick={() => setFilterOpen(!filterOpen)}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-600 dark:text-white" />
          <span className="text-gray-600 text-md dark:text-white">Filter</span>
        </div>
        <motion.div
          animate={{ rotate: filterOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-600 dark:text-white" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 left-0 bg-white dark:bg-[#444444] rounded-xl shadow-lg p-2 z-10 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {filterOptions.map((option) => (
              <motion.button
                key={option}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeFilter === option
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 dark:text-white"
                  }`}
                onClick={() => {
                  setActiveFilter(option);
                  setFilterOpen(false);
                }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Todo Item Component
const TodoItem = ({ todo, index, deleteTodo, editTodo }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Create a ref for the menu
  const menuRef = React.useRef(null);

  // Close the menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-[#262626] rounded-2xl p-4 pl-5 mb-3 shadow-sm w-full min-h-fit relative"
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-2 py-1 rounded-full text-xs ${todo.priority === "High"
            ? "bg-[#FFE2E5] text-[#D8727D]"
            : "bg-[#FFF5E9] text-[#D58D49]"
            }`}
        >
          {todo.priority}
        </span>
        <div className="relative">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={handleMenuClick}
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute top-6 right-0 bg-white dark:bg-[#333333] shadow-lg rounded-xl p-2 z-10"
            >
              <button
                className="block w-full text-left px-4 py-2 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444] rounded-lg"
                onClick={() => {
                  setMenuOpen(false);
                  editTodo(index);
                }}
              >
                Edit
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444] rounded-lg"
                onClick={() => {
                  setMenuOpen(false);
                  deleteTodo(index);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 text-md mb-1 dark:text-white">
        {todo.title}
      </h3>
      <p className="text-gray-500 text-xs mb-4">
        {todo.description}
      </p>

      <div className="flex items-center gap-2 justify-between mt-auto">
        <div className="flex items-center gap-3 text-gray-500 text-[10px]">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span className="">Due: {formatDate(todo.dueDate)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Create Todo Form Component
const CreateTodoForm = ({ newTodo, todos, setNewTodo, addTodo, setIsCreating, isEditing }) => {
  // Create a local state to manage the form independently from parent state
  const [localTodo, setLocalTodo] = useState({ ...newTodo });

  // Reset local state when parent props change
  useEffect(() => {
    setLocalTodo({ ...newTodo });
  }, [newTodo]);

  // Only update parent state and immediately call addTodo when form is submitted
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!localTodo.title.trim()) return;

    // Directly call addTodo with the localTodo
    addTodo(localTodo);
  };

  // Handle date changes safely
  const handleDateChange = (value) => {
    // Preserve existing date if new value is empty or undefined
    const dateValue = value ? value.toString() : localTodo.dueDate || "";
    setLocalTodo(prev => ({ ...prev, dueDate: dateValue }));
  };

  // Handle close form - only close if we have existing todos
  const handleClose = () => {
    // Only allow closing if there are existing todos
    if (todos.length > 0) {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-[#262626] rounded-2xl p-4 shadow-sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${localTodo.priority === "High"
                ? "bg-[#fff1f1] text-[#d8727d]"
                : "bg-[#fff7e8] text-[#d58d49]"
                }`}
              onClick={() =>
                setLocalTodo(prev => ({
                  ...prev,
                  priority: prev.priority === "Low" ? "High" : "Low",
                }))
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {localTodo.priority}
              <ChevronDown size={14} />
            </motion.button>
          </div>
          <motion.button
            type="button"
            onClick={handleClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} className="text-gray-400 hover:text-gray-600" />
          </motion.button>
        </div>

        <input
          type="text"
          placeholder="Enter heading"
          value={localTodo.title}
          onChange={(e) => setLocalTodo(prev => ({ ...prev, title: e.target.value }))}
          className="w-full mb-2 p-2 border-b border-gray-100 dark:bg-[#262626] dark:text-white focus:outline-none focus:border-gray-300"
          id="create-todo"
        />
        <textarea
          type="text"
          placeholder="Enter sub heading"
          value={localTodo.description}
          onChange={(e) =>
            setLocalTodo(prev => ({ ...prev, description: e.target.value }))
          }
          className="w-full mb-4 p-2 border-b border-gray-100 dark:bg-[#262626] dark:text-white focus:outline-none focus:border-gray-300 max-h-32"
          id="todo-describe"
        />

        <div className="mb-4" id="todo-data-time">
          <SmartDatetimeInput
            value={localTodo.dueDate}
            onValueChange={handleDateChange}
            placeholder="e.g. Tomorrow morning 9am"
          />
        </div>
        <div className="flex justify-between w-full md:w-[205px]">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              setLocalTodo({
                title: "",
                description: "",
                dueDate: "",
                priority: "Low",
                userId: localTodo.userId, // Preserve userId
                todoId: localTodo.todoId // Preserve todoId
              })
            }
          >
            <div className="w-[92px] h-7 relative">
              <div className="w-full h-full left-0 top-0 absolute bg-gradient-to-b from-[#c7c7c7] to-[#c7c7c7] rounded-md" />
              <div className="left-5 top-[6px] absolute text-center text-black text-xs font-semibold">
                Clear List
              </div>
            </div>
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-[92px] h-7 relative" id="todo-confirm">
              <div className="w-full h-full left-0 top-0 absolute bg-gradient-to-b from-emerald-700 to-[#38a169] rounded-md" />
              <div className="left-5 top-[6px] absolute text-center text-white text-xs font-semibold">
                {isEditing ? "Update" : "Add to-do"}
              </div>
            </div>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

const TodoList = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [todos, setTodos] = useState([]);
  const userId = useUserId();

  const [newTodo, setNewTodo] = useState(() => ({
    title: "",
    description: "",
    dueDate: "",
    priority: "Low",
    userId: userId || "",
    todoId: uuidv4()
  }));

  // Update newTodo when userId changes
  useEffect(() => {
    if (userId) {
      setNewTodo(prev => ({
        ...prev,
        userId: userId
      }));
    }
  }, [userId]);

  // Fetch todos on component mount AND when userId changes
  useEffect(() => {
    if (userId) {
      fetchTodos();
    } else {
      // Handle case when userId is not available
      console.warn("User ID not available yet. Waiting for authentication.");
      setTodos([]);
      setIsCreating(true);
    }
  }, [userId]); // userId as dependency

  // Function to determine whether to show the creation form or todo list
  const shouldShowCreateForm = () => {
    // Show create form if explicitly creating/editing OR if there are no todos
    return isCreating || (todos.length === 0);
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside and the filter is open
      if (filterOpen) setFilterOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterOpen]);

  const fetchTodos = async () => {
    if (!userId) {
      console.warn("Cannot fetch todos: User ID is missing");
      setTodos([]);
      setIsCreating(true);
      return;
    }

    try {
      const data = await getUserTodos(userId);

      // Process the fetched data to ensure consistent ID handling
      const processedData = (data || []).map(todo => ({
        ...todo,
        id: todo.id || todo.todoId,
        todoId: todo.id || todo.todoId
      }));

      setTodos(processedData);

      // If no todos exist, automatically show the create form
      // Otherwise, hide the creation form if it's currently showing
      if (!processedData || processedData.length === 0) {
        setIsCreating(true);
      } else if (!isEditing) {
        // Only hide the form if not currently editing
        setIsCreating(false);
      }

      console.log("Fetched todos:", processedData);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setTodos([]);
      setIsCreating(true);
    }
  };

  const resetForm = useCallback(() => {
    setNewTodo({
      title: "",
      description: "",
      dueDate: "",
      priority: "Low",
      userId: userId || "",
      todoId: uuidv4()
    });
    setIsCreating(false);
    setIsEditing(false);
    setEditingIndex(null);
  }, [userId]);

  const addTodo = useCallback(async (todoToAdd) => {
    if (!userId) {
      console.warn("Cannot add todo: User ID is missing");
      return;
    }

    const todoData = todoToAdd || newTodo;
    if (!todoData.title.trim()) return;

    // Ensure the todo has the required properties
    const todoWithId = {
      ...todoData,
      userId: userId,
      id: todoData.id || todoData.todoId || uuidv4(), // Use existing id, todoId, or generate a new one
    };

    try {
      await createOrUpdateTodo(userId, todoWithId);
      await fetchTodos(); // Refresh the list after adding
      resetForm();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  }, [newTodo, userId, resetForm]);

  const updateTodo = useCallback(async (todoToUpdate) => {
    if (!userId) {
      console.warn("Cannot update todo: User ID is missing");
      return;
    }

    const todoData = todoToUpdate || newTodo;
    if (!todoData.title.trim()) return;

    // Find the correct ID to use (todoId or id)
    const todoId = todoData.id || todoData.todoId;

    if (!todoId) {
      console.error("Cannot update todo: No valid ID found");
      return;
    }

    // Ensure we use the id property that the backend expects
    const todoWithCorrectId = {
      ...todoData,
      id: todoId,
      todoId: todoId,
      userId: userId
    };

    console.log("Updating todo:", todoWithCorrectId);

    try {
      await createOrUpdateTodo(userId, todoWithCorrectId);
      await fetchTodos(); // Refresh the list after updating
      resetForm();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }, [newTodo, userId, resetForm]);

  const editTodo = useCallback(async (index) => {
    if (!userId) {
      console.warn("Cannot edit todo: User ID is missing");
      return;
    }

    const todoToEdit = todos[index];
    if (!todoToEdit) {
      console.error("No todo found at index:", index);
      return;
    }

    // Check which ID is available and use it
    const todoId = todoToEdit.id || todoToEdit.todoId;

    if (!todoId) {
      console.error("Todo has no valid ID for editing");
      return;
    }

    try {
      // Create a copy of the todo for editing
      const enhancedTodo = {
        ...todoToEdit,
        // Explicitly set both ID properties to ensure they're defined
        todoId: todoId,
        id: todoId
      };

      console.log("Editing todo with ID:", todoId, enhancedTodo);

      setNewTodo(enhancedTodo);
      setEditingIndex(index);
      setIsEditing(true);
      setIsCreating(true);
    } catch (error) {
      console.error("Error preparing todo for edit:", error);
    }
  }, [todos, userId]);

  const removeTodo = useCallback(async (index) => {
    if (!userId) {
      console.warn("Cannot delete todo: User ID is missing");
      return;
    }

    const todoToDelete = todos[index];
    if (!todoToDelete) {
      console.error("No todo found at index:", index);
      return;
    }

    // Get the id to use for deletion (can be either id or todoId property)
    const idToDelete = todoToDelete.id || todoToDelete.todoId;

    if (!idToDelete) {
      console.error("Todo has no valid ID for deletion");
      return;
    }

    try {
      await deleteTodo(userId, idToDelete);
      await fetchTodos(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }, [todos, userId]);

  // Memoize filtered todos to avoid unnecessary recalculations
  const filteredTodos = React.useMemo(() => {
    return activeFilter === "All"
      ? todos
      : todos.filter((todo) => todo.priority === activeFilter);
  }, [todos, activeFilter]);

  // Create a mapping of original indices to maintain proper references for edit/delete
  const todoIndices = React.useMemo(() => {
    return filteredTodos.map(item => todos.indexOf(item));
  }, [todos, filteredTodos]);

  const filterOptions = ["All", "High", "Low"];

  return (
    <div className=" w-full h-[90%] flex-col relative space-y-10">
      {/* Filter Button - Fixed at the top */}
      <div className="relative z-10 w-full h-6">
        <FilterDropdown
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          filterOptions={filterOptions}
        />
      </div>

      {/* To-Do Container - Takes full available space */}
      <div className="flex-1 bg-[#f6f7f9] dark:bg-[#444444] rounded-xl p-4 w-full h-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            <span className="font-semibold text-gray-800 dark:text-[#ECECEC]">
              To Do
            </span>
            <span className="bg-[#D8C7E7] text-[#553C9A] px-1.5 py-0.5 rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {filteredTodos.length}
            </span>
          </div>
          {!(todos.length === 0 && !isCreating) && (
            <motion.button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="w-6 h-6 flex items-center justify-center text-[#5030E5]"
              whileTap={{ scale: 0.9 }}
            >
              <PlusIcon className="w-[18px] h-[18px] hover:w-5 hover:h-5 bg-[#b0a8c5] p-0.5 rounded-md" />
            </motion.button>
          )}
        </div>

        <span className="mb-2 flex p-[0.5px] w-full bg-[#553C9A]"></span>

        {/* To-Do List with Scrollable Container */}
        <div className="flex-1 overflow-auto remove-scrollbar pt-4">
          <AnimatePresence mode="popLayout">
            {shouldShowCreateForm() ? (
              <CreateTodoForm
                newTodo={newTodo}
                setNewTodo={setNewTodo}
                addTodo={isEditing ? updateTodo : addTodo}
                setIsCreating={setIsCreating}
                isEditing={isEditing}
                todos={todos}
              />
            ) : (
              filteredTodos.length > 0 ? (
                filteredTodos.map((todo, index) => (
                  <TodoItem
                    key={`todo-${todo.id || todo.todoId || index}`}
                    todo={todo}
                    index={todoIndices[index]} // Use the pre-calculated index
                    deleteTodo={removeTodo}
                    editTodo={editTodo}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  No todos found matching your filter. Change the filter or add a new todo!
                </div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TodoList;