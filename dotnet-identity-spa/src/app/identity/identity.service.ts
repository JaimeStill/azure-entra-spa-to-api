import {
    ChangeDetectorRef,
    Inject,
    Injectable,
    WritableSignal,
    signal
} from '@angular/core';

import {
    MSAL_GUARD_CONFIG,
    MsalBroadcastService,
    MsalGuardConfiguration,
    MsalService
} from '@azure/msal-angular';

import {
    AccountInfo,
    AuthenticationResult,
    EventMessage,
    EventType,
    InteractionStatus,
    RedirectRequest
} from '@azure/msal-browser';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class IdentityService {
    private subscriptions = new Array<Subscription>();
    private initialized: boolean = false;

    constructor(
        @Inject(MSAL_GUARD_CONFIG)
        private guard: MsalGuardConfiguration,
        private auth: MsalService,
        private broadcast: MsalBroadcastService
    ) { }

    account: WritableSignal<AccountInfo | null> = signal(null);

    initialize(cdr: ChangeDetectorRef): void {
        if (this.initialized)
            this.unsubscribe();

        this.auth.instance.enableAccountStorageEvents();
        this.account.set(this.auth.instance.getActiveAccount());

        this.subscriptions.push(
            this.broadcast
                .inProgress$
                .pipe(
                    filter((status: InteractionStatus) =>
                        status === InteractionStatus.None
                    )
                )
                .subscribe(() => {
                    this.account.set(
                        this.auth.instance.getActiveAccount()
                    );

                    cdr.detectChanges();
                }),
            this.broadcast
                .msalSubject$
                .pipe(
                    filter((msg: EventMessage) =>
                        msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
                    )
                )
                .subscribe((msg: EventMessage) =>
                    localStorage.setItem('tokenExpiration', (msg.payload as any).expiresOn)
                ),
            this.broadcast
                .msalSubject$
                .pipe(
                    filter((msg: EventMessage) =>
                        msg.eventType === EventType.LOGIN_SUCCESS
                    )
                )
                .subscribe((result: EventMessage) => {
                    const payload = result.payload as AuthenticationResult;
                    this.auth.instance.setActiveAccount(payload.account);
                })
        );

        this.initialized = true;
    }

    unsubscribe(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.initialized = false;
    }

    login() {
        this.guard.authRequest
            ? this.auth.loginRedirect({ ...this.guard.authRequest } as RedirectRequest)
            : this.auth.loginRedirect();
    }

    logout() {
        this.auth.logoutRedirect();
    }
}
