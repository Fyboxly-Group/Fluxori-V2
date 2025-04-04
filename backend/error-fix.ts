// This is a temporary fix for the TypeScript error in server.ts
// Replace line 136 in server.ts with this:
// error: error instanceof Error ? error.message : String(error),

// To apply manually:
// 1. Open src/server.ts
// 2. Find the error handling for the seed endpoint (around line 132-138)
// 3. Replace "error: error.message," with "error: error instanceof Error ? error.message : String(error),"

// The full code block should look like:
/*
try {
  await SeedService.seedAll();
  res.status(200).json({
    success: true,
    message: 'Database seeded successfully',
  });
} catch (error) {
  console.error('Error seeding database:', error);
  res.status(500).json({
    success: false,
    message: 'Error seeding database',
    error: error instanceof Error ? error.message : String(error),
  });
}
*/