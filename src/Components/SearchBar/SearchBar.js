import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InputForm from "../../UI/Input/InputForm";
import "./searchBar.scss";
import { db } from "../../firebase";
import { doc } from "firebase/firestore";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useState, useContext, useEffect } from "react";
import { dataContext } from "../../Store/userData";
import Button from "../../UI/Button/Button";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  // this is the context which contain current user info
  const dataCtx = useContext(dataContext);

  const navigate = useNavigate();

  // this state is used to store the userInput in the search field
  const [userInput, setUserInput] = useState();

  // This state holds all the filtered user according to the userInput
  const [usersFiltered, setUsersFiltered] = useState([]);

  // this effect run the filterUsers function which is responsible for fetching all the user which have a userName exactly matching to the input in search field, this effect run for every change in userInput state, overe here debouncing is used
  useEffect(() => {
    const timeout = setTimeout(filterUsers, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [userInput]);

  // this eventHandler is used to update the userInput state on every keyStroke in search field
  const onChangeHandler = (event) => {
    setUserInput(event.target.value);
  };

  // this function is responsible for fetching all the users from database which have userName matching to the name typed inside search input, over here first all the users are collected then from the requested users we check wether the current user is their or not if its there tehn its not considered, if the length of filtered user is equal to 1 or greater then 1, then we call a dispatch which change the class of the home page and another section is introduced which display all the filtered users.
  const filterUsers = async () => {
    const q = query(
      collection(db, "user_info"),
      where("userName", "==", `${userInput}`)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length >= 1) {
      let users = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().id != dataCtx.data.userData.id) {
          users.push(doc.data());
        }
      });
      if (users.length >= 1) {
        setUsersFiltered([...users]);
        dataCtx.dataDispatch({ type: "changeClass" });
      }
    } else {
      setUsersFiltered([]);
      dataCtx.dataDispatch({ type: "undoChnageClass" });
    }
  };

  const sendRequest = async (id) => {
    const senderRef = doc(db, "requests", dataCtx.data.userID);
    const receiverRef = doc(db, "requests", id);
    await updateDoc(senderRef, {
      sent: arrayUnion(id),
    });
    await updateDoc(receiverRef, {
      received: arrayUnion(dataCtx.data.userID),
    });
  };

  const setChatSession = (user) => {
    dataCtx.dataDispatch({ type: "currentChatSession", userData: user });
    navigate("/message");
  };

  return (
    <div className="search">
      <InputForm
        onChange={onChangeHandler}
        icon={<SearchOutlinedIcon />}
        type="text"
        id="user_name"
        placeholder="Search"
      />
      {usersFiltered.length >= 1 ? (
        <ul className="searched-users">
          {usersFiltered.map((user, index) => {
            return (
              <li key={`${index + user.userName}`}>
                <div className="avatar">
                  <img src={user.avatar} alt="" />
                </div>
                <div className="text">
                  <h4>{user.userName}</h4>
                  <span>{user.status}</span>
                </div>
                {/* if the searched user is already in the friend list of the current user the chat button will be displayed while if the filteres user is not in the friend list then add button will be displayed */}
                {dataCtx.data.friends.filter((frnd) => frnd == user.id)
                  .length >= 1 ? (
                  <Button
                    onClick={() => {
                      setChatSession(user);
                    }}
                  >
                    Chat
                  </Button>
                ) : dataCtx.data.sentArray.includes(user.id) ? (
                  <span>Pending...</span>
                ) : dataCtx.data.receivedArray.includes(user.id) ? (
                  <span>Requested...</span>
                ) : (
                  <Button
                    onClick={() => {
                      sendRequest(user.id);
                    }}
                  >
                    Add +
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default SearchBar;
