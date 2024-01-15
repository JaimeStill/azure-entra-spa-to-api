import {
    MsalGuardConfiguration,
    MsalInterceptorConfiguration,
    ProtectedResourceScopes
} from '@azure/msal-angular';

import {
    BrowserCacheLocation,
    IPublicClientApplication,
    InteractionType,
    LogLevel,
    PublicClientApplication
} from '@azure/msal-browser';

import { environment } from '../../environments/environment';

export class MsalFactory {
    public static MSALInstanceFactory(): IPublicClientApplication {
        return new PublicClientApplication({
            auth: {
                clientId: environment.msal.clientId,
                authority: `${environment.msal.authority}${environment.msal.tenantId}`,
                redirectUri: environment.msal.redirect,
                postLogoutRedirectUri: '/',
                clientCapabilities: ['CP1']
            },
            cache: {
                cacheLocation: BrowserCacheLocation.LocalStorage
            },
            system: {
                allowNativeBroker: false,
                loggerOptions: {
                    loggerCallback: (_, message: string) => console.log(message),
                    logLevel: LogLevel.Info,
                    piiLoggingEnabled: false
                }
            }
        });
    }

    public static MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
        const protectedResourceMap = new Map<string, Array<string | ProtectedResourceScopes>>();
        protectedResourceMap.set(environment.api.uri, [
            {
                httpMethod: 'GET',
                scopes: environment.api.scopes.read
            },
            {
                httpMethod: 'POST',
                scopes: environment.api.scopes.write
            },
            {
                httpMethod: 'PUT',
                scopes: environment.api.scopes.write
            },
            {
                httpMethod: 'DELETE',
                scopes: environment.api.scopes.write
            }
        ]);

        return {
            interactionType: InteractionType.Redirect,
            protectedResourceMap
        };
    }

    public static MSALGuardConfigFactory(): MsalGuardConfiguration {
        return {
            interactionType: InteractionType.Redirect,
            authRequest: {
                scopes: []
            }
        };
    }
}
