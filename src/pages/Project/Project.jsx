import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { FetchState, useGetProjects } from "../../hooks";
import Nav from "../../nav";
import { Server } from "../../utils/config";
import Alert from "../Alert/Alert";

const Project = ({ user, dispatch, project, setProject }) => {
  const [stale, setStale] = useState({ stale: false });
  const [{ projects, isLoading, isError }] = useGetProjects(stale);
  const [currentProject, setCurrentProject] = useState({});
  const [image, setImage] = useState();
  const [audio, setAudio] = useState();

  const navigate = useNavigate();

  const handleAddProject = async (e) => {
    e.preventDefault();

    // console.log(image);

    let response = await api.createMedia(
      Server.imageBucketID,
      image,
      [`role:all`],
      [`user:${user["$id"]}`]
    );

    let imageURL = await api.getMedia(Server.imageBucketID, response.$id);

    const hotspot = JSON.stringify({
      name: "",
      hotspot_id: "",
      position: null,
      latitude: 0,
      longitude: 0,
      overlay: "",
      virtual_object: "",
      isSubHotspot: false,
      panorama_image: "",
      overlay_size: 10,
      overlay_offset_x: 0,
      overlay_offset_y: 0,
      start_audio: "",
      main_pages: [],
      media_pages: [],
    });
    

    const imageP = { ...currentProject, homepage_image: imageURL.href, hotspots: [hotspot] };

    console.log(imageP);

    let response2 = await api.createMedia(
      Server.audioBucketID,
      audio,
      [`role:all`],
      [`user:${user["$id"]}`]
    );

    let audioURL = await api.getMedia(Server.audioBucketID, response2.$id);

    const audioP = { ...imageP, intro_audio: audioURL.href };

    setCurrentProject(audioP);

    console.log("Adding Project");
    const data = audioP;
    // console.log(data, user);
    try {
      let docRespo = await api.createDocument(
        Server.collectionID,
        data,
        [`role:all`],
        [`user:${user["$id"]}`]
      );

      setCurrentProject({ ...currentProject, project_id: docRespo.$id });
      setProject(docRespo.$id);

      api.updateDocument(
        Server.collectionID,
        currentProject,
        [`role:all`],
        [`user:${user["$id"]}`]
      );
      setStale({ stale: true });
      navigate(`/projects`);
    } catch (e) {
      console.log("Error in adding project");
    }
  };

  const createProject = (project) => {
    const newProject = {
      project_name: project,
      user: user["$id"],
    };
    setCurrentProject(newProject);
  };

  const handleLogout = async (e) => {
    dispatch({ type: FetchState.FETCH_INIT });
    try {
      await api.deleteCurrentSession();
      dispatch({ type: FetchState.FETCH_SUCCESS, payload: null });
    } catch (e) {
      dispatch({ type: FetchState.FETCH_FAILURE });
    }
  };

  return (
    <>
      <section className="container h-[80vh] max-h-screen px-3 max-w-2xl mx-auto flex flex-col">
        {isError && <Alert color="red" message="Something went wrong..." />}
        <div className="px-16 my-auto text-center rounded-lg">
          <div className="text-3xl font-bold md:text-5xl lg:text-6xl">
            📝 <br /> &nbsp; Create a New Project
          </div>

          <form onSubmit={handleAddProject}>
            <input
              type="text"
              className="w-full px-6 py-4 my-8 text-xl transition duration-200 ease-in-out transform border-0 rounded-lg shadow-md focus:ring-2 focus:ring-gray-800 hover:-translate-y-1 hover:scale-110 hover:shadow-xl"
              placeholder="Project Name"
              value={currentProject.project_name}
              onChange={(e) => createProject(e.target.value)}
            ></input>
            <div className="grid grid-cols-1 gap-4 mb-5 md:grid-cols-2">
              <div>
                <p className="pb-2 text-sm text-left text-gray-500">
                  Home Page Image
                </p>
                {image ? (
                  <img
                    className="my-6 border rounded-lg shadow-lg"
                    src={URL.createObjectURL(image)}
                  />
                ) : (
                  <></>
                )}
                <input
                  type="file"
                  id="homepage_image"
                  accept="image/*"
                  name="homepage_image"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>

              <div>
                <p className="pb-2 text-sm text-left text-gray-500">
                  Intro Audio
                </p>
                {audio ? (
                  <audio
                    className="my-6 border rounded-full shadow-lg"
                    controls
                  >
                    <source src={URL.createObjectURL(audio)} />
                  </audio>
                ) : (
                  <></>
                )}
                <input
                  type="file"
                  id="intro_audio"
                  accept="audio/*"
                  name="intro_audio"
                  onChange={(e) => setAudio(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>
            </div>

            <input
              type="submit"
              className="px-12 py-3 mx-auto mt-4 font-semibold text-gray-900 bg-white border border-gray-900 rounded-lg shadow-md text-md hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
            />
          </form>

          {isLoading && <h1> Loading .... </h1>}
        </div>
      </section>

      <section className="absolute bottom-0 right-0 px-6 py-3 mb-8 mr-8">
        <button
          onClick={handleLogout}
          className="px-12 py-3 mx-auto mt-4 font-semibold text-gray-900 bg-white border border-gray-900 rounded-lg shadow-md text-md hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
        >
          Logout 👋
        </button>
      </section>
    </>
  );
};

export default Project;
