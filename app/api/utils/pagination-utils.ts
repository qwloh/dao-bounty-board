export const getSliceFromAllElements = (
  elements: any[],
  page: number,
  size: number
) => elements.slice(page * size, (page + 1) * size);

export const getNextPageParam = (lastPage, allPages) => {
  const { page, size, totalElements } = lastPage;
  return (page + 1) * size >= totalElements // page + 1 here represents total number of page fetched, as page is 0-indexed
    ? undefined
    : { page: page + 1, size };
};
