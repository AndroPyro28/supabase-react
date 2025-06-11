import React, { useState } from "react";
import { supabase } from "../utils/supabase";

interface IProps {
  id: number;
  title: string;
  description: string;
  created_at: string;
  image_url: string;
  refetchTask: () => Promise<void>;
}

const TaskItem: React.FC<IProps> = ({
  id,
  title,
  description,
  image_url,
  created_at,
  refetchTask,
}) => {
  const initialValue = { title: "", description: "" };

  const [toggleUpdate, setToggleUpdate] = useState(false);

  const [task, setTask] = useState(initialValue);

  const updateTask = async (id: number) => {
    try {
      setToggleUpdate(false);
      if (title === task.title && description === task.description) {
        return;
      }
      const { error } = await supabase.from("tasks").update(task).eq("id", id);
      if (error) {
        console.log("TASK ADD ERROR RESPONSE", error.message);
        return;
      }
      refetchTask();
      alert("Task Updated✅");
    } catch (error) {
      console.log("TASK UPDATE ERROR", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const deleteTask = async (id: number) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) {
        console.log("TASK ADD ERROR RESPONSE", error.message);
        return;
      }
      refetchTask();
      alert("Task Deleted✅");
    } catch (error) {
      console.log("TASK DELETE ERROR", error);
    }
  };

  return (
    <li
      style={{
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "1rem",
        marginBottom: "0.5rem",
      }}
      key={id}
    >
      <div>
        {!toggleUpdate && (
          <>
            <img
              src={image_url}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "contain",
              }}
              alt="task image url"
            />
            <h3>{title}</h3>
            <p>{description} </p>
          </>
        )}

        {/* <img src={"#"} style={{ height: 70 }} /> */}
        <div>
          {toggleUpdate && (
            <div>
              <h3
                style={{
                  marginBottom: "20px",
                }}
              >
                Update Task
              </h3>
              <input
                type="text"
                name="title"
                onChange={handleChange}
                value={task.title}
                placeholder="Task Title"
                style={{
                  width: "100%",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                }}
              />
              <textarea
                name="description"
                onChange={handleChange}
                value={task.description}
                placeholder="Task Description"
                style={{
                  width: "100%",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                }}
              />

              <button
                type="button"
                onClick={() => updateTask(id)}
                style={{ padding: "0.5rem 1rem", margin: "2px" }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => setToggleUpdate(false)}
                style={{ padding: "0.5rem 1rem", margin: "2px" }}
              >
                Cancel
              </button>
            </div>
          )}

          {!toggleUpdate && (
            <>
              <button
                style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
                onClick={() => {
                  setToggleUpdate(true);
                  setTask({ title, description });
                }}
              >
                Edit
              </button>
              <button
                style={{ padding: "0.5rem 1rem" }}
                onClick={() => deleteTask(id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

export default TaskItem;
