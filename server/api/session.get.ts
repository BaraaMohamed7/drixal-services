export default defineEventHandler(async () => {
  const session = await getCurrentSession();

  return {
    demo: session.demo,
    user: session.user,
    company: session.company,
    membership: session.membership,
    permissions: session.permissions,
  };
});
