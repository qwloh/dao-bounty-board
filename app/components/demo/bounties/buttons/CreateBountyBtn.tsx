import {
  CreateBountyArgs,
  useCreateBounty,
} from "../../../../hooks/bounty/useCreateBounty";
import { MutationStateWrapper } from "../../MutationStateWrapper";

export const CreateBountyBtn = ({
  realm,
  args,
}: {
  realm: string;
  args: CreateBountyArgs;
}) => {
  const {
    enabled,
    instructionToEnable,
    mutate: createBounty,
    isLoading,
    data,
  } = useCreateBounty(realm, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleCreateBounty = () => {
    createBounty(args);
  };

  return (
    <MutationStateWrapper
      enabled={enabled}
      instructionToEnable={instructionToEnable}
      isLoading={isLoading}
      success={status === "success"}
    >
      <button
        className={`border rounded-lg py-1 px-3 ${
          enabled
            ? "border-blue-400 bg-blue-100 text-blue-400"
            : "border-slate-400 bg-slate-100 text-slate-400"
        }
        `}
        onClick={handleCreateBounty}
        disabled={!enabled}
      >
        Create bounty
      </button>
    </MutationStateWrapper>
  );
};
