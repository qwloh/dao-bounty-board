import { useRouter as useNextRouter } from 'next/router';

export function useRouter() {
  const router = useNextRouter();
  const ids = router?.query?.["id"] || [];
  const levels = ids?.length;
  const currentRoute = ids[levels - 1];

  return {
    ids: ids as string[],
    levels,
    currentRoute,
    ...router,
  };
}
