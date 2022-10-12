export const _toSentenceCase = (text: string) => {
  const result = text.replace(/(\w)([A-Z])/g, "$1 $2");
  return result[0].toUpperCase() + result.substring(1).toLowerCase();
};
