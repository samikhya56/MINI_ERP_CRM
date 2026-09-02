import type { Role } from '../types';

export const canCreateChallan = (role?: Role): boolean => {
  if (!role) return false;
  return role === 'Admin' || role === 'Sales';
};

export const canConfirmChallan = (role?: Role): boolean => {
  if (!role) return false;
  return role === 'Admin' || role === 'Sales';
};

export const canModifyInventory = (role?: Role): boolean => {
  if (!role) return false;
  return role === 'Admin' || role === 'Warehouse';
};

export const canModifyCustomer = (role?: Role): boolean => {
  if (!role) return false;
  return role === 'Admin' || role === 'Sales';
};
