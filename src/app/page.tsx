import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
          TMDB Movie Explorer
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Search and listing page will be implemented in Step 5.
        </p>
      </main>
    </div>
  );
}
