import Textarea from "@/components/textarea";
import { db } from "@/services/firebaseConnection";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, FormEvent, useState } from "react";
import { FaTrash } from "react-icons/fa";

interface TaskProps {
  item: {
    tarefa: string;
    public: boolean;
    created: string;
    user: string;
    taskId: string;
  };
  allComments: CommentProps[];
}

interface CommentProps {
  id: string;
  comment: string;
  name: string;
  user: string;
  taskId: string;
}

export default function Task({ item, allComments }: TaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<CommentProps[]>(allComments || []);

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user.name,
        taskId: item?.taskId,
      });
      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      };
      setComments((oldItems) => [...oldItems, data ]);

      setInput("");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="w-full max-w-5xl flex flex-col justify-center items-center mt-10 mr-auto ml-auto px-5">
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className="w-full">
        <h1 className="text-2xl font-bold mb-4">Tarefa</h1>
        <article className="flex items-center justify-center border border-slate-300 leading-8 p-3 rounded">
          <p className="whitespace-pre-wrap w-full">{item.tarefa}</p>
        </article>
      </main>

      <section className="my-4 w-full max-w-5xl">
        <h2 className="font-bold my-4 text-2xl">Deixar comentário</h2>

        <form onSubmit={handleComment}>
          <Textarea
            required
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            placeholder="Digite seu comentário..."
          />
          <button
            disabled={!session?.user}
            className="disabled:bg-blue-300 w-full bg-blue-600 p-2 rounded text-white text-xl mt-3"
          >
            Enviar Comentário
          </button>
        </form>
      </section>

      <section className="w-full flex flex-col">
        <h2 className="text-2xl font-bold pt-5 pb-4">Todos os comentários</h2>
        {comments.length === 0 && (
          <span>Nenhum comentário foi encontrado...</span>
        )}

        {comments.map((item) => (
          <article
            key={item.id}
            className="mb-5 flex flex-col text-start border rounded border-slate-300 p-3"
          >
            <div className="flex items-center">
              <label className="bg-gray-300 rounded ml-1 px-1 text-sm">
                {item.name}
              </label>
              {item.user === session?.user?.email && (
                <button className="pr-5 mx-2">
                  <FaTrash size={18} color="#ea3140" />
                </button>
              )}
            </div>
            <p className="ml-1">{item.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tarefas", id);

  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapshotComments = await getDocs(q);

  let allComments: CommentProps[] = [];
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
  });

  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    created: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,
  };

  return {
    props: {
      item: task,
      allComments: allComments,
    },
  };
};
