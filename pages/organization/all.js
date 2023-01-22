import Head from "next/head";
import styles from "@/styles/Organization.module.css";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getSupabase } from "../../utils/supabase";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Stack } from "@mui/material";

// All organizations
export default function all({ orgs, userProfile }) {
  return (
    <>
      <Head>
        <title>Organizations</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar userProfile={userProfile} />
      <main className={styles.orgMain}>
        <h1>All Organizations</h1>
        <Stack spacing={2} my={2}>
        {orgs?.length > 0 ? (
          orgs.map((org) => (
            <Org key={org.id} name={org.name} about={org.about} id={org.id} />
          ))
        ) : (
          <p>No Organizations Available...</p>
        )}
        </Stack>
      </main>
    </>
  );
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps({ req, res }) {
    const {
      user: { accessToken, sub },
    } = await getSession(req, res)

    const supabase = getSupabase(accessToken)
    let userProfile = null;

    const { data: orgs } = await supabase.from('user').select('*').eq('role', 'org');

    try {
      // if no user has user_id of sub, create new user
      const { data } = await supabase.from('user').upsert({ user_id: sub }, { onConflict: 'user_id' }).select()

      userProfile = data[0];
    }
    catch (e) {
      console.error(e.message)
    }

    return {
      props: { orgs, userProfile },
    }
  },
});

function Org({ key, name, about, id }) {
  return (
    <Link className={styles.orgCard} key={key} href={`/organization/${id}`}>
      <h2>{name}</h2>
      <p>{about}</p>
    </Link>
  )
}