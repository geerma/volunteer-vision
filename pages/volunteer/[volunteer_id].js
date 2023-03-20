import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getSupabase } from "../../utils/supabase";
import { useRouter } from "next/router";
import { Navbar } from "../../components/Navbar";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import Profile_Individual from "@/components/Project/Profile_Individual";
import { Stack } from "@mui/material";

/*
Individual volunteer page - page acting as profile for the volunteer

Contains information about which projects they are volunteering in, and total hours
*/
export default function Volunteer_Id({ user, userProfile }) {
  const router = useRouter()
  const { volunteer_id } = router.query

  const [volunteer, setVolunteer] = useState([]);
  const [projects, setProjects] = useState();
  const [totalHours, setTotalHours] = useState(0);

  // Variable checking if user is looking at own profile. 
  // Boolean is passed within the Profile_Individual component, allows withdrawal from projects
  const [isUser, setIsUser] = useState(false); 
  const supabase = getSupabase(userProfile.accessToken);

  /**
   * When page loads, fetches data for: Volunter, Projects that the Volunteer applied for, and Hours
   */
  useEffect(() => {
    // Fetch volunteer data
    const fetchVolunteer = async () => {
      const { data } = await supabase
        .from("user")
        .select("*")
        .eq("id", volunteer_id);
      setVolunteer(data[0]);
    };

    // Fetch all projects that the volunteer applied for
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("applicants")
        .select("*")
        .eq("user_id", volunteer_id);
      setProjects(data);
    };

    // Fetches total hours that the volunteer has worked for
    // Uses supabase.rpc which can call a Postgres function (named get_volunteer_hours) from the Supabase database
    // get_volunteer_hours: "SELECT SUM(hours) FROM applicants WHERE user_id = volunteer_id"
    const fetchHours = async () => {
      const { data } = await supabase.rpc('get_volunteer_hours', {volunteer_id});
      setTotalHours(data)
    }

    // Check if the user looking at the profile is the volunteer (ie. looking at own profile)
    if (volunteer_id == userProfile?.id) {
      setIsUser(true); 
    }

    fetchVolunteer();
    fetchProjects();
    fetchHours();
  }, []);

  return (
    <>
      <Head>
        <title>{user.name}</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.png" />
      </Head>
      <Navbar userProfile={userProfile} />
      <main className={styles.main}>
        <Box>
          <h1>Volunteer ID: {volunteer_id}</h1>
          {volunteer != undefined ? (
            <Box>
              <Box className={styles.volunteer_id_about}>
                <h2>Name: {volunteer.name}</h2>
                <h4>About: {volunteer.about}</h4>
              </Box>
              <Box className={styles.volunteer_id_events}>
                <h4>I am volunteering at the following events:</h4>
                <Stack spacing={1}>
                  {projects?.length > 0 ? (
                    projects.map((project, item) => (
                      <Profile_Individual
                        key={item}
                        project_id={project.project_id}
                        userProfile={userProfile}
                        hours={project.hours}
                        canDelete={isUser}
                      />
                    ))
                  ) : (
                    <h4>None</h4>
                  )}
                </Stack>
                <h4>Total Hours: {totalHours}</h4>
              </Box>
            </Box>
          ) : (
            <h3>No volunteer for this ID was found...</h3>
          )}
        </Box>
      </main>
    </>
  );
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps({ req, res }) {
    const {
      user: { accessToken, sub },
    } = await getSession(req, res);

    const supabase = getSupabase(accessToken);
    let userProfile = null;

    const { data: projects } = await supabase.from("project").select("*");

    try {
      // if no user has user_id of sub, create new user
      const { data } = await supabase
        .from("user")
        .upsert({ user_id: sub }, { onConflict: "user_id" })
        .select();

      userProfile = data[0];
    } catch (e) {
      console.error(e.message);
    }

    return {
      props: { projects, userProfile },
    };
  },
});
