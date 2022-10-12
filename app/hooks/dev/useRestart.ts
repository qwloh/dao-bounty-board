import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restart } from "../../api/dev";
import { useAnchorContext } from "../useAnchorContext";

export const useRestart = () => {
  const { connection } = useAnchorContext();
  const queryClient = useQueryClient();

  return useMutation(() => restart(connection), {
    onSuccess: (data, variables, context) => {
      console.log("Clean up success.");
      queryClient.removeQueries({
        predicate: (query) => {
          const firstKey = query.queryKey[0] as string;
          return !firstKey.includes("realm");
        },
      });
      //   if (callbacks?.onSuccess) {
      //     callbacks.onSuccess(data, variables, context);
      //   }
    },
    onError: (err, variables, context) => {
      console.error(err);
      //   if (callbacks?.onError) {
      //     callbacks?.onError(err, variables, context);
      //   }
    },
  });
};
