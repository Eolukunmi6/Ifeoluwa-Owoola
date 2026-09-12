/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { RootLayout } from './components/layout/RootLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Home } from './pages/public/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { TutorRegister } from './pages/tutor/TutorRegister';
import { TutorsList } from './pages/public/TutorsList';
import { TutorProfileView } from './pages/public/TutorProfileView';
import { BookTutor } from './pages/booking/BookTutor';
import { PaymentStub } from './pages/booking/PaymentStub';
import { PaymentSuccess } from './pages/booking/PaymentSuccess';
import { ParentDashboard } from './pages/dashboard/ParentDashboard';
import { TutorDashboard } from './pages/dashboard/TutorDashboard';
import { TutorProfileEdit } from './pages/dashboard/tutor/TutorProfileEdit';
import { AdminDashboard } from './pages/dashboard/admin/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tutor/register" element={<TutorRegister />} />
            <Route path="/tutors" element={<TutorsList />} />
            <Route path="/tutors/:id" element={<TutorProfileView />} />

            {/* Protected Parent Routes */}
            <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
              <Route path="/book/:id" element={<BookTutor />} />
              <Route path="/payment-stub/:id" element={<PaymentStub />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/dashboard/parent" element={<ParentDashboard />} />
            </Route>

            {/* Protected Tutor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
              <Route path="/dashboard/tutor" element={<TutorDashboard />} />
              <Route path="/dashboard/tutor/profile" element={<TutorProfileEdit />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
            </Route>

            {/* Fallback for other links mentioned in navbar/footer */}
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
