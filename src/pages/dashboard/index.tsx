import Textarea from "@/components/textarea";
import { db } from "@/services/firebaseConnection";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";

interface DashboardProps {
  user: {
    email: string;
  };
}

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: DashboardProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  useEffect(() => {
    async function loadTasks() {
      const tasksRef = collection(db, "tarefas");
      const q = query(
        tasksRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      );
      onSnapshot(q, (snapshot) => {
        let lista = [] as TaskProps[];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            tarefa: doc.data().tarefa,
            created: doc.data().created,
            user: doc.data().user,
            public: doc.data().public,
          });
        });
        setTasks(lista);
      });
    }
    loadTasks();
  }, [user?.email]);

  function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
    setPublicTask(e.target.checked);
  }

  async function handleRegisterTask(e: FormEvent) {
    toast.success("Tarefa registrada", {
      style: {
        background: "#333",
        color: "#fff",
      },
    });
    e.preventDefault();
    if (input === "") return;

    try {
      await addDoc(collection(db, "tarefas"), {
        tarefa: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });
      setInput("");
      setPublicTask(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleShare(id: string) {
    toast.success("Link copiado", {
      style: {
        background: "#333",
        color: "#fff",
      },
    });
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    );
  }

  async function handleDeleteTask(id: string) {
    toast.success("Tarefa deletada", {
      style: {
        background: "#333",
        color: "#fff",
      },
    });
    const docRef = doc(db, "tarefas", id);
    await deleteDoc(docRef);
  }

  return (
    <div>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>
      <main className="w-full">
        <section className="flex w-full bg-slate-950 items-center justify-center">
          <div className="max-w-5xl w-full px-4 pb-7 mt-14">
            <h1 className="text-3xl text-white font-bold mb-4">
              Qual sua tarefa?
            </h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                required
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
                placeholder="Digite sua tarefa..."
              />
              <div className="my-3 items-center flex">
                <input
                  checked={publicTask}
                  onChange={handleChangePublic}
                  type="checkbox"
                  className="w-5 h-5"
                />
                <label className="text-white ml-2">Deixar tarefa pública</label>
              </div>
              <button
                className="bg-blue-600 w-full py-2 rounded mt-3 text-white text-xl"
                type="submit"
              >
                Registrar
              </button>
            </form>
          </div>
        </section>

        <section className="w-full max-w-5xl m-auto flex flex-col px-4 mt-10">
          <h1 className="flex justify-center font-bold text-3xl mb-5">
            Minhas tarefas
          </h1>

          {tasks.map((item) => (
            <article
              key={item.id}
              className="mb-5 flex flex-col text-start border rounded border-slate-300 p-3"
            >
              {item.public && (
                <div className="flex items-center mb-2">
                  <label className="bg-blue-600 px-1 mr-1 rounded text-white">
                    Público
                  </label>
                  <button onClick={() => handleShare(item.id)}>
                    <FiShare2 size={22} color="#3183ff" />
                  </button>
                </div>
              )}

              <div className="flex justify-between text-center w-full">
                {item.public ? (
                  <Link href={`/task/${item.id}`}>
                    <p className="whitespace-pre-wrap">{item.tarefa}</p>
                  </Link>
                ) : (
                  <p className="whitespace-pre-wrap">{item.tarefa}</p>
                )}
                <button
                  onClick={() => handleDeleteTask(item.id)}
                  className="mr-3"
                >
                  <FaTrash size={24} color="#ea3140" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    // Se não tem usuários vamos redirecionar para a "/"
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
