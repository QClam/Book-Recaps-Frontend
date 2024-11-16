import Show from "../Show";

const Body = ({ children, when, fallback = null }) => {
  return (
    <tbody>
    <Show when={when} fallback={fallback}>
      {children}
    </Show>
    </tbody>
  );
}

export default Body;