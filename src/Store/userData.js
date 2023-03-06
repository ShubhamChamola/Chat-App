import React, { createContext, useReducer, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

export const dataContext = createContext({});

// this reducer function handles all the dispatch it get for the context
setPersistence(auth, browserSessionPersistence);

const dataReducer = (prev, action) => {
  if (action.type == "setFriends") {
    return {
      ...prev,
      friends: action.friendsList,
    };
  }
  if (action.type == "undoChnageClass") {
    return { ...prev, changeClass: false };
  }
  if (action.type == "changeClass") {
    return {
      ...prev,
      changeClass: true,
    };
  }
  if (action.type == "setUserData") {
    return {
      ...prev,
      userData: action.userData,
    };
  }
  if (action.type == "setUserID") {
    return {
      ...prev,
      userID: action.id,
    };
  }
  if (action.type == "isLoading") {
    return {
      ...prev,
      isLoading: true,
    };
  }
  if (action.type == "setSentArray") {
    return {
      ...prev,
      sentArray: action.arr,
    };
  }
  if (action.type == "setReceivedArray") {
    return {
      ...prev,
      receivedArray: action.arr,
    };
  }
  if (action.type == "setMessageArray") {
    return {
      ...prev,
      messages: action.arr,
    };
  }
  if (action.type == "notLoading") {
    return {
      ...prev,
      isLoading: false,
    };
  }
  if (action.type == "currentChatSession") {
    return {
      ...prev,
      currentChatSession: action.userData,
    };
  }
};

// This custom function provides the dataContext globally
export const DataContextProvider = (props) => {
  const [initialState, setInitialState] = useState({ isLoading: true });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        dataDispatch({ type: "setUserID", id: uid });
        setInitialState({
          userID: uid,
          isLoading: true,
        });
      } else {
        setInitialState({
          userID: null,
          isLoading: false,
        });
        dataDispatch({ type: "notLoading" });
      }
    });
  }, []);

  const [data, dataDispatch] = useReducer(dataReducer, initialState);

  // this function is responsible to get all the data related to current user when he/she login ir sign up
  const fetchData = async (id) => {
    dataDispatch({ type: "isLoading" });

    onSnapshot(doc(db, "user_info", id), (doc) => {
      if (doc.data()) {
        dataDispatch({ type: "setUserData", userData: doc.data() });
      }
    });

    onSnapshot(doc(db, "friends", id), (doc) => {
      if (doc.data()) {
        const { friendsList } = doc.data();
        dataDispatch({ type: "setFriends", friendsList });
      }
    });

    onSnapshot(doc(db, "requests", id), (doc) => {
      if (doc.data()) {
        dataDispatch({ type: "setSentArray", arr: doc.data().sent });
      }
    });

    onSnapshot(doc(db, "requests", id), (doc) => {
      if (doc.data()) {
        dataDispatch({
          type: "setReceivedArray",
          arr: doc.data().received,
        });
      }
    });

    onSnapshot(doc(db, "requests", id), (doc) => {
      if (doc.data()) {
        dataDispatch({
          type: "setMessageArray",
          arr: doc.data().message,
        });
        dataDispatch({ type: "notLoading" });
      }
    });
  };

  useEffect(() => {
    if (initialState.userID) {
      fetchData(initialState.userID);
    }
  }, [initialState.userID]);

  return (
    <dataContext.Provider value={{ data, dataDispatch, fetchData }}>
      {props.children}
    </dataContext.Provider>
  );
};
