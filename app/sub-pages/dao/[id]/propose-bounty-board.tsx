import { PublicKey } from "@solana/web3.js";
import React, { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DEV_WALLET_2 } from "../../../api/constants";

import { DEFAULT_CONFIG } from "../../../api/utils/test-assist/bounty_board";
import { AddButton } from "../../../components/AddButton";
import { Card } from "../../../components/Card";
import { H2 } from "../../../components/H2";
import { Badge } from "../../../components/Icons/Badge";
import { Close } from "../../../components/Icons/Close";
import { Suitcase } from "../../../components/Icons/Suitcase";
import { Input } from "../../../components/Input";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { Select } from "../../../components/Select";
import { Tag, TagColors } from "../../../components/Tag";
import { useBountyBoard } from "../../../hooks";
import { useRealmInfoBySymbol } from "../../../hooks/useRealmInfoBySymbol";
import { useRouter } from "../../../hooks/useRouter";
import { BountyTier, RoleSetting } from "../../../model/bounty-board.model";

type TagType = {
  color: TagColors;
  text: string;
};

const defaultTags: TagType[] = [
  {
    color: "blue",
    text: "Development",
  },
  {
    color: "purple",
    text: "Marketing",
  },
  {
    color: "yellow",
    text: "Sale",
  },
  {
    color: "pink",
    text: "Design",
  },
];

const assets = ["usdc", "sol", "mngo"];

const compensationStructure = [
  {
    tier: "",
    difficulty: "complex",
    awards: 2000,
    asset: "usdc",
    skillPoints: 50,
    reputation: 50,
    minSkillPoints: 0,
    minReputation: 0,
  },
  {
    tier: "aa",
    difficulty: "moderate",
    awards: 50,
    asset: "usdc",
    skillPoints: 50,
    reputation: 50,
    minSkillPoints: 0,
    minReputation: 0,
  },
  {
    tier: "a",
    difficulty: "easy",
    awards: 50,
    asset: "usdc",
    skillPoints: 50,
    reputation: 50,
    minSkillPoints: 0,
    minReputation: 0,
  },
  {
    tier: "entry",
    difficulty: "first contributor",
    awards: 50,
    asset: "usdc",
    skillPoints: 50,
    reputation: 50,
    minSkillPoints: 0,
    minReputation: 0,
  },
];

const defaultTiers = DEFAULT_CONFIG.tiers as BountyTier[];

const FieldWrapper = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`w-[9.25rem] rounded flex items-center justify-center ${
      className || ""
    }`}
    {...rest}
  />
);

interface ICheckbox extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox = ({ name, label, ...rest }: ICheckbox) => (
  <span className="flex items-center gap-2 text-sm">
    <input type="checkbox" id={name} name={name} {...rest} />
    <label className="text-text-secondary" htmlFor={name}>
      {label}
    </label>
  </span>
);

const labels = [
  "Task Tier",
  "Difficulty",
  "Awards",
  "",
  "",
  "Min. Requirements",
  "",
];

const dummyAddresses = [
  "2uqNsjTDsHWDMUHGPBH2dpGpUb6aUzQd6RuAddhP7PDz",
  "2uqNsjTDsHWDMUHGPBH2dpGpUb6aUzQd6RuAddhP7PDzsd",
  "asda2uqNsjTDsHWDMUHGPBH2dpGpUb6aUzQd6RuAddhP7PDz",
];

const roleLabels = ["Role", "Permission", "", "Members"];

type FormValue = {
  tiers: BountyTier[];
  roles: RoleSetting[];
};

const defaultFormValues = {
  tiers: DEFAULT_CONFIG.tiers,
  roles: DEFAULT_CONFIG.roles,
};

const getDefaultValues = () => {
  const val = {};

  defaultFormValues.tiers.forEach(
    ({
      tierName,
      difficultyLevel,
      minRequiredReputation,
      minRequiredSkillsPt,
      reputationReward,
      skillsPtReward,
      payoutMint,
      payoutReward,
    }) => {
      val[`tier-${tierName}-difficultyLevel`] = difficultyLevel;
      val[`tier-${tierName}-minRequiredReputation`] = minRequiredReputation;
      val[`tier-${tierName}-minRequiredSkillsPt`] = minRequiredSkillsPt;
      val[`tier-${tierName}-reputationReward`] = reputationReward;
      val[`tier-${tierName}-skillsPtReward`] = skillsPtReward;
      // defaultValues[`${tierName}-payoutMint`] = payoutMint
      val[`tier-${tierName}-payoutReward`] = payoutReward;
    }
  );

  return val;
};

const recordExist = (records: any, search: string) =>
  (Object.keys(records) as Array<any>).find((key) => records[key] === search);

