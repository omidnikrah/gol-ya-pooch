export const isItemInArray = <T>(
  array: T[],
  key: keyof T,
  value: T[keyof T],
): { exists: boolean; hasLeft: boolean; hasRight: boolean } => {
  const index = array.findIndex((item) => item[key] === value);

  if (index === -1) {
    return { exists: false, hasLeft: false, hasRight: false };
  }

  const hasLeft = index >= 0;
  const hasRight = index < array.length - 1;

  return { exists: true, hasLeft, hasRight };
};
