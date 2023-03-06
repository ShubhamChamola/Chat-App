import Navbar from "../../Components/Navbar/Navbar";
import SearchBar from "../../Components/SearchBar/SearchBar";
import Groups from "../../Components/Groups/Groups";
import Recent from "../../Components/Recent/Recent";
import Friends from "../../Components/Friends/Friends";
import { useContext } from "react";
import { dataContext } from "../../Store/userData";
import React from "react";
import "./home.scss";

const Home = () => {
  const dataCtx = useContext(dataContext);

  return (
    <section
      className={`home page-container ${
        dataCtx.data.changeClass ? "change" : ""
      }`}
    >
      <SearchBar />
      <Groups />
      <Recent />
      <Friends />
      <Navbar />
    </section>
  );
};

export default Home;
