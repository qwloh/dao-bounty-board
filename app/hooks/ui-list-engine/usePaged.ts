import { debounce } from "lodash";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
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

interface UsePagedState<T> {
  page: Page<T>;
  paged: T[][];
}

export const usePaged = <T>({ sortedData, pageSize }: UsePagedArgs<T>) => {
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

  const [isPaging, setIsPaging] = useState(false);
  const setIsPagingDebounced = debounce((bool) => setIsPaging(bool), 500);

  const [pageState, setPageState] = useState<UsePagedState<T>>({
    page: {
      content: [],
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
    },
    paged: [],
  });

  useEffect(() => {
    console.log("Run: page", sortedData, pageSize);
    if (!sortedData) return;
    if (!pageSize) {
      setPageState((p) => ({ ...p, isPaging: false }));
      return;
    }

    setIsPagingDebounced(true);
    makeNonBlocking(() => _chunk(sortedData, pageSize))
      .then((paged) => {
        // compute pageParams
        const totalItems = sortedData?.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        // setPageState({
        //   content: paged[0], // first chunk
        //   pageParams: {
        //     page: 0,
        //     size: pageSize,
        //     totalItems,
        //     totalPages,
        //     hasNextPage: totalPages > 1,
        //     hasPrevPage: false,
        //     pageCount: 0,
        //   },
        // });
        setPageState((p) => ({
          page: {
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
          },
          paged,
        }));
        setIsPagingDebounced(false);
      })
      .catch((e) => {
        console.error(e);
        setIsPagingDebounced(false);
      });
  }, [sortedData, pageSize]);

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

  const prevPage = () => {
    if (!pageSize) throw new Error("prevPage() called on non-paginated data");
    if (!pageState.page.pageParams.hasPrevPage) return; // do nothing

    setPageState((p) => {
      const newPage = p.page.pageParams.page - 1;
      return {
        ...p,
        page: {
          content: p.paged[newPage],
          pageParams: {
            ...p.page.pageParams,
            page: newPage,
            itemsInPage: p.paged[newPage].length,
            hasPrevPage: newPage > 0,
            hasNextPage: true,
          },
        },
      };
    });
  };

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

  const nextPage = () => {
    if (!pageSize) throw new Error("nextPage() called on non-paginated data");
    if (!pageState.page.pageParams.hasNextPage) return; // do nothing

    setPageState((p) => {
      const newPage = p.page.pageParams.page + 1;
      return {
        ...p,
        page: {
          content: p.paged[newPage],
          pageParams: {
            ...p.page.pageParams,
            page: newPage,
            itemsInPage: p.paged[newPage].length,
            hasPrevPage: true,
            hasNextPage: newPage < p.page.pageParams.totalPages - 1,
          },
        },
      };
    });
  };

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
  const toPage = (num: number) => {
    if (!pageSize) throw new Error("toPage() called on non-paginated data");
    if (num > pageState.page.pageParams.totalPages - 1)
      throw new Error(
        `Attempt to go to page ${num}, but last page is ${
          pageState.page.pageParams.totalPages - 1
        }`
      ); // do nothing

    setPageState((p) => ({
      ...p,
      page: {
        content: p.paged[num],
        pageParams: {
          ...p.page.pageParams,
          page: num,
          itemsInPage: p.paged[num].length,
          hasPrevPage: num > 0,
          hasNextPage: num < p.page.pageParams.totalPages - 1,
        },
      },
    }));
  };

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

  // for infinite scrolling
  const addPage = () => {
    if (!pageSize) throw new Error("toPage() called on non-paginated data");
    if (!pageState.page.pageParams.hasNextPage) return; // do nothing

    setPageState((p) => {
      const newPage = p.page.pageParams.page + 1;
      const appendedContent = [...p.page.content, ...p.paged[newPage]];
      return {
        ...p,
        page: {
          content: appendedContent,
          pageParams: {
            ...p.page.pageParams,
            page: newPage,
            itemsInPage: appendedContent.length,
            hasPrevPage: newPage > 0,
            hasNextPage: newPage < p.page.pageParams.totalPages - 1,
            pageCount: p.page.pageParams.pageCount + 1,
          },
        },
      };
    });
  };

  return {
    currentPage: pageSize ? pageState.page.content : sortedData, // if pageSize undefined, no pagination, return original data
    isPaging,
    pageParams: pageState.page.pageParams,
    prevPage,
    nextPage,
    toPage,
    addPage,
  };
};
