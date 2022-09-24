import { useBountyBoardVaults } from "../../../hooks/bounty-board/useBountyBoardVaults";

export const BountyBoardVaults = ({ realm }: { realm: string }) => {
  const { data: vaults, isLoading } = useBountyBoardVaults(realm);

  return (
    <>
      {isLoading && <div className="py-2">Loading...</div>}
      {!isLoading && !vaults?.length && (
        <div className="text-slate-800 py-2">No vaults</div>
      )}
      {!!vaults?.length && (
        <div className="py-2">
          {vaults.map((v) => (
            <div
              key={v.address + ""}
              className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 p-2 bg-slate-100 rounded-lg"
            >
              <p>Token</p>
              <p className="text-slate-800 min-w-0 break-words">
                {v.mint + ""}
              </p>
              <p>Balance</p>
              <p className="text-slate-800 min-w-0 break-words">
                {new Number(v.amount).valueOf() / 1000000}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
