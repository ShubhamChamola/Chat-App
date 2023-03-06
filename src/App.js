import "./app.scss";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Login from "./Pages/LogIn/Login";
import Message from "./Pages/Message/Message";
import Notification from "./Pages/Notification/Notification";
import Settings from "./Pages/Settings/Settings";
import SignUp from "./Pages/Signup/SignUp";
import { useContext } from "react";
import { dataContext } from "./Store/userData";
import { useCallback } from "react";
import LoadingScreen from "./Components/LoadingScreen/LoadingScreen";

function App() {
  // This line of code is responsoble for storing the userContext data which includes userID, made this userContext so that this data field can go global through out  app and i can use it anywhere.
  const dataCtx = useContext(dataContext);

  // This component is responsible for restricting routs for a user according to the login state i.e if userId value is not there inside userContext then we are navigaing our user to login page with the help of Navigate function from react-rout, but if user exist in userContext then we are naviagting our user to the page which is specified inside this  custom component or which is the children.
  const RequireAuth = useCallback(
    ({ children }) => {
      return dataCtx.data.userID ? children : <Navigate to="/login" />;
    },
    [dataCtx.data.userID]
  );

  // this custom component also works in the same manner as the above one, but overHere if a user is logged in then even if he/she try to go to login page or signup page it will navigate the user back to home page
  const RestrictRout = useCallback(
    ({ children }) => {
      return dataCtx.data.userID ? <Navigate to="/" /> : children;
    },
    [dataCtx.data.userID]
  );

  return (
    <>
      {dataCtx.data.isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/">
                <Route
                  path="login"
                  element={
                    <RestrictRout>
                      <Login />
                    </RestrictRout>
                  }
                ></Route>
                <Route
                  path="signup"
                  element={
                    <RestrictRout>
                      <SignUp />
                    </RestrictRout>
                  }
                ></Route>
                <Route
                  index
                  element={
                    <RequireAuth>
                      <Home />
                    </RequireAuth>
                  }
                ></Route>
                <Route
                  path="message"
                  element={
                    <RequireAuth>
                      <Message />
                    </RequireAuth>
                  }
                ></Route>
                <Route
                  path="settings"
                  element={
                    <RequireAuth>
                      <Settings />
                    </RequireAuth>
                  }
                ></Route>
                <Route
                  path="notifications"
                  element={
                    <RequireAuth>
                      <Notification />
                    </RequireAuth>
                  }
                ></Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      )}
    </>
  );
}

export default App;
