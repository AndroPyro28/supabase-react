import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../utils/supabase";
import TaskItem from "./task-item";
import type { Session } from "@supabase/supabase-js";

interface IProps {
  session: Session
}

interface ITask {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

const TaskManager:React.FC<IProps> = ({session}) => {
  const initialValue = {
    title: "",
    description: "",
  };
  const [task, setTask] = useState(initialValue);
  const [tasks, setTasks] = useState<ITask[]>();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      return;
    }
    setTasks(data as ITask[]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => setTask(initialValue);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!task.title || !task.description) {
      alert("Fill up the title and description to create task");
      return;
    }
    try {
      const data = {
        ...task,
      };
      handleReset();
      const { error } = await supabase.from("tasks").insert({...data, email: session.user.email}).single();
      if (error) {
        console.log("TASK ADD ERROR RESPONSE", error.message);
        return;
      }
      fetchTasks()
      alert("Task Added✅");
      
    } catch (error) {
      console.log("TASK ADD ERROR", error);
    }
  };
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h2>Task Manager CRUD</h2>

      {/* Form to add a new task */}
      <form onSubmit={addTask} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          name="title"
          onChange={handleChange}
          value={task.title}
          placeholder="Task Title"
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <textarea
          name="description"
          onChange={handleChange}
          value={task.description}
          placeholder="Task Description"
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        {/* <input type="file" accept="image/*" /> */}

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Task
        </button>
      </form>

      {/* List of Tasks */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks && tasks?.length > 0 ? (
          tasks.map((task) => (
            <TaskItem
              id={task.id}
              key={task.id}
              created_at={task.created_at}
              title={task.title}
              description={task.description}
              refetchTask={fetchTasks}
            />
          ))
        ) : (
          <div
            className=""
            style={{
              fontWeight: "bold",
              color: "gray",
              fontSize: "1.3rem",
            }}
          >
            No Tasks Yet
          </div>
        )}
      </ul>
    </div>
  )
}

export default TaskManager;
