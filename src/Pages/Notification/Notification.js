import Navbar from "../../Components/Navbar/Navbar";
import "./notification.scss";
import NotificationContainer from "../../Components/NotificationContainer/NotificationContainer";
import { useEffect } from "react";

const Notification = () => {
  useEffect(() => {
    console.log("notifS");
  }, []);

  return (
    <section className="notification page-container">
      <Navbar />
      <NotificationContainer />
    </section>
  );
};

export default Notification;
