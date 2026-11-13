import { PERMISSION_KEYS, type PermissionKey } from "./permission-keys.js";

/** Matrix section titles (module access lives inside the matching section). */
export const PERMISSION_GROUPS = [
  "Modules",
  "Auctions",
  "Clients",
  "Bidders",
  "Inventory",
  "Lifting",
  "Service Invoices",
  "Subscriptions",
  "EMD",
  "Reports",
  "Users",
  "Misc",
  "Masters",
  "Roles & Permissions",
  "Accounts App",
  "External Portal",
] as const;

export type PermissionGroup = (typeof PERMISSION_GROUPS)[number];

export type PermissionCatalogEntry = {
  key: PermissionKey;
  label: string;
  description: string;
  group: PermissionGroup;
};

function entry(
  key: PermissionKey,
  label: string,
  description: string,
  group: PermissionGroup,
): PermissionCatalogEntry {
  return { key, label, description, group };
}

export const PERMISSION_CATALOG: readonly PermissionCatalogEntry[] = [
  entry(
    "module.dashboard",
    "Access dashboard",
    "Show overview / dashboard",
    "Modules",
  ),
  entry(
    "module.auctions",
    "Access auctions",
    "Show auctions in navigation",
    "Modules",
  ),
  entry(
    "module.clients",
    "Access clients",
    "Show clients in navigation",
    "Modules",
  ),
  entry(
    "module.bidders",
    "Access bidders",
    "Show bidders in navigation",
    "Modules",
  ),
  entry(
    "module.inventory",
    "Access inventory",
    "Show items / materials / benchmark",
    "Modules",
  ),
  entry("module.lifting", "Access lifting", "Show lifting CRM", "Modules"),
  entry(
    "module.service-invoices",
    "Access service invoices",
    "Show service invoices (admin)",
    "Modules",
  ),
  entry(
    "module.subscriptions",
    "Access subscriptions",
    "Show subscriptions admin",
    "Modules",
  ),
  entry(
    "module.emd",
    "Access EMD",
    "Show EMD transactions / refunds / reports",
    "Modules",
  ),
  entry(
    "module.reports",
    "Access reports",
    "Show reports in navigation",
    "Modules",
  ),
  entry("module.users", "Access users", "Show staff users", "Modules"),
  entry("module.misc", "Access misc", "Show files / SMS / email", "Modules"),
  entry(
    "module.masters",
    "Access masters",
    "Show Settings → Masters",
    "Modules",
  ),
  entry("module.roles", "Access roles", "Show Settings → Roles", "Modules"),
  entry(
    "module.permissions",
    "Access permissions",
    "Show Settings → Permissions",
    "Modules",
  ),
  entry(
    "module.accounts-service-invoices",
    "Access accounts invoices",
    "Accounts app service invoices",
    "Accounts App",
  ),
  entry(
    "module.accounts-subscriptions",
    "Access accounts subscriptions",
    "Accounts app subscription invoices",
    "Accounts App",
  ),
  entry(
    "module.portal-bidder-dashboard",
    "Bidder portal dashboard",
    "External portal bidder overview",
    "External Portal",
  ),
  entry(
    "module.portal-bidder-auctions",
    "Bidder portal auctions",
    "External portal auctions list and detail",
    "External Portal",
  ),
  entry(
    "module.portal-bidder-live",
    "Bidder portal live",
    "External portal live auction monitor",
    "External Portal",
  ),
  entry(
    "module.portal-bidder-emd",
    "Bidder portal EMD",
    "External portal EMD overview, passbook, refunds",
    "External Portal",
  ),
  entry(
    "module.portal-bidder-subscriptions",
    "Bidder portal subscriptions",
    "External portal subscriptions and payments",
    "External Portal",
  ),
  entry(
    "module.portal-client-dashboard",
    "Client portal dashboard",
    "External portal client dashboard",
    "External Portal",
  ),
  entry(
    "module.portal-client-auctions",
    "Client portal auctions",
    "External portal client auctions",
    "External Portal",
  ),
  entry(
    "module.portal-client-reports",
    "Client portal reports",
    "External portal client reports",
    "External Portal",
  ),

  entry(
    "auctions.read",
    "View auctions",
    "List, detail, lots, live auctions view",
    "Auctions",
  ),
  entry("auction.add", "Create auction", "Create a new auction", "Auctions"),
  entry("auction.write", "Edit auction", "Update auction settings", "Auctions"),
  entry("auction.publish", "Publish auction", "Publish an auction", "Auctions"),
  entry(
    "auction.archive",
    "Archive auction",
    "Archive or restore an auction",
    "Auctions",
  ),
  entry(
    "auction.lots.write",
    "Manage lots",
    "Add/edit lots and imports",
    "Auctions",
  ),
  entry(
    "auction.bidder-pool.write",
    "Manage bidder pool",
    "Bidder pool and lot-bidder maps",
    "Auctions",
  ),
  entry(
    "auction.emd-ranges.write",
    "Manage EMD ranges",
    "Auction EMD ranges CRUD",
    "Auctions",
  ),
  entry(
    "auction.documents.write",
    "Manage auction documents",
    "Upload catalogue / TnC / docs",
    "Auctions",
  ),
  entry(
    "auction.approvals.write",
    "Manage lot approvals",
    "Approve/reject lots and related actions",
    "Auctions",
  ),
  entry(
    "auction.live.auctions",
    "Live auctions",
    "View live auctions",
    "Auctions",
  ),
  entry(
    "auction.live.control",
    "Live control",
    "Live control actions beyond live auctions view",
    "Auctions",
  ),

  entry("clients.read", "View clients", "List and view clients", "Clients"),
  entry("client.add", "Create client", "Create a client", "Clients"),
  entry(
    "client.write",
    "Edit client",
    "Update company info, settings, documents",
    "Clients",
  ),
  entry(
    "client.plants.write",
    "Manage plants",
    "Plant and material locations",
    "Clients",
  ),
  entry(
    "client.users.write",
    "Manage client users",
    "Client portal users and password reset",
    "Clients",
  ),
  entry(
    "client.kam.assign",
    "Assign KAM",
    "Assign KAM users to clients",
    "Clients",
  ),

  entry("bidders.read", "View bidders", "List and view bidders", "Bidders"),
  entry("bidder.add", "Create bidder", "Create a bidder", "Bidders"),
  entry(
    "bidder.write",
    "Edit bidder",
    "Update bidder info / status",
    "Bidders",
  ),
  entry(
    "bidder.approve",
    "Approve bidder",
    "Approve or reject registration",
    "Bidders",
  ),
  entry(
    "bidder.documents.write",
    "Manage bidder documents",
    "Upload bidder documents",
    "Bidders",
  ),
  entry(
    "bidder.bank.verify",
    "Verify bank account",
    "Verify or reject bank account",
    "Bidders",
  ),
  entry(
    "bidder.block",
    "Block bidder",
    "Block or unblock vs clients",
    "Bidders",
  ),
  entry(
    "bidder.exempt",
    "Exempt bidder",
    "Exempt or revoke vs clients",
    "Bidders",
  ),
  entry(
    "bidder.users.write",
    "Manage bidder users",
    "Bidder login users and password reset",
    "Bidders",
  ),
  entry(
    "bidder.subscription.write",
    "Assign bidder subscription",
    "Create subscription from bidder detail",
    "Bidders",
  ),

  entry("items.read", "View items", "List items", "Inventory"),
  entry("item.write", "Manage items", "Create and update items", "Inventory"),
  entry("materials.read", "View materials", "List materials", "Inventory"),
  entry(
    "material.write",
    "Manage materials",
    "Create and update materials",
    "Inventory",
  ),
  entry(
    "benchmark.read",
    "View benchmarks",
    "Price benchmarking read",
    "Inventory",
  ),
  entry(
    "benchmark.write",
    "Manage benchmarks",
    "Price benchmarking write",
    "Inventory",
  ),

  entry(
    "lifting.bidders.read",
    "View bidder lifting",
    "Bidder lifting list/detail",
    "Lifting",
  ),
  entry(
    "lifting.bidders.write",
    "Log bidder lifting",
    "Post bidder lifting engagements",
    "Lifting",
  ),
  entry(
    "lifting.clients.read",
    "View client lifting",
    "Client lifting list/detail",
    "Lifting",
  ),
  entry(
    "lifting.clients.write",
    "Log client lifting",
    "Client lifting mutations",
    "Lifting",
  ),

  entry(
    "service-invoices.read",
    "View service invoices",
    "List and view service invoices",
    "Service Invoices",
  ),
  entry(
    "service-invoices.admin-edit",
    "Edit invoices (admin)",
    "Admin-side create/edit/annexure",
    "Service Invoices",
  ),
  entry(
    "service-invoices.accounts-edit",
    "Edit invoices (accounts)",
    "Accounts transitions and payment logs",
    "Service Invoices",
  ),

  entry(
    "subscriptions.read",
    "View subscriptions",
    "List subscriptions and stats",
    "Subscriptions",
  ),
  entry(
    "subscription.add",
    "Create subscription",
    "Assign a subscription",
    "Subscriptions",
  ),
  entry(
    "subscription.write",
    "Edit subscription",
    "Update or cancel subscriptions",
    "Subscriptions",
  ),
  entry(
    "subscriptions.accounts-edit",
    "Edit subscriptions (accounts)",
    "Upload subscription invoice PDFs",
    "Subscriptions",
  ),

  entry(
    "emd.transactions.read",
    "View EMD transactions",
    "Passbook, blocked and winning EMD",
    "EMD",
  ),
  entry(
    "emd.credits.write",
    "Post EMD credits",
    "Single-entry EMD credit",
    "EMD",
  ),
  entry(
    "emd.credits.import",
    "Import bank statement",
    "Bank statement import and staging review",
    "EMD",
  ),
  entry(
    "emd.blocks.release",
    "Release blocked EMD",
    "Release blocks, winning EMD and retry settlement",
    "EMD",
  ),
  entry(
    "emd.refunds.read",
    "View refund requests",
    "Admin/accounts refund queues, bidder passbook and lots",
    "EMD",
  ),
  entry(
    "emd.refunds.review",
    "Review refunds",
    "Review refund requests (approve / reject)",
    "EMD",
  ),
  entry(
    "emd.refunds.verify",
    "Verify refunds (accounts)",
    "Verify refund requests (approve / reject)",
    "EMD",
  ),
  entry(
    "emd.refunds.pay",
    "Pay refunds",
    "Mark refunds paid (payment date, Txn. Ref. No.)",
    "EMD",
  ),
  entry("emd.forfeitures.read", "View forfeitures", "Forfeiture log", "EMD"),
  entry(
    "emd.forfeitures.propose",
    "Propose forfeiture",
    "Propose forfeiting winning EMD",
    "EMD",
  ),
  entry(
    "emd.forfeitures.review",
    "Approve forfeiture (HOD)",
    "Approve or reject forfeiture proposals",
    "EMD",
  ),
  entry(
    "emd.forfeitures.pay",
    "Pay forfeiture to client",
    "Record the transfer to the client",
    "EMD",
  ),
  entry("emd.transfers.read", "View EMD transfers", "Transfer log", "EMD"),
  entry(
    "emd.transfers.propose",
    "Propose EMD transfer",
    "Propose moving withdrawable EMD between bidders",
    "EMD",
  ),
  entry(
    "emd.transfers.review",
    "Approve EMD transfer (HOD)",
    "Approve or reject EMD transfer proposals",
    "EMD",
  ),
  entry(
    "emd.reports.read",
    "View EMD reports",
    "Bidder-wise EMD report and export",
    "EMD",
  ),

  entry(
    "reports.benchmark",
    "Benchmark report",
    "View and export the benchmark report",
    "Reports",
  ),
  entry(
    "reports.market",
    "Market report",
    "Build and export the market report",
    "Reports",
  ),
  entry(
    "reports.sealed-bids",
    "Sealed-bid report",
    "View and export per-lot sealed-bid summaries",
    "Reports",
  ),
  entry(
    "reports.bid-overview",
    "Bid overview report",
    "View and export the bid overview report",
    "Reports",
  ),
  entry(
    "reports.bid-details",
    "Bid details report",
    "View and export the bid details report",
    "Reports",
  ),
  entry(
    "reports.bidder-overview",
    "Bidder overview report",
    "View and export the bidder overview report",
    "Reports",
  ),
  entry(
    "reports.bidder-details",
    "Bidder details report",
    "View and export the bidder details report",
    "Reports",
  ),
  entry(
    "reports.auction-overview",
    "Auction overview report",
    "View and export the auction overview report",
    "Reports",
  ),
  entry(
    "reports.auction-details",
    "Auction details report",
    "View and export the auction details report",
    "Reports",
  ),
  entry(
    "reports.subscription",
    "Subscription report",
    "View and export the subscription report",
    "Reports",
  ),
  entry(
    "reports.revenue",
    "Revenue report",
    "View and export the revenue report",
    "Reports",
  ),
  entry(
    "reports.lifting",
    "Lifting report",
    "View and export the lifting report",
    "Reports",
  ),

  entry("users.read", "View users", "List staff users", "Users"),
  entry("user.add", "Add user", "Create a staff user", "Users"),
  entry("user.write", "Edit user", "Update a staff user", "Users"),
  entry(
    "user.deactivate",
    "Deactivate user",
    "Activate or deactivate a user",
    "Users",
  ),
  entry(
    "user.reset-password",
    "Reset password",
    "Reset a user password",
    "Users",
  ),
  entry("user.assign-role", "Assign role", "Change a user's role", "Users"),

  entry("files.read", "View files", "Browse my files", "Misc"),
  entry("files.write", "Manage files", "Upload or delete files", "Misc"),
  entry("sms.send", "Send SMS", "Send SMS messages", "Misc"),
  entry("email.send", "Send email", "Send email messages", "Misc"),

  entry(
    "masters.lifting-clients-disposition.read",
    "View lifting clients disposition",
    "Read master",
    "Masters",
  ),
  entry(
    "masters.lifting-clients-disposition.write",
    "Manage lifting clients disposition",
    "Write master",
    "Masters",
  ),
  entry(
    "masters.lifting-bidder-disposition.read",
    "View lifting bidder disposition",
    "Read master",
    "Masters",
  ),
  entry(
    "masters.lifting-bidder-disposition.write",
    "Manage lifting bidder disposition",
    "Write master",
    "Masters",
  ),
  entry(
    "masters.bidder-document-types.read",
    "View bidder document types",
    "Read master",
    "Masters",
  ),
  entry(
    "masters.bidder-document-types.write",
    "Manage bidder document types",
    "Write master",
    "Masters",
  ),
  entry(
    "masters.client-document-types.read",
    "View client document types",
    "Read master",
    "Masters",
  ),
  entry(
    "masters.client-document-types.write",
    "Manage client document types",
    "Write master",
    "Masters",
  ),
  entry(
    "masters.auction-document-types.read",
    "View auction document types",
    "Read master",
    "Masters",
  ),
  entry(
    "masters.auction-document-types.write",
    "Manage auction document types",
    "Write master",
    "Masters",
  ),
  entry("masters.uoms.read", "View UOMs", "Read master", "Masters"),
  entry("masters.uoms.write", "Manage UOMs", "Write master", "Masters"),
  entry(
    "masters.subscription-types.read",
    "View subscription types",
    "Read master",
    "Masters",
  ),
  entry(
    "masters.subscription-types.write",
    "Manage subscription types",
    "Write master",
    "Masters",
  ),
  entry(
    "masters.payment-types.read",
    "View payment types",
    "Read master",
    "Masters",
  ),
  entry(
    "masters.payment-types.write",
    "Manage payment types",
    "Write master",
    "Masters",
  ),
  entry(
    "masters.emd-forfeiture-dispositions.read",
    "View EMD forfeiture dispositions",
    "Read master",
    "Masters",
  ),
  entry(
    "masters.emd-forfeiture-dispositions.write",
    "Manage EMD forfeiture dispositions",
    "Write master",
    "Masters",
  ),

  entry("roles.read", "View roles", "List roles", "Roles & Permissions"),
  entry(
    "roles.write",
    "Manage roles",
    "Create and update roles",
    "Roles & Permissions",
  ),
  entry(
    "permissions.write",
    "Edit permissions matrix",
    "Toggle permissions per role",
    "Roles & Permissions",
  ),
];

