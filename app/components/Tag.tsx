export type TagColors = 'blue' | 'purple' | 'yellow' | 'pink'

interface ITag extends React.HTMLAttributes<HTMLDivElement> {
  color: TagColors
  text: string
  editable?: boolean
  disabled?: boolean
}

export const Tag = ({
  color = 'blue',
  text,
  editable,
  disabled,
  className,
  ...rest
}: ITag) => (
  <div
    className={`cursor-pointer select-none bg-tag-bg h-8 py-1 px-4 flex items-center justify-center rounded gap-2 transition-all ${
      disabled ? 'text-tag-text-disabled' : 'text-tag-text'
    } ${className || ''}`}
    {...rest}
  >
    <span
      className={`rounded-full w-2 h-2 ${
        color === 'pink'
          ? 'bg-tag-status-pink'
          : color === 'yellow'
          ? 'bg-tag-status-yellow'
          : color === 'purple'
          ? 'bg-tag-status-purple'
          : 'bg-tag-status-blue'
      }`}
    />
    <span className="text-sm font-medium leading-4">{text || ''}</span>
  </div>
)
