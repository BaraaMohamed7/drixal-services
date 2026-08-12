export default defineEventHandler(async () => {
  const categories = await ServiceCategory.find({ isActive: true }).sort({ name: 1 });

  return { items: categories };
});
