const InputForm = (props) => {
  // This component is responsible for rendering the input tag it get all its attributes thorugh props, i used this function to reduce redundancy in my code.
  return (
    <div className={`input-container ${props.className}`}>
      <label style={props.style} htmlFor={props.id}>
        {props.children}
      </label>
      <div className="container">
        <input
          type={props.type}
          id={props.id}
          onChange={props.onChange}
          onBlur={props.onBlur}
          placeholder={props.placeholder}
          onKeyUp={props.onKeyUp}
        />
        <div className="icon">{props.icon}</div>
      </div>
      <span>{props.error}</span>
    </div>
  );
};

export default InputForm;