export const ProposeBountyBoard = () => {
  const { symbol } = useRouter();
  const { realmInfo } = useRealmInfoBySymbol(symbol);

  const { proposeInitBountyBoard, bountyBoard } = useBountyBoard(
    realmInfo?.realmId
  );

  const [tiers, setTiers] = useState<BountyTier[]>(defaultFormValues.tiers);
  // const [confirming, setConfirming] = useState(false)
  const [confirmedValues, setConfirmedValues] = useState<any>(undefined);
  const confirming = Boolean(confirmedValues);

  const [tags, setTags] = useState<TagType[]>(defaultTags);

  const defaultValues = getDefaultValues();
  const methods = useForm<any>({
    defaultValues: defaultValues,
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    methods.handleSubmit((data) => {
      // console.log("send values", data);
      proposeInitBountyBoard({
        // @ts-ignore
        boardConfig: DEFAULT_CONFIG,
        fundingAmount: 10000000, // 10 USDC
        // make ourselves core contributor so we are authorized to createBounty
        initialContributorsWithRole: [
          {
            roleName: "Core",
            contributorWallet: new PublicKey(DEV_WALLET_2),
          },
        ],
      });
    })();
  }

  // console.log(watch('EntrypayoutReward'))

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // console.log('name,', e.currentTarget.name)
    methods.setValue(e.currentTarget.name, Number(e.currentTarget.value));
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    methods.setValue(e.currentTarget.name, e.currentTarget.checked);
  };

  const confirm = () => {
    methods.handleSubmit((data) => {
      const tierKeys = Object.keys(data).filter(
        (key) => key.split("-")?.[0] === "tier"
      );
      console.log("tierKeys", tierKeys);
      setConfirmedValues(data);
    })();
  };

  const addSkills = () => {};

  const addDifficulty = () => {};

  return (
    <FormProvider
      {...methods}
      //@ts-ignore
      defaultValues={defaultValues}
    >
      <form className="flex flex-col gap-6" onSubmit={submit}>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 px-6 py-8">
            <H2>SKILLS</H2>
            <div className="flex gap-4">
              {tags?.map((t) => (
                <Tag key={t?.text} disabled={confirming} {...t} />
              ))}
            </div>
            {!confirming && (
              <AddButton onClick={addSkills}>Add Skills</AddButton>
            )}
          </div>
        </Card>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 px-6 py-8">
            <H2>COMPENSATION STRUCTURE</H2>
            <div className="overflow-auto pb-6">
              <div className="grid grid-cols-7 gap-2 text-text-primary text-base leading-5 capitalize font-medium">
                {labels.map((l, index) => (
                  <span key={`l-${index}`} className="text-text-secondary">
                    {l}
                  </span>
                ))}
                {tiers.map(
                  ({
                    tierName,
                    difficultyLevel,
                    minRequiredReputation,
                    minRequiredSkillsPt,
                    reputationReward,
                    skillsPtReward,
                    payoutReward,
                    payoutMint,
                  }) => (
                    <React.Fragment key={tierName}>
                      <div className="uppercase flex items-center">
                        {tierName}
                      </div>
                      <div className="flex items-center">{difficultyLevel}</div>
                      <div className="flex items-center">
                        <FieldWrapper className="outline outline-1 outline-white/20">
                          <Input
                            className="w-1/2 text-right rounded-tr-none rounded-br-none"
                            prefix="$"
                            defaultValue={payoutReward}
                            name={`tier-${tierName}-payoutReward`}
                            onChange={onChange}
                            disabled={confirming}
                          />

                          <Select
                            // name={`${tierName}-asset`}
                            className="w-1/2 rounded-tl-none rounded-bl-none"
                            disabled={confirming}
                          >
                            {assets?.map((asset) => (
                              <option key={asset} value={asset}>
                                {asset}
                              </option>
                            ))}
                          </Select>
                        </FieldWrapper>
                      </div>
                      <div className="flex items-center">
                        <FieldWrapper className="gap-1 font-medium">
                          <Input
                            className="w-1/2 text-right rounded outline outline-1 outline-white/20 flex-shrink-0"
                            prefixLogo={<Suitcase />}
                            defaultValue={skillsPtReward}
                            name={`tier-${tierName}-skillsPtReward`}
                            onChange={onChange}
                            disabled={confirming}
                          />

                          {"Skill pts."}
                        </FieldWrapper>
                      </div>
                      <div className="flex items-center">
                        <FieldWrapper className="gap-1 font-medium">
                          <Input
                            className="w-1/2 text-right rounded outline outline-1 outline-white/20 flex-shrink-0"
                            prefixLogo={<Badge />}
                            defaultValue={reputationReward}
                            name={`tier-${tierName}-reputationReward`}
                            onChange={onChange}
                            disabled={confirming}
                          />

                          {"Reputation"}
                        </FieldWrapper>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <FieldWrapper className="gap-1 font-medium">
                            <Input
                              className="w-1/2 text-right rounded outline outline-1 outline-white/20 flex-shrink-0"
                              prefixLogo={<Suitcase />}
                              defaultValue={minRequiredSkillsPt}
                              name={`tier-${tierName}-minRequiredSkillsPt`}
                              disabled={confirming}
                            />

                            {"Skill pts"}
                          </FieldWrapper>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FieldWrapper className="gap-1 font-medium">
                          <Input
                            className={`w-1/2 text-right rounded outline outline-1 outline-white/20 flex-shrink-0`}
                            prefixLogo={<Badge />}
                            defaultValue={minRequiredReputation}
                            name={`tier-${tierName}-minRequiredReputation`}
                            disabled={confirming}
                          />

                          {"Reputation"}
                        </FieldWrapper>
                      </div>
                    </React.Fragment>
                  )
                )}
              </div>
            </div>
            {!confirming && (
              <AddButton onClick={addDifficulty}>Add Difficulty</AddButton>
            )}
          </div>
        </Card>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 px-6 py-8">
            <H2>ROLES AND PERMISSION</H2>
            <div className="overflow-auto pb-6">
              <div className="grid grid-cols-[168px_minmax(160px,_0.5fr)_minmax(160px,_0.5fr)_minmax(200px,_1.5fr)] gap-2 gap-y-6 text-text-primary text-base leading-5 capitalize font-medium">
                {roleLabels.map((l, index) => (
                  <span key={`l-${index}`} className="text-text-secondary">
                    {l}
                  </span>
                ))}
                {defaultFormValues.roles.map(
                  ({ roleName, permissions }, index) => {
                    console.log("permissions", permissions);
                    return (
                      <React.Fragment key={roleName}>
                        <div className="text-base flex font-medium text-tnight-200">
                          {roleName}
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-medium text-tnight-200">
                            Bounty
                          </span>
                          <Checkbox
                            disabled={confirming}
                            name={`role-${roleName}-createBounty`}
                            label="Create Bounty"
                            checked={recordExist(permissions, "createBounty")}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`role-${roleName}-deleteBounty`}
                            label="Delete Bounty"
                            checked={recordExist(permissions, "deleteBounty")}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`role-${roleName}-assignBounty`}
                            label="Assign Bounty"
                            checked={recordExist(permissions, "assignBounty")}
                            onChange={onSelect}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="font-medium text-tnight-200">
                            Submission
                          </span>
                          <Checkbox
                            disabled={confirming}
                            name={`role-${roleName}-acceptSubmission`}
                            label="Accept"
                            checked={recordExist(
                              permissions,
                              "acceptSubmission"
                            )}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`role-${roleName}-rejectSubmission`}
                            label="Reject"
                            checked={recordExist(
                              permissions,
                              "rejectSubmission"
                            )}
                            onChange={onSelect}
                          />
                          <Checkbox
                            disabled={confirming}
                            name={`role-${roleName}-requestChangeToSubmission`}
                            label="Request Changes"
                            checked={recordExist(
                              permissions,
                              "requestChangeToSubmission"
                            )}
                            onChange={onSelect}
                          />
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-2">
                            {dummyAddresses.map((address) => (
                              <div
                                className="text-text-primary max-w-[125px] flex h-8 items-center px-2 text-sm bg-tag-bg"
                                key={address}
                              >
                                <span className=" text-ellipsis overflow-hidden whitespace-nowrap">
                                  {address}
                                </span>
                                <Close className=" text-base text-text-secondary flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                          {roleName === "Core" && !confirming && (
                            <AddButton>Add Core Team Members</AddButton>
                          )}
                          {roleName === "Contributor" && !confirming && (
                            <AddButton>Add Contributors</AddButton>
                          )}
                        </div>

                        {index < defaultFormValues.roles.length - 1 && (
                          <span className="col-span-4 h-px w-full bg-text-secondary" />
                        )}
                      </React.Fragment>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </Card>
        <div className="flex gap-4 items-center justify-center mx-auto">
          {!confirming && (
            <PrimaryButton onClick={() => confirm()}>
              Review Proposal
            </PrimaryButton>
          )}
          {confirming && (
            <>
              <PrimaryButton
                ghost
                onClick={() => setConfirmedValues(undefined)}
              >
                Back
              </PrimaryButton>
              <PrimaryButton type="submit">Submit</PrimaryButton>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
