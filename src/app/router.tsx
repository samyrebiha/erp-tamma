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
  // إعادة التوجيه الافتراضية
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

