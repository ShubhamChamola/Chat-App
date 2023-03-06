const Button = (props) => {
  // This component is based for rendering the button element, it takes all the attributes as props, i made an independent component for the btn so to reduce redundancy in my code now i dont need to write the btn tag in various place, now i just need to call this function and it will render my btn.
  return (
    <button type={props.type} disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </button>
  );
};

export default Button;
