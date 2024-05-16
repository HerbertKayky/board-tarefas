import Textarea from "@/components/textarea";
import { db } from "@/services/firebaseConnection";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, FormEvent, useState } from "react";

interface TaskProps {
  item: {
    tarefa: string;
    public: boolean;
    created: string;
    user: string;
    taskId: string;
  };
}

export default function Task({ item }: TaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRef = await addDoc(collection(db, "coments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user.name,
        taskId: item?.taskId,
      });
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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tarefas", id);

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
  console.log(task);

  return {
    props: {
      item: task,
    },
  };
};
