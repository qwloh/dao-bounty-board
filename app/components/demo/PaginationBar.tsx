export const PaginationBar = ({ pageParams, prevPage, nextPage, toPage }) => {
  const {
    page,
    size,
    hasNextPage,
    hasPrevPage,
    totalItems,
    totalPages,
    itemsInPage,
  } = pageParams;
  return (
    <div className="flex flex-col items-end">
      <div className="flex gap-x-2 items-center">
        <button
          className="p-1 text-blue-400"
          onClick={() => {
            if (hasPrevPage) {
              prevPage();
            }
          }}
        >
          Previous page
        </button>
        <div className="flex gap-x-1 text-slate-800">
          {totalPages === 0
            ? "-"
            : Array(totalPages)
                .fill(null)
                .map((val, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      toPage(i);
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
        </div>
        <button
          className="p-1 text-blue-400"
          onClick={() => {
            if (hasNextPage) {
              nextPage();
            }
          }}
        >
          Next page
        </button>
      </div>
      <div className="px-1 text-xs">
        {`
Showing ${itemsInPage === 0 ? 0 : page * size + 1}-${
          page * size + itemsInPage
        } of ${totalItems} result
`}
      </div>
    </div>
  );
};
