import {
  ProposeInitBountyBoardArgs,
  useProposeInitBountyBoard,
} from "../../../hooks/bounty-board/useProposeInitBountyBoard";

export const ProposeInitBountyBoardBtn = ({
  realm,
  args,
}: {
  realm: string;
  args: ProposeInitBountyBoardArgs;
}) => {
  const {
    enabled,
    instructionToEnable,
    mutate: proposeInitBountyBoard,
    isLoading,
    data, // holds proposal url on success
  } = useProposeInitBountyBoard(realm, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handlePropose = () => {
    proposeInitBountyBoard(args);
  };

  return (
    <div className="flex flex-col gap-2 py-4 items-start">
      <button
        className={`border rounded-lg py-1 px-3 ${
          enabled
            ? "border-blue-400 bg-blue-100 text-blue-400"
            : "border-slate-400 bg-slate-100 text-slate-400"
        }
      `}
        onClick={handlePropose}
        disabled={!enabled}
      >
        Propose Init Bounty Board
      </button>
      {/* On disable */}
      {instructionToEnable && (
        <div className="bg-orange-100 rounded-lg text-xs text-orange-400 py-1 px-3">
          {instructionToEnable}
        </div>
      )}
      {/* On sending */}
      {isLoading && "Sending..."}
      {/* On success */}
      {data && (
        <div className="bg-green-100 rounded-lg text-xs text-green-500 py-1 px-3">
          Success.{" "}
          <a href={data} target="_blank" className="text-blue-400">
            Link to proposal
          </a>
        </div>
      )}
    </div>
  );
};
