import {
    MsalGuard,
    MsalRedirectComponent
} from '@azure/msal-angular';

import {
    HomeRoute,
    TodoEditRoute,
    TodoViewRoute
} from './routes';

import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'todo-edit/:id',
        component: TodoEditRoute,
        canActivate: [MsalGuard]
    },
    {
        path: 'todo-view',
        component: TodoViewRoute,
        canActivate: [MsalGuard]
    },
    { path: 'auth', component: MsalRedirectComponent },
    { path: '', component: HomeRoute },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
