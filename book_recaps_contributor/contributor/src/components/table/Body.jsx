import Show from "../Show";

const Body = ({ children, when, fallback }) => {
  return (
    <tbody>
    <Show when={when} fallback={fallback}>
      {children}
    </Show>
    </tbody>
  );
}

export default Body;