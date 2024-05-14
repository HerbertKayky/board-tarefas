import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="w-full h-16 bg-slate-950 flex items-center justify-center">
      <section className="w-full max-w-5xl flex p-5 justify-between items-center">
        <nav className="flex items-center">
          <Link className="text-white" href="/">
            <h1 className="text-3xl font-bold">
              Tarefas <span className="text-orange-600">+</span>
            </h1>
          </Link>
          <Link
            className="py-1 px-2 ml-3 rounded bg-slate-100"
            href="/dashboard"
          >
            Meu painel
          </Link>
        </nav>
        {status === "loading" ? (
          <></>
        ) : session ? (
          <button
            onClick={() => signOut()}
            className="bg-transparent border px-8 py-1 font-bold rounded-lg text-white hover:scale-105 hover:text-black hover:bg-white  transition-all"
          >
            Olá {session?.user?.name}
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="bg-transparent border px-8 py-1 font-bold rounded-lg text-white hover:scale-105 hover:text-black hover:bg-white  transition-all"
          >
            Acessar
          </button>
        )}
      </section>
    </header>
  );
}
