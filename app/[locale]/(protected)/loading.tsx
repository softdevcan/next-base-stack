export default function Loading() {
  const skeletonCards = [
    { id: "skeleton-1" },
    { id: "skeleton-2" },
    { id: "skeleton-3" },
    { id: "skeleton-4" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {skeletonCards.map((card) => (
            <div key={card.id} className="rounded-lg border bg-card p-6 space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
