// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../components/home.vue';
import Register from '../components/register.vue';
import Login from '../components/login.vue';
import UserDashboard from '../components/user.vue';
import DeathCertificatePage from '../components/deathCert.vue';
import LocalGovIdPage from '../components/LocalGovIdPage.vue';
import ClubAssociationRegPage from '../components/ClubAssociationRegPage.vue';
import WasteManagementFeesPage from '../components/WasteManagementFeesPage.vue';
import StreetRegPage from '../components/StreetRegPage.vue';
import BusinessRegPage from '../components/BusinessRegPage.vue';
import ViewApplicationsPage from '../components/ViewApplicationsPage.vue';

import DeathCertificateDetails from '../pagesDetails/DeathCertificateDetails.vue';
import LocalGovIdDetails from '../pagesDetails/LocalGovIdDetails.vue';
import ClubAssociationRegDetails from '../pagesDetails/ClubAssociationRegDetails.vue';
import WasteManagementFeesDetails from '../pagesDetails/WasteManagementFeesDetails.vue';
import StreetRegDetails from '../pagesDetails/StreetRegDetails.vue';
import BusinessRegDetails from '../pagesDetails/BusinessRegDetails.vue';


import AdminRegisterPage from '../components/adminRegister.vue';
import AdminLoginPage from '../components/adminLogin.vue';
import otherAdminLogin from '../components/otherAdminLogin.vue';
import AdminDashboard from '../components/admin.vue';
import AdminServicePrices from '../components/AdminServicePrices.vue';
import ClusterAdminDashboard from '../components/ClusterAdminDashboard.vue';
import BursuryAdminDashboard from '../components/BursuryAdminDashboard.vue'


import AdminUserManagementPage from '../components/AdminManagement.vue';


import DeathCertificates from '../views/DeathCertificates.vue';
import LocalGovernmentIDs from '../views/LocalGovernmentIDs.vue';
import ClubAssociationApplications from '../views/ClubAssociationApplications.vue';
import WasteManagementFeesPayments from '../views/WasteManagementFeesPayments.vue';
import StreetRegistrations from '../views/StreetRegistrations.vue';
import BusinessRegistrations from '../views/BusinessRegistrations.vue';

import PaymentPage from '../components/PaymentPage.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
        path: '/user',
        name: 'UserDashboard',
        component: UserDashboard 
      },
      { path: '/death-certificate', 
        name: 'death-certificate', 
        component: DeathCertificatePage 
      },
      { path: '/local-government-id', 
        name: 'local-government-id', 
        component: LocalGovIdPage 
      },
      { path: '/club-association-registration', 
        name: 'club-association-registration', 
        component: ClubAssociationRegPage 
      },
      { path: '/waste-management-fees', 
        name: 'waste-management-fees', 
        component: WasteManagementFeesPage 
      },
      { path: '/business-registration', 
        name: 'business-registration', 
        component: BusinessRegPage 
      },
      { path: '/street-registration', 
        name: 'street-registration', 
        component: StreetRegPage 
      },
      { path: '/view-applications', 
        name: 'view-applications', 
        component: ViewApplicationsPage 
      },

      { path: '/application/death-certificate/details/:id', component: DeathCertificateDetails, name: DeathCertificateDetails }, // <-- Updated path to '/details/:id'
      { path: '/application/lga-cert-apply/details/:id', component: LocalGovIdDetails, name: LocalGovIdDetails },        // <-- Updated path to '/details/:id'
      { path: '/application/club-register/details/:id', component: ClubAssociationRegDetails, name: ClubAssociationRegDetails }, // <-- Updated path to '/details/:id'
      { path: '/application/pay-waste-fees/details/:id', component: WasteManagementFeesDetails, name: WasteManagementFeesDetails }, // <-- Updated path to '/details/:id'
      { path: '/application/street-register/details/:id', component: StreetRegDetails , name: StreetRegDetails},      // <-- Updated path to '/details/:id'
      { path: '/application/business-register/details/:id', component: BusinessRegDetails, name: BusinessRegDetails }, 
  


      { path: '/admin/register', name: 'admin-register', component: AdminRegisterPage },
      { path: '/admin/login', name: 'admin-login', component: AdminLoginPage },
      { path: '/adminRole/login', name: 'otherAdminLogin', component: otherAdminLogin},
      { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard },
      { path: '/cluster-admin', name: 'ClusterAdminDashboard', component: ClusterAdminDashboard},
      { path: '/bursury-admin', name: 'BursuryAdminDashboard', component: BursuryAdminDashboard},

      { path: '/admin/user-management', name: 'AdminUserManagement', component: AdminUserManagementPage },


      { path: '/admin/applications/death-certificates', component: DeathCertificates, name: DeathCertificates },
      { path: '/admin/applications/local-gov-ids', component: LocalGovernmentIDs, name: LocalGovernmentIDs },
      { path: '/admin/applications/club-associations', component: ClubAssociationApplications, name: ClubAssociationApplications },
      { path: '/admin/applications/waste-management-fees-payments', component: WasteManagementFeesPayments, name: WasteManagementFeesPayments },
      { path: '/admin/applications/street-registrations', component: StreetRegistrations, name: StreetRegistrations },
      { path: '/admin/applications/business-registrations', component: BusinessRegistrations, name: BusinessRegistrations },
      { path: '/service-prices', component: AdminServicePrices, name: AdminServicePrices},


      { path: '/payment/:id', component: PaymentPage, name: 'PaymentPage' },





  ]
})

export default router