import { bootstrapApplication } from '@angular/platform-browser';
import { MsalRedirectComponent } from '@azure/msal-angular';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
    .then(appref => appref.bootstrap(MsalRedirectComponent))
    .catch((err) => console.error(err));
