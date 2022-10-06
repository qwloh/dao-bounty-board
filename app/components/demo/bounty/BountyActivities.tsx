import { useBountyActivities } from "../../../hooks/bounty/useBountyActivities";
import { BountyActivityType } from "../../../model/bounty-activity.model";
import { _toSentenceCase } from "../../../utils/str-transform";

export const BountyActivities = ({ bountyPK }: { bountyPK: string }) => {
  const { data: bountyActivities, isLoading } = useBountyActivities(bountyPK);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="font-bold">Bounty activities log</div>
      {isLoading && <div>Loading...</div>}
      {!isLoading && !bountyActivities?.length && (
        <div className="text-slate-800">No activity yet</div>
      )}
      {!!bountyActivities?.length &&
        bountyActivities.map((a) => (
          <div
            key={a.pubkey}
            className=" bg-slate-100 rounded-lg p-2 flex flex-col gap-y-2"
          >
            <p className="text-xs">
              {new Date(a.account.timestamp.toNumber() * 1000).toISOString()}
            </p>
            <div className="flex gap-x-4 items-start">
              <div className={`p-1 rounded-md bg-green-100 text-green-400`}>
                {_toSentenceCase(a.account.type)}
              </div>
              <p className="break-words min-w-0">
                {JSON.stringify(a.account.payload)}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
};
