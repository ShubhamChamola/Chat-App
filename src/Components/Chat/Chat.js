import "./chat.scss";
import { dataContext } from "../../Store/userData";
import { useCallback, useContext, useEffect, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InputForm from "../../UI/Input/InputForm";
import { db } from "../../firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  limit,
  query,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import Button from "../../UI/Button/Button";

let notToRun = true;
const Chat = () => {
  useEffect(() => {
    notToRun = true;
  }, []);

  const dataCtx = useContext(dataContext);

  const [currentFriend, setCurrentFriend] = useState(
    dataCtx.data.currentChatSession
  );

  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    setCurrentFriend(dataCtx.data.currentChatSession);
  }, [dataCtx.data.currentChatSession]);

  const collectRecentMsgs = async (id) => {
    const userQ = query(
      collection(db, "chats", dataCtx.data.userID, "frndChats"),
      where("to", "==", id),
      orderBy("time", "desc"),
      limit(1)
    );
    onSnapshot(userQ, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().time && !notToRun) {
          setMsgs((prev) => {
            return [...prev, doc.data()];
          });
        }
      });
    });
    const frndQ = query(
      collection(db, "chats", id, "frndChats"),
      where("to", "==", dataCtx.data.userID),
      orderBy("time", "desc"),
      limit(1)
    );
    onSnapshot(frndQ, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().time && !notToRun) {
          setMsgs((prev) => {
            return [...prev, doc.data()];
          });
        }
      });
    });
  };

  useEffect(() => {
    if (currentFriend) {
      let id = currentFriend.id;
      fetchMessages(id);
      collectRecentMsgs(currentFriend.id);
    }
  }, [currentFriend]);

  const onSubmitHandler = async (e) => {
    if (e.key == "Enter" && e.target.value != "") {
      await addDoc(collection(db, "chats", dataCtx.data.userID, "frndChats"), {
        text: e.target.value,
        time: serverTimestamp(),
        to: currentFriend.id,
      });
      e.target.value = null;
    }
  };

  const fetchMessages = async (id) => {
    let res1 = [];
    let res2 = [];
    const userQ = query(
      collection(db, "chats", dataCtx.data.userID, "frndChats"),
      where("to", "==", id),
      orderBy("time", "desc")
    );
    const userQuerySnapshot = await getDocs(userQ);
    userQuerySnapshot.forEach((doc) => {
      if (doc.data()) {
        res1.push(doc.data());
      }
    });
    const frndQ = query(
      collection(db, "chats", id, "frndChats"),
      where("to", "==", dataCtx.data.userID),
      orderBy("time", "desc")
    );
    const frndQuerySnapshot = await getDocs(frndQ);
    frndQuerySnapshot.forEach((doc) => {
      if (doc.data()) {
        res2.push(doc.data());
      }
    });

    setMsgs(() => {
      let total = [...res1, ...res2];
      total.sort((a, b) => (a.time > b.time ? 1 : b.time > a.time ? -1 : 0));
      notToRun = false;
      return [...total];
    });
  };

  const DisplayMsgs = useCallback(() => {
    return msgs.map((msg, index) => {
      let time = msg.time.toDate();

      return (
        <div
          className={`${
            msg.to == currentFriend.id ? "msgSent" : "msgReceived"
          }`}
          key={index}
        >
          <p>
            {msg.text}
            <span></span>
          </p>
          <span className="time">{`${
            time.getDay() == new Date().getDay() ? "Today" : time.getDay()
          }, ${
            time.getHours() >= 12
              ? `${
                  time.getHours() % 12 == 0 ? 1 : time.getHours() % 12
                }:${time.getMinutes()}pm`
              : `${time.getHours()}:${time.getMinutes()}am`
          }`}</span>
        </div>
      );
    });
  }, [msgs]);

  return (
    <section className="chat">
      {currentFriend ? (
        <>
          <div className="userInfo">
            <div className="avatar">
              <img src={currentFriend.avatar} alt="" />
            </div>
            <div className="userDetails">
              <h3>{currentFriend.userName}</h3>
              <span>{currentFriend.status}</span>
            </div>
            <MoreVertIcon />
          </div>
          <div className="messageContainer">
            <div className="container">
              <Button
                onClick={() => {
                  fetchMessages(currentFriend.id);
                }}
              >
                Load more...
              </Button>
              <DisplayMsgs></DisplayMsgs>
            </div>
          </div>
          <InputForm
            className="inputField"
            type="text"
            onKeyUp={onSubmitHandler}
          />
        </>
      ) : (
        <></>
      )}
    </section>
  );
};

export default Chat;
