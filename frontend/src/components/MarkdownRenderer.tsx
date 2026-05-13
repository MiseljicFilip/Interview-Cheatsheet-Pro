import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { Components } from "react-markdown"

const components: Components = {
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "")
    const isInline = !match && !String(children).includes("\n")

    if (isInline) {
      return (
        <code
          className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200"
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </code>
      )
    }

    const language = match ? match[1] : "text"
    return (
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          borderRadius: "0.75rem",
          fontSize: "0.8125rem",
          margin: "1rem 0",
        }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    )
  },
}

type Props = {
  children: string
  className?: string
}

export function MarkdownRenderer({ children, className = "" }: Props) {
  return (
    <div
      className={`prose prose-neutral max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:font-semibold prose-code:before:content-none prose-code:after:content-none ${className}`}
    >
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  )
}
