import { useContext, useEffect, useState } from "react";
import { dataContext } from "../../Store/userData";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../firebase";
import Button from "../../UI/Button/Button";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import "./notificationContainer.scss";
import DeleteIcon from "@mui/icons-material/Delete";

const NotificationContainer = () => {
  const dataCtx = useContext(dataContext);

  // this state is initialized for stroing the user info of all the users which requested to want to be friend
  const [requestedUsers, setRequestedUsers] = useState([]);

  // this state is initialized for storing the user info of all the users which the current user has sent request to be friend
  const [sentUsers, setSentUsers] = useState([]);

  const requestedUserInfo = async () => {
    let data = [];
    if (dataCtx.data.receivedArray.length >= 1) {
      const q = query(
        collection(db, "user_info"),
        where("id", "in", dataCtx.data.receivedArray)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
    }
    setRequestedUsers(data);
  };

  const sentUserInfo = async () => {
    let data = [];
    if (dataCtx.data.sentArray.length >= 1) {
      const q = query(
        collection(db, "user_info"),
        where("id", "in", dataCtx.data.sentArray)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
    }
    setSentUsers(data);
  };

  const acceptRequest = async (user) => {
    await updateDoc(doc(db, "friends", user.id), {
      friendsList: arrayUnion(dataCtx.data.userID),
    });
    await updateDoc(doc(db, "friends", dataCtx.data.userID), {
      friendsList: arrayUnion(user.id),
    });
    await updateDoc(doc(db, "requests", dataCtx.data.userID), {
      received: arrayRemove(user.id),
    });
    await updateDoc(doc(db, "requests", user.id), {
      sent: arrayRemove(dataCtx.data.userID),
    });
    await updateDoc(doc(db, "requests", user.id), {
      message: arrayUnion(
        `${dataCtx.data.userData.userName} has accepted your request`
      ),
    });
  };

  const rejectRequest = async (user) => {
    await updateDoc(doc(db, "requests", dataCtx.data.userID), {
      received: arrayRemove(user.id),
    });
    await updateDoc(doc(db, "requests", user.id), {
      sent: arrayRemove(dataCtx.data.userID),
    });
    await updateDoc(doc(db, "requests", user.id), {
      message: arrayUnion(
        `${dataCtx.data.userData.userName} has rejected your request`
      ),
    });
  };

  const deleteMessage = async (msg) => {
    await updateDoc(doc(db, "requests", dataCtx.data.userID), {
      message: arrayRemove(msg),
    });
  };

  useEffect(() => {
    requestedUserInfo();
    sentUserInfo();
  }, [dataCtx.data.receivedArray, dataCtx.data.sentArray]);

  return (
    <div className="notif-container">
      {requestedUsers.map((user, index) => (
        <div className="notif" key={index + user.userName}>
          <div className="userInfo">
            <div className="avatar">
              <img src={user.avatar} />
            </div>
            <div className="content">
              <span>{user.userName}</span>
              <span>{user.status}</span>
            </div>
          </div>
          <p>{user.userName} want to be your friend</p>
          <Button
            onClick={() => {
              acceptRequest(user);
            }}
          >
            <DoneIcon></DoneIcon>
          </Button>
          <Button
            onClick={() => {
              rejectRequest(user);
            }}
          >
            <CloseIcon></CloseIcon>
          </Button>
        </div>
      ))}
      {sentUsers.map((user, index) => (
        <div className="notif" key={index + user.userName}>
          <div className="userInfo">
            <div className="avatar">
              <img src={user.avatar} />
            </div>
            <div className="content">
              <span>{user.userName}</span>
              <span>{user.status}</span>
            </div>
          </div>
          <p>Request has been sent to {user.userName}</p>
        </div>
      ))}
      {dataCtx.data.messages.map((msg, index) => (
        <div className="notif" key={index}>
          <p>{msg}</p>
          <Button
            onClick={() => {
              deleteMessage(msg);
            }}
          >
            <DeleteIcon />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
