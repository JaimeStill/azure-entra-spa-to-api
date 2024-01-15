import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit
} from '@angular/core';

import {
    Router,
    RouterLink,
    RouterOutlet
} from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MsalModule } from '@azure/msal-angular';
import { ThemeService } from './core';
import { FlexModule } from './flex';
import { IdentityService } from './identity';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        FlexModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatTooltipModule,
        MsalModule,
        RouterLink,
        RouterOutlet
    ],
    templateUrl: 'app.component.html',
    styleUrl: 'app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
    isIframe = false;

    constructor(
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        private router: Router,
        public identity: IdentityService,
        public themer: ThemeService
    ) { }

    ngOnInit(): void {
        this.isIframe = window !== window.parent && !window.opener;
        this.identity.initialize(this.cdr);
    }

    ngOnDestroy(): void {
        this.identity.unsubscribe();
    }

    navigate(uri: string[]) {
        this.ngZone.run(() => this.router.navigate(uri));
    }
}
