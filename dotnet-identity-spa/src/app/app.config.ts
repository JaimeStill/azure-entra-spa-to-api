import {
    provideHttpClient,
    withInterceptorsFromDi
} from '@angular/common/http';

import {
    provideRouter,
    withDisabledInitialNavigation,
    withEnabledBlockingInitialNavigation
} from '@angular/router';

import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserUtils } from '@azure/msal-browser';
import { routes } from './app.routes';
import { provideMsal } from './identity';
import { TodoService } from './services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
        !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
            ? withEnabledBlockingInitialNavigation()
            : withDisabledInitialNavigation()
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideMsal(),
    TodoService
  ]
};
