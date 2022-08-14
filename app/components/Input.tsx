interface InputInterface extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string
}
export const Input = ({ prefix, className, ...rest }: InputInterface) => (
  <div
    className={`relative flex items-center justify-center text-sm ${
      className || ''
    }`}
  >
    {prefix && (
      <span className="absolute left-2 text-text-primary font-medium text-base">
        {prefix}
      </span>
    )}
    <input
      className={`w-full h-8 p-2 pt-2 ${prefix ? 'pl-6' : ''}`}
      style={{ borderRadius: 'inherit', textAlign: 'inherit' }}
      {...rest}
    />
  </div>
)
