export default defineEventHandler(async () => {
  const cities = await Company.distinct("location.city", { status: "ACTIVE", "location.city": { $nin: [null, ""] } });
  return { items: (cities as string[]).filter(Boolean).sort() };
});