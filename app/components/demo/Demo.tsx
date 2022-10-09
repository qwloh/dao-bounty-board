import { useState } from "react";
import { useRestart } from "../../hooks/dev/useRestart";
import { Bounties } from "./bounties/Bounties";
import { BountyBoard } from "./bounty-board/BountyBoard";
import { Bounty } from "./bounty/Bounty";
import { Contributors } from "./contributor-record/Contributors";
import { Realms } from "./realms/Realms";

type ActiveTab = "realms" | "realm" | "bounties" | "bounty" | "contributors";

export const Demo = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("realms");
  const { mutate: restart, isLoading: isRestarting } = useRestart();

  return (
    <div>
      <nav className="flex justify-between">
        <div className="flex gap-x-2">
          <button
            className={`py-2 px-3 rounded-lg ${
              activeTab === "realms"
                ? "text-blue-400 bg-blue-100 border border-blue-400"
                : "bg-slate-100"
            }`}
            onClick={() => setActiveTab("realms")}
          >
            Realms
          </button>
          <button
            className={`py-2 px-3 rounded-lg ${
              activeTab === "realm"
                ? "text-blue-400 bg-blue-100 border border-blue-400"
                : "bg-slate-100"
            }`}
            onClick={() => setActiveTab("realm")}
          >
            Bounty Board
          </button>
          <button
            className={`py-2 px-3 rounded-lg ${
              activeTab === "bounties"
                ? "text-blue-400 bg-blue-100 border border-blue-400"
                : "bg-slate-100"
            }`}
            onClick={() => setActiveTab("bounties")}
          >
            Bounties
          </button>
          <button
            className={`py-2 px-3 rounded-lg ${
              activeTab === "bounty"
                ? "text-blue-400 bg-blue-100 border border-blue-400"
                : "bg-slate-100"
            }`}
            onClick={() => setActiveTab("bounty")}
          >
            Bounty
          </button>
          <button
            className={`py-2 px-3 rounded-lg ${
              activeTab === "contributors"
                ? "text-blue-400 bg-blue-100 border border-blue-400"
                : "bg-slate-100"
            }`}
            onClick={() => setActiveTab("contributors")}
          >
            Contributors
          </button>
        </div>
        <button
          className={`py-2 px-3 rounded-lg text-rose-400 bg-rose-100 border border-rose-400`}
          onClick={() => {
            if (!isRestarting) {
              restart();
            }
          }}
        >
          {isRestarting
            ? "Clearing... Do NOT close browser"
            : "Restart (Clear all bounties and bounty board)"}
        </button>
      </nav>
      <div>
        {activeTab === "realms" && <Realms />}
        {activeTab === "realm" && <BountyBoard realm="SelfDAO" />}
        {activeTab === "bounties" && <Bounties realm="SelfDAO" />}
        {activeTab === "bounty" && <Bounty realm="SelfDAO" />}
        {activeTab === "contributors" && <Contributors realm="SelfDAO" />}
      </div>
    </div>
  );
};
