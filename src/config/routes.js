// import Accounts from "../screens/admin/Accounts";
// import Contacts from "../screens/admin/Contacts";
// import Leads from "../screens/admin/Leads";
// import Quotes from "../screens/admin/Quotes";
// import SampleRequestList from "../screens/admin/Sample Requests";
// import Users from "../screens/admin/Users";
// import PurchaseOrders from "../screens/admin/PurchaseOrders";
// import DebitNoteGc from "../screens/admin/DebitNoteGc";
// import Mrin from "../screens/admin/Mrin";
// import Gc from "../screens/admin/Gc";
// import VendorPurchaseForm from "../screens/admin/PurchaseOrders/VendorPurchaseForm";
// import Home from "../screens/admin/Users/Home/home";
// import Supplier from "../screens/admin/Supplier";

export const mainRoutes = [
  {
    label: 'Home',
    to: "/home",
  },
  {
    label: 'Leads',
    to: '/leads',
    roles: ["Marketing Executive", "Managing Director"]
  },
  {
    label: 'Accounts',
    to: "/accounts",
    // component: () => <Accounts />,
    roles: ["Marketing Executive", "Managing Director"]
  },
  {
    label: 'Contacts',
    // component: () => <Contacts />,
    to: "/contacts",
    roles: ["Marketing Executive", "Managing Director"]
  },
  {
    label: 'Sample Request',
    to: "/sample-request",
    // component: () => <SampleRequestList />,
    roles: ["Marketing Executive", "Managing Director"]
  },
  // {
  //   label: 'Master Sample Request',
  //   to: "/master-sample-request",
  //   // component: () => <SampleRequestList />,
  //   roles: ["QC Manager", "Managing Director"]
  // },
  // {
  //   label: 'Packing Type',
  //   to: '/packing-type',
  //   // component: () => <Supplier />,
  //   roles: ["QC Manager", "Manager Packaging Development", "Marketing Executive", "Managing Director"]
  // }, 
  {
    label: 'Quote',
    to: '/quotes',
    // component: () => <Quotes />,
    roles: ["GMC", "Manager Commercial", "Commercial Executive", "Managing Director", "Asst.Manager Purchase GC", "Marketing Executive"]
  },
  {
    label: 'Users',
    to: '/users',
    // component: () => <Users />,
    roles: ["Admin", "Managing Director"]
  },
  {
    label: 'Purchase Orders',
    to: '/purchase-orders',
    // component: () => <PurchaseOrders />,
    roles: ["Managing Director", "Manager Purchase GC", "Manager Stores Packing and GC", "Purchase Executive GC", "Asst.Manager Purchase GC", "GC Stores Executive"]
  },
  {
    label: 'Debit Note GC',
    to: '/debit-note-gc',
    // component: () => <DebitNoteGc />,
    roles: ["Managing Director", "Manager Purchase GC", "Accounts Executive", "Accounts Manager"]
  },
  {
    label: 'MRIN',
    to: '/mrin',
    // component: () => <Mrin />,
    roles: ["GC Stores Executive", "Manager Stores Packing and GC", "Sr.Manager", "QC Manager", "Managing Director", "Accounts Executive", "Accounts Manager", "Manager Purchase GC"]
  },
  {
    label: 'GC',
    to: '/gc',
    // component: () => <Gc />,
    roles: ["Managing Director", "GC Stores Executive", "Manager Stores Packing and GC"],
  },
  {
    label: 'Supplier',
    to: '/supplier',
    // component: () => <Supplier />,
    roles: ["Managing Director", "Purchase Manager", "Manager Purchase GC"]
  },
  // {
  //   label: 'Sorting',
  //   component: () => <EnhancedTable />,
  // },    
  // {
  //   label: 'Object',
  //   component: () => <div />
  // },
  // {
  //   label: 'Object User',
  //   component: () => <div />
  // },
];

export const vendorRoutes = [
  {
    label: 'Home',
    to:'/vendor',
    // component: () => <VendorPurchaseForm />
  }
]