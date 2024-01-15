import {
    Component,
    Signal,
    computed
} from '@angular/core';

import {
    IdentityService,
    createClaimsTable
} from '../identity';

import { MatTableModule } from '@angular/material/table';
import { FlexModule } from '../flex';

@Component({
    selector: 'home-route',
    standalone: true,
    styleUrl: 'home.route.scss',
    templateUrl: 'home.route.html',
    imports: [
        FlexModule,
        MatTableModule
    ]
})
export class HomeRoute {
    columns: string[] = ['claim', 'value', 'description'];
    loggedIn: Signal<boolean> = computed(() => this.identity.account() !== null);

    claims: Signal<any[]> = computed(() =>
        this.loggedIn()
            ? [...createClaimsTable(<any>this.identity.account()!.idTokenClaims)]
            : []
    );

    constructor(
        public identity: IdentityService
    ) { }
}
