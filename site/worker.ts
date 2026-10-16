import handler from "vinext/server/fetch-handler";

// All routes run in the account-owned Worker, without a Sites wrapper.
export default handler;
