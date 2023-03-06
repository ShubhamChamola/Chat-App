import "./displayContainer.scss";
import { dataContext } from "../../Store/userData";
import { useContext } from "react";

const DisplayContainer = (props) => {
  const dataCtx = useContext(dataContext);

  return (
    <div className={`display-container ${props.className}`}>
      <h2>{props.heading}</h2>
      {props.arr ? (
        <ul>
          {props.arr.map((data) => (
            <li>
              <div className="avatar">
                {!dataCtx.data.isLoading && (
                  <img src={dataCtx.data.userData.avatar} />
                )}
              </div>
              <div className="content">
                <h4>{data.heading}</h4>
                <span>{data.currentChat}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <span>{props.notFound}</span>
      )}
    </div>
  );
};

export default DisplayContainer;
