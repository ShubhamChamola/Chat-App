import "./signup.scss";
import img from "../../Images/profile.png";
import { useEffect, useState, useContext, useReducer, useMemo } from "react";
import InputForm from "../../UI/Input/InputForm";
import Button from "../../UI/Button/Button";
import { Link } from "react-router-dom";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { auth, db, storage } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { dataContext } from "../../Store/userData";

const errorReducer = (state, action) => {
  if (action.type == "userNameClicked") {
    return { ...state, userNameClicked: true };
  }
  if (action.type == "emailClicked") {
    return { ...state, emailClicked: true };
  }
  if (action.type == "passwordClicked") {
    return { ...state, passwordClicked: true };
  }
  if (action.type == "userNameError") {
    return { ...state, userNameError: action.payload };
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
    console.log(action);
    return {
      ...state,
      authError: action.payload,
    };
  }
  return {
    ...state,
  };
};

const SignUp = () => {
  // useNavigate is a hook in react-rout which is used to route to another page or to navigate to different page, overhere we are navigating to home page after the sign up
  let navigate = useNavigate();

  // This context is used here so that we can store current userId globaly through out the app
  const dataCtx = useContext(dataContext);

  // formData is a state which hold the user input on every change, it hold:- email, password, userName and profile_img
  const [formData, setFormData] = useState({});

  // This state is initialzed so btn can be disabled and enable according to form input so that user cant upload an empty or incorrect form
  const [btnDisabled, setBtnDisabled] = useState(true);

  // This state var shows the upload progress of profile_img
  const [uploadProgress, setUploadProgress] = useState();

  // This reducerState is used to handle any error caused by user in terms of input, this reducer dispatch various action based on the wrong userinput
  const [error, errorDispatch] = useReducer(errorReducer, {
    emailClicked: false,
    emailErorr: null,
    passwordClicked: false,
    passwordError: null,
    authError: null,
    userNameClicked: false,
    userNameError: null,
  });

  // this event handler check wether the input field is clicked or not
  const onBlurHandler = (event) => {
    errorDispatch({ type: `${event.target.id}Clicked` });
  };

  // This function checks the input inside the inout form and accordingly dispatch actions for error reducer, this function event controll wether the submit button for the form will be enabled or disabled
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

    // ternary code for username validation
    error.userNameClicked && !formData.userName
      ? errorDispatch({
          type: "userNameError",
          payload: "UserName should be at least 6 characters long",
        })
      : formData.userName && formData.userName.length < 6
      ? errorDispatch({
          type: "userNameError",
          payload: "UserName should be at least 6 characters long",
        })
      : errorDispatch({ type: "userNameError", payload: null });

    // over here btn is disabled whenever any condition turn out to be true
    setBtnDisabled(() => {
      return error.emailError == null &&
        error.passwordError == null &&
        error.userNameError == null &&
        formData.email &&
        formData.password &&
        formData.userName
        ? false
        : true;
    });
  };

  // this useEffect run the inputValidator function but here debouncing is used.
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
    formData.userName,
    error.emailClicked,
    error.passwordClicked,
    error.userNameClicked,
    error.passwordError,
    error.emailError,
    error.userNameError,
    uploadProgress,
  ]);

  // this function is responsible for adding the userinput in the formData state
  const onChangeHandler = async (event) => {
    event.target.id == "avatar"
      ? setFormData((prev) => {
          return { ...prev, [event.target.id]: event.target.files[0] };
        })
      : setFormData((prev) => {
          return { ...prev, [event.target.id]: event.target.value };
        });
  };

  // This function is responsible for just uploading userData if a user have not chosse a profile pic for the account then this function will chosse a default img
  const uploadUserData = async (
    id,
    imageURL = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
  ) => {
    await setDoc(doc(db, "user_info", id), {
      userName: formData.userName,
      avatar: imageURL,
      email: formData.email,
      status: "Hi! guys",
      id: id,
    });
    await setDoc(doc(db, "friends", id), {
      friendsList: [],
    });
    await setDoc(doc(db, "requests", id), {
      received: [],
      sent: [],
      message: [],
    });
    await setDoc(doc(db, "chats", id), {});
    await updateDoc(doc(db, "userIDS", "userIDS_doc"), {
      id: arrayUnion(id),
    });
    navigate("/");
  };

  // this function upload userData as well as the profile pic to the firebase
  const uploadUserImgAndData = (id) => {
    const name = new Date().getTime() + formData.avatar.name;
    const imagesRef = ref(storage, "images");
    const imageRef = ref(imagesRef, name);
    const uploadTask = uploadBytesResumable(imageRef, formData.avatar);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setUploadProgress(progress);
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break;
          case "storage/canceled":
            // User canceled the upload
            break;

          // ...

          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          uploadUserData(id, downloadURL);
        });
      }
    );
  };

  // this function executes when a user click on the submit btn,it create an accont for the user according to the data provided by the user, it is responsible for running both userUploadImg as well as userUploadImgAndData according to the condition wether a profile pic for the account is selected or not
  const signUpHandler = async (event) => {
    event.preventDefault();
    let res;
    try {
      res = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      formData.avatar
        ? uploadUserImgAndData(res.user.uid)
        : uploadUserData(res.user.uid);

      dataCtx.dataDispatch({ type: "setUserID", id: res.user.uid });
    } catch (error) {
      console.log(error);
      errorDispatch({
        type: "authError",
        payload: error.code,
      });
    }
  };

  return (
    <section className="sign-up">
      <form onSubmit={signUpHandler} action="#!">
        <h2>SIGN UP</h2>
        {/* now this component is memoized and will only rerender when the avtaar data changes   */}
        {useMemo(() => {
          return (
            <InputForm
              style={{
                backgroundImage: `url("${
                  formData.avatar ? URL.createObjectURL(formData.avatar) : img
                }")`,
              }}
              onChange={onChangeHandler}
              type="file"
              className="avatar"
              id="avatar"
            ></InputForm>
          );
        }, [formData.avatar])}

        <InputForm
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
          icon={<DriveFileRenameOutlineIcon />}
          type="text"
          id="userName"
          error={error.userNameError}
        >
          User Name
        </InputForm>
        <InputForm
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
          icon={<PermIdentityIcon />}
          type="email"
          id="email"
          error={error.emailError}
        >
          Email
        </InputForm>
        <InputForm
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
          icon={<HttpsOutlinedIcon />}
          type="password"
          id="password"
          error={error.passwordError}
        >
          Password
        </InputForm>
        <Button disabled={btnDisabled}>SIGN UP</Button>
        <Link to="/login">LOGIN</Link>
        <h3>{error.authError}</h3>
      </form>
    </section>
  );
};

export default SignUp;
