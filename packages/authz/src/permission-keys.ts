/** Permission keys referenced in API/page guards. Catalog metadata lives in `catalog.ts` (DB is a bootstrap mirror). */

export const PERMISSION_KEYS = [
  // Modules (nav gates)
  "module.dashboard",
  "module.auctions",
  "module.clients",
  "module.bidders",
  "module.inventory",
  "module.lifting",
  "module.service-invoices",
  "module.subscriptions",
  "module.emd",
  "module.reports",
  "module.users",
  "module.misc",
  "module.masters",
  "module.roles",
  "module.permissions",
  "module.accounts-service-invoices",
  "module.accounts-subscriptions",
  "module.portal-bidder-dashboard",
  "module.portal-bidder-auctions",
  "module.portal-bidder-live",
  "module.portal-bidder-emd",
  "module.portal-bidder-subscriptions",
  "module.portal-client-dashboard",
  "module.portal-client-auctions",
  "module.portal-client-reports",

  // Auctions
  "auctions.read",
  "auction.add",
  "auction.write",
  "auction.publish",
  "auction.archive",
  "auction.lots.write",
  "auction.bidder-pool.write",
  "auction.emd-ranges.write",
  "auction.documents.write",
  "auction.approvals.write",
  "auction.live.auctions",
  "auction.live.control",
  "auction.ra-stages.write",

  // Question templates (RA Stages due-diligence questions)
  "question-templates.read",
  "question-templates.write",

  // Clients
  "clients.read",
  "client.add",
  "client.write",
  "client.plants.write",
  "client.users.write",
  "client.kam.assign",

  // Bidders
  "bidders.read",
  "bidder.add",
  "bidder.write",
  "bidder.approve",
  "bidder.documents.write",
  "bidder.bank.verify",
  "bidder.block",
  "bidder.exempt",
  "bidder.users.write",
  "bidder.subscription.write",

  // Inventory
  "items.read",
  "item.write",
  "materials.read",
  "material.write",
  "benchmark.read",
  "benchmark.write",

  // Lifting
  "lifting.bidders.read",
  "lifting.bidders.write",
  "lifting.clients.read",
  "lifting.clients.write",

  // Service invoices
  "service-invoices.read",
  "service-invoices.admin-edit",
  "service-invoices.accounts-edit",

  // Subscriptions
  "subscriptions.read",
  "subscription.add",
  "subscription.write",
  "subscriptions.accounts-edit",

  // EMD
  "emd.transactions.read",
  "emd.credits.write",
  "emd.credits.import",
  "emd.blocks.release",
  "emd.refunds.read",
  "emd.refunds.review",
  "emd.refunds.verify",
  "emd.refunds.pay",
  "emd.forfeitures.read",
  "emd.forfeitures.propose",
  "emd.forfeitures.review",
  "emd.forfeitures.pay",
  "emd.transfers.read",
  "emd.transfers.propose",
  "emd.transfers.review",
  "emd.reports.read",

  // Reports
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

  // Users
  "users.read",
  "user.add",
  "user.write",
  "user.deactivate",
  "user.reset-password",
  "user.assign-role",

  // Misc
  "files.read",
  "files.write",
  "sms.send",
  "email.send",

  // Masters
  "masters.lifting-clients-disposition.read",
  "masters.lifting-clients-disposition.write",
  "masters.lifting-bidder-disposition.read",
  "masters.lifting-bidder-disposition.write",
  "masters.bidder-document-types.read",
  "masters.bidder-document-types.write",
  "masters.client-document-types.read",
  "masters.client-document-types.write",
  "masters.auction-document-types.read",
  "masters.auction-document-types.write",
  "masters.uoms.read",
  "masters.uoms.write",
  "masters.subscription-types.read",
  "masters.subscription-types.write",
  "masters.payment-types.read",
  "masters.payment-types.write",
  "masters.emd-forfeiture-dispositions.read",
  "masters.emd-forfeiture-dispositions.write",

  // Roles & permissions masters
  "roles.read",
  "roles.write",
  "permissions.write",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export function isPermissionKey(value: string): value is PermissionKey {
  return (PERMISSION_KEYS as readonly string[]).includes(value);
}
