import "./login.scss";
import { Link } from "react-router-dom";
import InputForm from "../../UI/Input/InputForm";
import Button from "../../UI/Button/Button";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useContext, useState, useReducer, useEffect } from "react";
import { dataContext } from "../../Store/userData";
import { useNavigate } from "react-router-dom";

// I made this reducer function so that i can reevaluate this login component whenever their is a change in input elements, wether its clicked, wehter the input filed is validate or not. I did this so that i can validate user input on every key stroke made by the user in the input tag, this function take latest snapshot of the state and action as a parameter, action is returned by the dispacth function which is a part of rducer context, so every time an action is initiated or called with the help of dispatch  function this recuer function is run. Then it use the action returned as a param and with the values defined inside the action it executes some code.
const errorReducer = (state, action) => {
  if (action.type == "emailClicked") {
    return { ...state, emailClicked: true };
  }
  if (action.type == "passwordClicked") {
    return { ...state, passwordClicked: true };
  }
  if (action.type == "emailError") {
    return { ...state, emailError: action.payload };
  }
  if (action.type == "passwordError") {
    return {
      ...state,
      passwordError: action.payload,
    };
  }
  if (action.type == "authError") {
    return {
      ...state,
      authError: action.payload,
    };
  }
  return {
    ...state,
  };
};

const Login = () => {
  const navigate = useNavigate();
  const dataCtx = useContext(dataContext);
  const [formData, setFormData] = useState({});
  const [btnDisabled, setBtnDisabled] = useState(true);

  // Over here i am initializing my reducer context, it take two params one is a reducer function which executes whenever an action is disspatched by the dispatch function and the other param is the initial state for this context, if your initial state is complex you can use a function and return an initial state with this function
  const [error, errorDispatch] = useReducer(errorReducer, {
    emailClicked: false,
    emailErorr: "",
    passwordClicked: false,
    passwordError: "",
    authError: null,
  });

  // this function executes whenever a blur event ocuur to an input, and whenever this function executes it dispatch an action for changing the redcuer state, i did this so that i can look wether an input field is clicked by the user or not and this clicked value can be used to verify the user input.
  const onBlurHandler = (event) => {
    errorDispatch({ type: `${event.target.id}Clicked` });
  };

  // Input validator function is defined for validating the user input, it checkes wether the user input is following the necessary conditions or not. So every time a condition turns true in this if else a disapcth function executes and return an action. I used this function so i can validate the user input on every key stroke.
  const inputValidator = () => {
    // ternary code for email validation
    error.emailClicked && !formData.email
      ? errorDispatch({
          type: "emailError",
          payload: "Enter a valid email",
        })
      : formData.email && !formData.email.includes("@")
      ? errorDispatch({ type: "emailError", payload: "Enter a valid email" })
      : errorDispatch({ type: "emailError", payload: null });

    // ternary code for password validation
    error.passwordClicked && !formData.password
      ? errorDispatch({
          type: "passwordError",
          payload: "Password should be at least 6 characters long",
        })
      : formData.password && formData.password.length < 6
      ? errorDispatch({
          type: "passwordError",
          payload: "Password should be at least 6 characters long",
        })
      : errorDispatch({ type: "passwordError", payload: null });

    // over here btn is disabled whenever any condition turn out to be true
    setBtnDisabled(() => {
      return error.emailError == null &&
        error.passwordError == null &&
        formData.email &&
        formData.password
        ? false
        : true;
    });
  };

  // This effect run whenever their is a change in input field, this function is resposible for running the inputValidator function defined above as well as for disabling and enabling the login btn. this useEffect also has a cleanup function which run before the next render, not it doesnt run at the initial render but after the initial render, cleanup function is executed before another execution og login component, in this effect i first set a timeout of 200ms and this setTimeout is responsible for executing the inputValidater whenever an input filed change is registered but this validating function is executed with a delay so when a user give another key stroke the cleanup function is executed and clear the prev timeout like this the validating funciton is not executed after each and every key stroke it waits for 300ms if no key storke is registered it executes the validating function else it clears the timeout and a new timeout is created, this method if known as deboncing.
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputValidator();
    }, 200);
    return () => {
      clearTimeout(timeout);
    };
  }, [
    formData.email,
    formData.password,
    error.emailClicked,
    error.passwordClicked,
    error.passwordError,
    error.emailError,
  ]);

  // This function is responsible to keep updating the state formData which hold the value of all the input fields, this function is executed whenever their is a change in the value of an input field, i used this function so that i can store the user input in a state which is further used to login the user as well as validate the use input
  const onChangeHandler = (event) => {
    setFormData((prev) => {
      return { ...prev, [event.target.id]: event.target.value };
    });
  };

  // Login hanlder is an async function which is executed when ever a user click on the login btn. This function use various firebase function whoch in the end verify the user input to the auth data stroed in firebase backend and then return a response to the frontend, the response is an object which contain various info one of whcih is related to the user, so i collect the user id from this response and update the user key inside the userContext so i can use the logged in user's ID through out the app and after that i set this uid to the local storage so that whenever the app reloads we still have logged in user data and he/she doesn't need to log in again. after the user has logged in i am using the navigate method form react-rout and routing the user to the home page now he/she can't go to login/ signup page until or unless they logout from the app, if an error occur during all this i am usign the try and catch method so that my app doesn't break. in catch i am again using the dispacth function which has the error code as a payload, this disapcth function feed the error txt to a heading which shows the error to the user.
  const loginHandler = async (event) => {
    event.preventDefault();
    let res;
    try {
      res = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      dataCtx.dataDispatch({ type: "setUserID", id: res.user.uid });
      navigate("/");
    } catch (error) {
      errorDispatch({ type: "authError", payload: error.code });
    }
  };

  return (
    <section className="login">
      <form action="#!">
        <h2>LOGIN</h2>
        <InputForm
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
          icon={<PermIdentityIcon />}
          type="email"
          placeholder="EMAIL"
          id="email"
          error={error.emailError}
        />
        <InputForm
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
          icon={<HttpsOutlinedIcon />}
          type="password"
          placeholder="PASSWORD"
          id="password"
          error={error.passwordError}
        />
        <Button disabled={btnDisabled} onClick={loginHandler}>
          LOGIN
        </Button>
        <Link to="/signup">SIGN UP</Link>
        <h3>{error.authError}</h3>
      </form>
    </section>
  );
};

export default Login;
