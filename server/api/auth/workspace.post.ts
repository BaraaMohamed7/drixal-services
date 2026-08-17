export default defineEventHandler(() => {
  throw createError({
    statusCode: 410,
    statusMessage: "Workspace switching has been removed. Tenant context is now resolved from the request hostname.",
  });
});
