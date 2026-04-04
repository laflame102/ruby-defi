import { useState } from "react";
import { Todo } from "./types";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Стейт для додавання нового
  const [inputValue, setInputValue] = useState("");

  // --- Стейт для редагування ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Create
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: inputValue, completed: false },
    ]);
    setInputValue("");
  };

  // --- Update (Логіка) ---

  // 1. Почати редагування: запам'ятовуємо ID і копіюємо поточний текст в інпут
  const startEditing = (id: string, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  // 2. Зберегти зміни
  const saveEdit = (id: string) => {
    if (!editText.trim()) return; // Валідація на порожній текст

    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: editText } : todo)),
    );
    setEditingId(null); // Виходимо з режиму редагування
    setEditText("");
  };

  // 3. Скасувати редагування
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // Delete & Toggle
  const deleteTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "2rem auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>React CRUD Todo 📝</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Нове завдання..."
          style={{ flexGrow: 1, padding: "8px" }}
        />
        <button
          type="submit"
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Додати
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => {
          // Перевіряємо, чи цей елемент зараз редагується
          const isEditing = editingId === todo.id;

          return (
            <li
              key={todo.id}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "8px",
                padding: "8px",
                border: "1px solid #eee",
                borderRadius: "4px",
                background: isEditing ? "#f9f9f9" : "white",
              }}
            >
              {isEditing ? (
                // --- РЕЖИМ РЕДАГУВАННЯ ---
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ flexGrow: 1, padding: "4px" }}
                    autoFocus // Фокус відразу на інпут
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(todo.id)}
                    style={{ cursor: "pointer", color: "green" }}
                  >
                    💾
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{ cursor: "pointer", color: "gray" }}
                  >
                    ❌
                  </button>
                </>
              ) : (
                // --- РЕЖИМ ПЕРЕГЛЯДУ ---
                <>
                  <span
                    onClick={() => toggleTodo(todo.id)}
                    style={{
                      flexGrow: 1,
                      cursor: "pointer",
                      textDecoration: todo.completed ? "line-through" : "none",
                      color: todo.completed ? "#aaa" : "inherit",
                    }}
                  >
                    {todo.completed ? "✅" : "⬜️"} {todo.text}
                  </span>

                  {/* Кнопка Редагувати */}
                  <button
                    type="button"
                    onClick={() => startEditing(todo.id, todo.text)}
                    disabled={todo.completed} // Блокуємо редагування виконаних (опціонально)
                    style={{
                      cursor: "pointer",
                      border: "1px solid #ccc",
                      background: "none",
                      borderRadius: "4px",
                    }}
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteTodo(todo.id)}
                    style={{
                      background: "#ff4d4f",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
