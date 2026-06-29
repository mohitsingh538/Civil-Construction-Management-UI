import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import CompanySelector from './components/CompanySelector';
import Dashboard from './components/Dashboard';
import SiteOverview from './components/SiteOverview';
import InventoryScreen from './components/InventoryScreen';
import ExpenseScreen from './components/ExpenseScreen';
import AttendanceScreen from './components/AttendanceScreen';
import EmployeeScreen from './components/EmployeeScreen';
import PayrollScreen from './components/PayrollScreen';
import InvoiceScreen from './components/InvoiceScreen';
import DailyReportScreen from './components/DailyReportScreen';
import EquipmentScreen from './components/EquipmentScreen';
import TenderScreen from './components/TenderScreen';
import MaterialShopsScreen from './components/MaterialShopsScreen';

export const router = createBrowserRouter([
  {
    // Root layout provides AnimatePresence-driven transitions for all routes
    Component: Layout,
    children: [
      {
        path: '/',
        Component: LoginScreen,
      },
      {
        path: '/companies',
        Component: CompanySelector,
      },
      {
        path: '/dashboard',
        Component: Dashboard,
      },
      {
        path: '/site',
        Component: SiteOverview,
      },
      {
        path: '/inventory',
        Component: InventoryScreen,
      },
      {
        path: '/expenses',
        Component: ExpenseScreen,
      },
      {
        path: '/attendance',
        Component: AttendanceScreen,
      },
      {
        path: '/employees',
        Component: EmployeeScreen,
      },
      {
        path: '/payroll',
        Component: PayrollScreen,
      },
      {
        path: '/invoices',
        Component: InvoiceScreen,
      },
      {
        path: '/daily-reports',
        Component: DailyReportScreen,
      },
      {
        path: '/equipment',
        Component: EquipmentScreen,
      },
      {
        path: '/tenders',
        Component: TenderScreen,
      },
      {
        path: '/material-shops',
        Component: MaterialShopsScreen,
      },
      {
        path: '/tasks',
        Component: SiteOverview,
      },
    ],
  },
]);
