import { useRealms } from "../../../hooks/realm/useRealms";
import { useRealmsWithBountyBoard } from "../../../hooks/realm/useRealmsWithBountyBoard";
import { useRestRealms } from "../../../hooks/realm/useRestRealms";
import { useUserRealms } from "../../../hooks/realm/useUserRealms";
import { useSearch } from "../../../hooks/ui-list-engine/useSearch";

export const Realms = () => {
  const { data: realms } = useRealms();
  const { result, searchTerm, updateSearchTerm, clearSearch } = useSearch(
    realms,
    {
      fieldsToSearch: ["name", "pubkey"], // cannot do dot notation yet
    }
  );

  const { data: userRealms } = useUserRealms();
  // convenient wrappers. Can remove them if not needed
  // const userRealms = useUserRealms();
  const realmsWithBountyBoard = useRealmsWithBountyBoard();
  const restRealms = useRestRealms();

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          onChange={(e) => updateSearchTerm(e.target.value)}
          placeholder="Search realm by name or address"
          className="bg-white border-slate-100 rounded-lg p-2 flex-1"
        />
        <button
          onClick={() => clearSearch()}
          className="p-2 rounded-lg border-gray-50 bg-white w-max"
        >
          Clear search
        </button>
      </div>
      {/* render normal stuff if not on search */}
      {!searchTerm && (
        <>
          <div className="h-96 p-6 bg-white overflow-y-scroll break-words rounded-lg">
            <div className="text-lg font-bold">
              User realms ({userRealms?.length || 0})
            </div>
            {userRealms?.length ? (
              userRealms.map((r) => (
                <div key={r.pubkey.toString()} className="py-2">
                  <p>Name: {r.name}</p>
                  <p>Bounty board: {r.bountyBoard + ""}</p>
                  <p>User in realm? {!!r.userIdentities + ""}</p>
                  <p>Metadata: {JSON.stringify(r.meta) || "-"}</p>
                </div>
              ))
            ) : (
              <div className="text-s font-normal">No data</div>
            )}
          </div>
          <div className="h-96 p-6 bg-white overflow-y-scroll break-words rounded-lg">
            <div className="text-lg font-bold">
              Realms with bounty board ({realmsWithBountyBoard?.length || 0})
            </div>
            {realmsWithBountyBoard?.length ? (
              realmsWithBountyBoard.map((r) => (
                <div key={r.pubkey.toString()} className="py-2">
                  <p>Name: {r.name}</p>
                  <p>Bounty board: {r.bountyBoard + ""}</p>
                  <p>User in realm? {!!r.userIdentities}</p>
                  <p>Metadata: {JSON.stringify(r.meta)}</p>
                </div>
              ))
            ) : (
              <div className="text-s font-normal">No data</div>
            )}
          </div>
          <div className="h-96 p-6 bg-white overflow-y-scroll break-words rounded-lg">
            <div className="text-lg font-bold">
              Rest realms ({restRealms?.length || 0})
            </div>
            {restRealms.map((r) => (
              <div key={r.pubkey.toString()} className="py-2">
                <p>Name: {r.name}</p>
                <p>Bounty board: {r.bountyBoard + ""}</p>
                <p>User in realm? {!!r.userIdentities}</p>
                <p>Metadata: {JSON.stringify(r.meta)}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {/* search result */}
      {searchTerm && (
        <div className="h-96 p-6 bg-white overflow-y-scroll break-words rounded-lg">
          <div className="text-lg font-bold">Search result</div>
          {result?.length ? (
            result.map((r) => (
              <div key={r.pubkey.toString()} className="py-2">
                <p>Name: {r.name}</p>
                <p>Bounty board: {r.bountyBoard + ""}</p>
                <p>User in realm? {!!r.userIdentities}</p>
                <p>Metadata: {JSON.stringify(r.meta)}</p>
              </div>
            ))
          ) : (
            <div className="text-s font-normal">No data</div>
          )}
        </div>
      )}
    </div>
  );
};
