import { useEffect, useState } from "react";
import { _chunk } from "../../utils/data-transform";
import { makeNonBlocking } from "../../utils/promisify";

export type Page<T> = {
  content: T[];
  pageParams: {
    page: number; // current page num, zero-indexed
    size: number;
    itemsInPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    pageCount: number; // for infinite scrolling
  };
};

interface UsePagedArgs<T> {
  sortedData: T[];
  pageSize?: number; // no pagination if undefined
}

export const usePaged = <T>({ sortedData, pageSize }: UsePagedArgs<T>) => {
  // splitting states doesn't matter anymore because multiple `setStates` calls in an effect are batched since React 18
  const [isPaging, setIsPaging] = useState(true);
  const [page, setPage] = useState({
    content: undefined,
    pageParams: {
      page: 0,
      size: pageSize,
      itemsInPage: 0,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      pageCount: 0,
    },
  });
  const [paged, setPaged] = useState([]);

  useEffect(() => {
    console.log("Run: page", sortedData?.length, isPaging);
    if (!sortedData) return;

    if (sortedData && !pageSize) {
      setIsPaging(false);
      return;
    }

    setIsPaging(true);
    makeNonBlocking(() => _chunk(sortedData, pageSize))
      .then((paged) => {
        // compute pageParams
        const totalItems = sortedData?.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        setPage({
          content: paged[0], // first chunk, might be undefined
          pageParams: {
            page: 0,
            size: pageSize,
            itemsInPage: paged[0]?.length || 0,
            totalItems,
            totalPages,
            hasNextPage: totalPages > 1,
            hasPrevPage: false,
            pageCount: 0,
          },
        });
        setPaged(paged);
        setIsPaging(false);
      })
      .catch((e) => {
        console.error(e);
        setIsPaging(false);
      });
  }, [sortedData, pageSize]);

  const prevPage = () => {
    if (!pageSize) throw new Error("prevPage() called on non-paginated data");
    if (!page.pageParams.hasPrevPage) return; // do nothing

    setPage((p) => {
      const newPage = p.pageParams.page - 1;
      return {
        content: paged[newPage],
        pageParams: {
          ...p.pageParams,
          page: newPage,
          itemsInPage: paged[newPage].length,
          hasPrevPage: newPage > 0,
          hasNextPage: true,
        },
      };
    });
  };

  const nextPage = () => {
    if (!pageSize) throw new Error("nextPage() called on non-paginated data");
    if (!page.pageParams.hasNextPage) return; // do nothing

    setPage((p) => {
      const newPage = p.pageParams.page + 1;
      return {
        content: paged[newPage],
        pageParams: {
          ...p.pageParams,
          page: newPage,
          itemsInPage: paged[newPage].length,
          hasPrevPage: true,
          hasNextPage: newPage < p.pageParams.totalPages - 1,
        },
      };
    });
  };

  const toPage = (num: number) => {
    if (!pageSize) throw new Error("toPage() called on non-paginated data");
    if (num > page.pageParams.totalPages - 1)
      throw new Error(
        `Attempt to go to page ${num}, but last page is ${
          page.pageParams.totalPages - 1
        }`
      ); // do nothing

    setPage((p) => ({
      content: paged[num],
      pageParams: {
        ...p.pageParams,
        page: num,
        itemsInPage: paged[num].length,
        hasPrevPage: num > 0,
        hasNextPage: num < p.pageParams.totalPages - 1,
      },
    }));
  };

  // for infinite scrolling
  const addPage = () => {
    if (!pageSize) throw new Error("toPage() called on non-paginated data");
    if (!page.pageParams.hasNextPage) return; // do nothing

    setPage((p) => {
      const newPage = p.pageParams.page + 1;
      const appendedContent = [...p.content, ...paged[newPage]];
      return {
        ...p,
        page: {
          content: appendedContent,
          pageParams: {
            ...p.pageParams,
            page: newPage,
            itemsInPage: appendedContent.length,
            hasPrevPage: newPage > 0,
            hasNextPage: newPage < p.pageParams.totalPages - 1,
            pageCount: p.pageParams.pageCount + 1,
          },
        },
      };
    });
  };

  return {
    currentPage: pageSize ? page.content : sortedData, // if pageSize undefined, no pagination, return original data
    isPaging,
    pageParams: page.pageParams,
    prevPage,
    nextPage,
    toPage,
    addPage,
  };
};

