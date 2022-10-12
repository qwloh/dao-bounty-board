interface MutationStateWrapper {
  enabled: boolean;
  instructionToEnable: string;
  isLoading: boolean;
  success: boolean;
}

export const MutationStateWrapper = ({
  enabled,
  instructionToEnable,
  isLoading,
  success,
  children,
}: React.PropsWithChildren<MutationStateWrapper>) => {
  return (
    <div className="flex flex-col gap-2">
      {children}
      {/* On disable */}
      {instructionToEnable && (
        <div className="bg-orange-100 rounded-lg text-xs text-orange-400 py-1 px-3">
          {instructionToEnable}
        </div>
      )}
      {/* On sending */}
      {isLoading && "Sending..."}
      {/* On success */}
      {success && (
        <div className="bg-green-100 rounded-lg text-xs text-green-500 py-1 px-3">
          Success.
        </div>
      )}
    </div>
  );
};
