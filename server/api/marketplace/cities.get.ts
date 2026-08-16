export default defineEventHandler(async () => {
  const cities = await Company.distinct("location.city", { status: "APPROVED", "location.city": { $nin: [null, ""] } });
  return { items: (cities as string[]).filter(Boolean).sort() };
});