/** Compile-time guard: catalog must cover every key. */
const _catalogKeys = new Set(PERMISSION_CATALOG.map((p) => p.key));
for (const key of PERMISSION_KEYS) {
  if (!_catalogKeys.has(key)) {
    throw new Error(`PERMISSION_CATALOG missing key: ${key}`);
  }
}

/**
 * Stage actions owned by Accounts or HOD. Admin roles do not get these by
 * default (seed, backfill, new catalog keys); they can only be granted
 * explicitly through the matrix.
 */
export const ADMIN_EXCLUDED_DEFAULT_KEYS: readonly PermissionKey[] = [
  "emd.refunds.verify",
  "emd.refunds.pay",
  "emd.forfeitures.pay",
  "emd.forfeitures.review",
  "emd.transfers.review",
];

/** Roles/permissions governance — always on for `is_admin` roles, cannot be disabled. */
export const ADMIN_GOVERNANCE_KEYS: readonly PermissionKey[] = [
  "module.roles",
  "module.permissions",
  "roles.read",
  "roles.write",
  "permissions.write",
];

/** Default admin grants: every key except the Accounts/HOD stage actions. */
export const ADMIN_DEFAULT_PERMISSION_KEYS: readonly PermissionKey[] =
  PERMISSION_KEYS.filter((k) => !ADMIN_EXCLUDED_DEFAULT_KEYS.includes(k));

