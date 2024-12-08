export const splitProps = (props, keys) => {
  const picked = {};
  const omitted = {};
  for (const key in props) {
    if (keys.includes(key)) {
      picked[key] = props[key];
    } else {
      omitted[key] = props[key];
    }
  }
  return [picked, omitted];
}