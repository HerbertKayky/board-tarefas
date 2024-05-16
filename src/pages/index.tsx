import Image from "next/image";
import heroImg from "../../public/assets/hero.png";
import Head from "next/head";
import { GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <>
      <Head>
        <title>Tarefas+</title>
      </Head>
      <div className="flex flex-col justify-center bg-slate-950 w-full h-[calc(100vh-64px)] items-center">
        <main>
          <div className="flex flex-col items-center justify-center">
            <Image
              className="max-w-sm sm:max-w-lg"
              alt="Logo imagem"
              src={heroImg}
              priority
            ></Image>
          </div>
          <h1 className="text-white text-center m-7 text-xl font-bold leading-10 sm:text-3xl">
            Sistema feito para você organizar <br /> seus estudos e tarefas
          </h1>

          <div className="flex flex-col gap-2 sm:flex-row justify-around ">
            <section className="flex justify-center items-center bg-white py-3 px-10 rounded-lg font-bold hover:scale-105 transition-all cursor-pointer">
              <span>+{posts} Posts</span>
            </section>
            <section className="flex justify-center items-center bg-white py-3 px-10 rounded-lg font-bold hover:scale-105 transition-all cursor-pointer">
              <span>+{comments} Comentários</span>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tarefas");

  const postSnapshot = await getDocs(postRef);

  const commentSnapshot = await getDocs(commentRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 120,
  };
};
