import { useMutation } from "@tanstack/react-query";
import { restart } from "../../api/dev";
import { useAnchorContext } from "../useAnchorContext";

export const useRestart = () => {
  const { connection } = useAnchorContext();
  return useMutation(() => restart(connection), {
    onSuccess: (data, variables, context) => {
      console.log("Clean up success.");
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
