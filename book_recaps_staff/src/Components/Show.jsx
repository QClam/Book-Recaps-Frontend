/**
 * Show component conditionally renders its children or a fallback based on the `when` prop.
 *
 * @param {Object} props - The properties object.
 * @param {boolean} props.when - Condition to determine which content to render.
 * @param {React.ReactNode} props.children - Content to render when `when` is true.
 * @param {React.ReactNode} props.fallback - Content to render when `when` is false.
 *
 * @returns {JSX.Element} The rendered content based on the `when` prop.
 */
const Show = (props) => {
  return <>{props.when ? props.children : props.fallback}</>;
};

export default Show;