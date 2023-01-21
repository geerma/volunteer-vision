import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getSupabase } from "../utils/supabase";

export default function Home({ user }) {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>Volunteer Vision</h1>
        <h2>{user.name}</h2>
      </main>
    </>
  );
}

export const getServerSideProps = withPageAuthRequired();