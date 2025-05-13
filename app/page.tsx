import RegexBuilder from "@/components/regex-builder"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Regex Builder</h1>
        <p className="text-muted-foreground mb-8">
          Build, test, and understand regular expressions interactively - no regex knowledge required.
        </p>
        <RegexBuilder />
      </div>
    </main>
  )
}
