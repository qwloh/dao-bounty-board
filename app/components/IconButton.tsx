export const IconButtonClasses = "h-8 flex justify-center items-center bg-slate-100 dark:bg-slate-800 rounded-full ease-in-out duration-300 hover:bg-slate-200 dark:hover:bg-slate-700"
export const IconButton = ({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button className={`${IconButtonClasses} text-xl w-8  ${className || ''}`} {...rest}/>
  )
}