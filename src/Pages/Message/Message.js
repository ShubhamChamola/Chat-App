import { dataContext } from "../../Store/userData";
import { useContext } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Groups from "../../Components/Groups/Groups";
import Recent from "../../Components/Recent/Recent";
import SearchBar from "../../Components/SearchBar/SearchBar";
import "./message.scss";
import Chat from "../../Components/Chat/Chat";

const Message = () => {
  const dataCtx = useContext(dataContext);

  return (
    <section
      className={` page-container message ${
        dataCtx.data.changeClass ? "change" : ""
      }`}
    >
      <SearchBar />
      <Navbar />
      <Groups />
      <Recent />
      <Chat />
    </section>
  );
};

export default Message;
