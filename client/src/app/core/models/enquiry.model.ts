export interface Enquiry {
  _id?: string;
  companyName: string;
  customerName: string;
  officialEmail: string;
  phone: string;
  chemicalName: string;
  casNumber?: string;
  requiredQuantity: string;
  message: string;
  status: 'New' | 'Contacted' | 'Resolved';
  userId?: string;
  createdAt?: string;
}
