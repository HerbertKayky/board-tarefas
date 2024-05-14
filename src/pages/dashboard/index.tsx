import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";

export default function Dashboard() {
  return (
    <div>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>
      <h1 className="text-5xl">Dashboard</h1>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  //console.log(session)

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
    props: {},
  };
};
