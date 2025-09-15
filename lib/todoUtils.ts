const API_BASE_URL = `${ process.env.NEXT_PUBLIC_API_URL}/dev/todos`; 

// ✅ Create or Update a To-Do
export async function createOrUpdateTodo(userId, todo) {
    const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...todo }),
    });
    return response.json();
}

// ✅ Get a Single To-Do
export async function getTodo(userId, todoId) {
    const response = await fetch(`${API_BASE_URL}/${userId}/${todoId}`);
    return response.json();
}

// ✅ Get All To-Dos for a User
export async function getUserTodos(userId) {
    const response = await fetch(`${API_BASE_URL}/${userId}`);
    return response.json();
}

// ✅ Delete a To-Do
export async function deleteTodo(userId, todoId) {
    const response = await fetch(`${API_BASE_URL}/${userId}/${todoId}`, {
        method: "DELETE",
    });
    return response.json();
}
