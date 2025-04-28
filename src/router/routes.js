import AppLayout from '@/layout/AppLayout.vue';
import Dashboard from '@/views/Dashboard.vue';
import Login from '@/views/pages/auth/Login.vue';
import homeDash from '@/views/homeDash.vue';
import commission from '@/views/commission.vue';
import commissionNew from '@/views/commissionNew.vue';
import referrals from '@/views/referrals.vue';
import payouts from '@/views/payouts.vue';
import profile from '@/views/profile.vue';
import adminDash from '@/views/adminDash.vue';
import ForgetPassword from '@/views/pages/auth/ForgetPassword.vue';
import PayoutDetails from '@/views/payoutDetails.vue';

const routes = [
    {
        path: '/',
        name: 'login',
        beforeEnter: (to, from, next) => {
            const isAuthenticated = localStorage.getItem('token');
            if (isAuthenticated) {
                next('/dashboard');
            } else {
                next();
            }
        },
        component: Login
    },
    {
        path: '/auth/forgetpassword',
        name: 'forgetPassword',
        component: ForgetPassword
    },
    {
        path: '/dashboard',
        component: AppLayout,
        beforeEnter: (to, from, next) => {
            const isAuthenticated = localStorage.getItem('token');
            if (!isAuthenticated) {
                next('/');
            } else {
                next();
            }
        },
        children: [
            {
                path: '',
                name: 'homeDash',
                component: homeDash
            },
            {
                path: '/referrals',
                name: 'referrals',
                component: referrals
            },
            {
                path: '/payouts',
                name: 'payouts',
                component: payouts
            },
            {
                path: '/profile',
                name: 'Profile',
                component: profile
            },
            {
                path: '/commission',
                name: 'Commission',
                component: commissionNew
            },
            {
                path: '/PayoutDetails/:id',
                name: 'PayoutDetails',
                component: PayoutDetails
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*', // Catch-all route for unmatched paths
        redirect: '/dashboard' // Redirect to the dashboard or any default route
    }
];

export default routes;