/** Used only on fresh seed. Every role, admin included, uses the matrix. */
export const SEED_ROLE_PERMISSION_DEFAULTS: Record<
  string,
  readonly PermissionKey[]
> = {
  account: [
    "module.accounts-service-invoices",
    "module.accounts-subscriptions",
    "emd.transactions.read",
    "emd.refunds.read",
    "emd.refunds.verify",
    "emd.refunds.pay",
    "emd.forfeitures.read",
    "emd.forfeitures.pay",
    "emd.transfers.read",
    "service-invoices.read",
    "service-invoices.accounts-edit",
    "subscriptions.read",
    "subscriptions.accounts-edit",
  ],
  kam: [
    "module.dashboard",
    "module.clients",
    "module.lifting",
    "module.service-invoices",
    "module.emd",
    "module.reports",
    "reports.benchmark",
    "reports.market",
    "reports.sealed-bids",
    "reports.bid-overview",
    "reports.bid-details",
    "reports.bidder-overview",
    "reports.bidder-details",
    "reports.auction-overview",
    "reports.auction-details",
    "reports.subscription",
    "reports.revenue",
    "reports.lifting",
    "clients.read",
    "client.write",
    "client.plants.write",
    "client.kam.assign",
    "lifting.clients.read",
    "lifting.clients.write",
    "lifting.bidders.read",
    "lifting.bidders.write",
    "service-invoices.read",
    "service-invoices.admin-edit",
    "emd.transactions.read",
    "emd.refunds.read",
    "emd.refunds.review",
    "emd.forfeitures.read",
    "emd.forfeitures.propose",
    "emd.transfers.read",
    "emd.transfers.propose",
  ],
  hod: [
    "module.emd",
    "emd.transactions.read",
    "emd.refunds.read",
    "emd.forfeitures.read",
    "emd.forfeitures.review",
    "emd.transfers.read",
    "emd.transfers.review",
    "emd.reports.read",
  ],
  // Portal roles: external app (app.auctionit.ai)
  bidder: [
    "module.portal-bidder-dashboard",
    "module.portal-bidder-auctions",
    "module.portal-bidder-live",
    "module.portal-bidder-emd",
    "module.portal-bidder-subscriptions",
  ],
  client: [
    "module.portal-client-dashboard",
    "module.portal-client-auctions",
    "module.portal-client-reports",
  ],
  client_limited: [
    "module.portal-client-dashboard",
    "module.portal-client-auctions",
    "module.portal-client-reports",
  ],
  admin: ADMIN_DEFAULT_PERMISSION_KEYS,
};