// const [page, setPage] = useState<Page<T>>({
//   // initial values
//   content: [],
//   pageParams: {
//     page: 0,
//     size: pageSize,
//     totalItems: 0,
//     totalPages: 0,
//     hasNextPage: false,
//     hasPrevPage: false,
//     pageCount: 0,
//   },
// });

// const [paged, setPaged] = useState({
//   paged: [] as T[][],
//   isPaging: true,
// });

// const paged = useMemo(() => {
//   console.log("Run: page", sortedData, pageSize);

//   if (!sortedData?.length) return [];
//   if (!pageSize) return [];

//   // ready for pagination. Chunk arrays by page size
//   const paged = _chunk(sortedData, pageSize);

//   // compute pageParams
//   const totalItems = sortedData?.length;
//   const totalPages = Math.ceil(totalItems / pageSize);
//   setPage({
//     content: paged[0], // first chunk
//     pageParams: {
//       page: 0,
//       size: pageSize,
//       totalItems,
//       totalPages,
//       hasNextPage: totalPages > 1,
//       hasPrevPage: false,
//       pageCount: 0,
//     },
//   });

//   // memoize chunked array
//   return paged;
// }, [sortedData, pageSize]);

// const prevPage = () => {
//   if (!pageSize) throw new Error("prevPage() called on non-paginated data");
//   if (!page.pageParams.hasPrevPage) return; // do nothing
//   setPage((p) => {
//     const newPage = p.pageParams.page - 1;
//     return {
//       content: paged[newPage],
//       pageParams: {
//         ...p.pageParams,
//         page: newPage,
//         hasPrevPage: newPage > 0,
//         hasNextPage: true,
//       },
//     };
//   });

// const nextPage = () => {
//   if (!pageSize) throw new Error("nextPage() called on non-paginated data");
//   if (!page.pageParams.hasNextPage) return; // do nothing
//   setPage((p) => {
//     const newPage = p.pageParams.page + 1;
//     return {
//       content: paged[newPage],
//       pageParams: {
//         ...p.pageParams,
//         page: newPage,
//         hasPrevPage: true,
//         hasNextPage: newPage < p.pageParams.totalPages - 1,
//       },
//     };
//   });
// };

// const toPage = (num: number) => {
//   if (!pageSize) throw new Error("toPage() called on non-paginated data");
//   if (num > page.pageParams.totalPages - 1)
//     throw new Error(
//       `Attempt to go to page ${num}, but last page is ${
//         page.pageParams.totalPages - 1
//       }`
//     ); // do nothing
//   setPage((p) => ({
//     content: paged[num],
//     pageParams: {
//       ...p.pageParams,
//       page: num,
//       hasPrevPage: num > 0,
//       hasNextPage: num < p.pageParams.totalPages - 1,
//     },
//   }));
// };

// const addPage = () => {
//   if (!pageSize) throw new Error("toPage() called on non-paginated data");
//   if (!page.pageParams.hasNextPage) return; // do nothing
//   setPage((p) => {
//     const newPage = p.pageParams.page + 1;
//     return {
//       content: [...p.content, ...paged[newPage]],
//       pageParams: {
//         ...p.pageParams,
//         page: newPage,
//         hasPrevPage: newPage > 0,
//         hasNextPage: newPage < p.pageParams.totalPages - 1,
//         pageCount: p.pageParams.pageCount + 1,
//       },
//     };
//   });
// };
