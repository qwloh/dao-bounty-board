import { useMemo, useState } from "react";

interface SearchOptions<T> {
  fieldsToSearch: (keyof T)[]; // room for improvement: allow access to nested fields via dot notation
  caseInsensitive?: boolean;
}

export const useSearch = <T>(
  data: T[],
  { fieldsToSearch, caseInsensitive = true }: SearchOptions<T>
) => {
  const [searchTerm, setSearchTerm] = useState("");

  const result = useMemo(() => {
    if (!data) return [];
    if (!searchTerm) return data; // do nothing

    const searchRegex = caseInsensitive
      ? new RegExp(searchTerm, "i")
      : new RegExp(searchTerm);

    return data.filter((d) =>
      fieldsToSearch.some((key) => searchRegex.test(JSON.stringify(d[key])))
    );
  }, [data, searchTerm]); // searchOptions is not a dependency because we don't expect searchOptions to change

  const updateSearchTerm = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  return {
    result,
    updateSearchTerm,
  };
};
