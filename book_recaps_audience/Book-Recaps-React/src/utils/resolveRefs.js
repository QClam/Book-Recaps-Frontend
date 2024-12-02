export const resolveRefs = (data) => {
  const refMap = new Map();

  // Step 1: Collect all objects with $id
  const collectIds = (obj) => {
    const stack = [obj];
    while (stack.length > 0) {
      const current = stack.pop();
      if (typeof current !== 'object' || current === null) continue;

      if (current.$id) {
        refMap.set(current.$id, current);
      }

      if (Array.isArray(current)) {
        stack.push(...current);
      } else {
        for (const key in current) {
          if (current.hasOwnProperty(key)) {
            stack.push(current[key]);
          }
        }
      }
    }
  };

  // Step 2: Replace $ref fields without going deeper into resolved references
  const resolveShallowRefs = (obj) => {
    const stack = [obj];
    const resolvedRefs = new Set(); // Track already resolved objects

    while (stack.length > 0) {
      const current = stack.pop();
      if (typeof current !== 'object' || current === null) continue;

      for (const key in current) {
        if (current.hasOwnProperty(key)) {
          const value = current[key];

          if (value && typeof value === 'object') {
            if (value.$ref) {
              const refTarget = refMap.get(value.$ref);

              if (refTarget && !resolvedRefs.has(value.$ref)) {
                // Replace the $ref field with the corresponding $id object
                current[key] = refTarget;

                // Mark this $ref as resolved to prevent infinite loops
                resolvedRefs.add(value.$ref);
              }
            } else {
              // Push child objects/arrays into the stack for processing
              stack.push(value);
            }
          }
        }
      }
    }

    return obj;
  };

  collectIds(data); // Phase 1: Collect all objects with $id
  return resolveShallowRefs(data); // Phase 2: Resolve $ref fields one level deep
};
