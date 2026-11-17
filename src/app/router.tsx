import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { VehiclesPage } from '../features/vehicles/VehiclesPage';
import { VehicleDetailsPage } from '../features/vehicles/VehicleDetailsPage';
import { VehiclePrintCard } from '../features/vehicles/VehiclePrintCard';
import { SalesPage } from '../features/sales/SalesPage';
import { SaleDeliveryDocument } from '../features/sales/SaleDeliveryDocument';
import { CustomersPage } from '../features/customers/CustomersPage';
import { SuppliersPage } from '../features/suppliers/SuppliersPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { RentalsPage } from '../features/rentals/RentalsPage';
import { RentalContractPrint } from '../features/rentals/RentalContractPrint';
import { TradeInsPage } from '../features/trade-ins/TradeInsPage';
import { TradeInDocumentPrint } from '../features/trade-ins/TradeInDocumentPrint';
import { InstallmentsPage } from '../features/installments/InstallmentsPage';
import { PaymentReceiptPrint } from '../features/installments/PaymentReceiptPrint';
import { ExpensesPage } from '../features/expenses/ExpensesPage';

export const router = createBrowserRouter([
  // الصفحات داخل التخطيط العام (مع القائمة والشريط العلوي)
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'vehicles',
        element: <VehiclesPage />,
      },
      {
        path: 'vehicles/:id',
        element: <VehicleDetailsPage />,
      },
      {
        path: 'sales',
        element: <SalesPage />,
      },
      {
        path: 'rentals',
        element: <RentalsPage />,
      },
      {
        path: 'trade-ins',
        element: <TradeInsPage />,
      },
      {
        path: 'installments',
        element: <InstallmentsPage />,
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'suppliers',
        element: <SuppliersPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  // صفحات الطباعة المستقلة A4 (بدون الشريط الجانبي لتكون نظيفة تماماً)
  {
    path: 'vehicles/:id/print',
    element: <VehiclePrintCard />,
  },
  {
    path: 'sales/:id/delivery-document',
    element: <SaleDeliveryDocument />,
  },
  {
    path: 'rentals/:id/contract',
    element: <RentalContractPrint />,
  },
  {
    path: 'trade-ins/:id/document',
    element: <TradeInDocumentPrint />,
  },
  {
    path: 'installments/:id/receipt',
    element: <PaymentReceiptPrint />,
  },
  // إعادة التوجيه الافتراضية
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

