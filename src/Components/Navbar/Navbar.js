import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MessageIcon from "@mui/icons-material/Message";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dataContext } from "../../Store/userData";
import Button from "../../UI/Button/Button";
import { auth } from "../../firebase";

const Navbar = () => {
  const dataCtx = useContext(dataContext);
  const navigate = useNavigate();

  const logoutUser = () => {
    sessionStorage.removeItem("userID");
    dataCtx.dataDispatch({ type: "setUserID", id: null });
    auth.signOut();
  };

  return (
    <aside className="navbar">
      <div className="user-avatar">
        <img
          src={dataCtx.data.userData ? dataCtx.data.userData.avatar : ""}
          alt="user image"
        />
      </div>
      <ul className="icons">
        <li>
          <Link to="/">
            <HomeOutlinedIcon />
          </Link>
        </li>
        <li>
          <Link to="/message">
            <MessageIcon />
          </Link>
        </li>
        <li>
          <Link to="/notifications">
            <NotificationsNoneOutlinedIcon />
          </Link>
        </li>
        <li>
          <SettingsOutlinedIcon />
        </li>
      </ul>
      <div className="log-out">
        <Button onClick={logoutUser}>
          <LogoutIcon />
        </Button>
      </div>
    </aside>
  );
};

export default Navbar;
