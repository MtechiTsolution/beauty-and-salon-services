export type CouponListFilters = {
  status?: string;
  expiry_from?: string;
  expiry_to?: string;
  branch_id?: string;
  category_id?: string;
  customer_email?: string;
  used_by_customer?: string;
  usage?: 'unused' | 'used' | 'depleted';
  discount_type?: string;
  code?: string;
};
