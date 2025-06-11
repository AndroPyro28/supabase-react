import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../utils/supabase";
import TaskItem from "./task-item";
import type { Session } from "@supabase/supabase-js";

interface IProps {
  session: Session;
}

interface ITask {
  id: number;
  title: string;
  image_url: string;
  description: string;
  created_at: string;
}

const TaskManager: React.FC<IProps> = ({ session }) => {
  const initialValue = {
    title: "",
    description: "",
  };
  const [task, setTask] = useState(initialValue);
  const [taskImage, setTaskImage] = useState<File | null>()
  const [tasks, setTasks] = useState<ITask[]>();

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

  useEffect(() => {
    fetchTasks();
  }, []);

  const events = {
    'INSERT': (newTask: ITask) => {
      setTasks((prev) => [...prev as ITask[], newTask])
    },
    'UPDATE': (id: number, updatedTask: ITask) => {
      const updatedTasks = tasks?.map(task => {
        if(task.id === id) return updatedTask;
        
        return task
      }) 
      setTasks(updatedTasks)
    },
    'DELETE': (id: number) => {
      const filteredTasks = tasks?.filter((task) => task.id != id)
      setTasks(filteredTasks)
    }
  }

  useEffect(() => {
    // subscribe in supabase tasks table

    const channel = supabase.channel("tasks-channel");
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks"},
      (payload) => {
        const {eventType} = payload
        if(eventType === 'INSERT') {
          const newTask = payload.new as ITask;
          // events['INSERT'](newTask)

          setTasks((prev) => [...prev as ITask[], newTask])
          
        }
        // else if( eventType === 'UPDATE') {
        //   const id = payload.old?.id 
        //   const updatedTask = payload.new as ITask;
        //   const updatedTasks = tasks?.map(task => {
        //     if(task.id === id) return updatedTask;
            
        //     return task
        //   }) 
        //   setTasks(prev => updatedTasks)
        // }
        // else if (eventType === 'DELETE') {
        //   const id = payload.old?.id 
        //   console.log(tasks)
        //   const filteredTasks = tasks?.filter((task) => task.id != id)
        //   console.log(filteredTasks)
        //     setTasks(prev => filteredTasks)
        // }
        // else {
        //   throw new Error("Something went wrong")
        // }
      }
    ).subscribe((status) => {
      console.log('channel status', status)
    })
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTask((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    if( e.target?.files && e.target?.files?.length > 0) {
        const fileImage = e.target.files[0];
        setTaskImage(fileImage)
    }
  }

  const handleReset = () => setTask(initialValue);

  const uploadImage = async (fileImage: File): Promise<string | null> => {

    const filePath = `${fileImage?.name}-${Date.now()}`

    const { error } = await supabase.storage.from('tasks-images').upload(filePath, fileImage)
    if(error) {
      console.error('Error uploading image: ', error)
      return null
    }

    const { data } = await supabase.storage.from('tasks-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!task.title || !task.description || !taskImage) {
      alert("Fill up the title and description to create task");
      return;
    }

    let imageUrl = await uploadImage(taskImage)

    try {
      const data = {
        ...task,
      };
      handleReset();
      const { error } = await supabase
        .from("tasks")
        .insert({ ...data, email: session.user.email, image_url: imageUrl })
        .single();
      if (error) {
        console.log("TASK ADD ERROR RESPONSE", error.message);
        return;
      }
      fetchTasks();
      alert("Task Added✅");
    } catch (error) {
      console.log("TASK ADD ERROR", error);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h2>Task Manager CRUD</h2>

      {/* Form to add a new task */}
      <form onSubmit={addTask} style={{ marginBottom: "1rem", display:"flex", flexDirection: 'column', gap: '20px' }}>
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

        <input type="file" accept="image/*" onChange={handleFileChange}/>

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
              image_url={task.image_url}
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
  );
};

export default TaskManager;
