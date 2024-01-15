export const environment = {
    msal: {
        authority: 'https://login.microsoftonline.com/',
        clientId: '3121d177-8fbd-4b29-bfe3-c792f2f5cfbf',
        tenantId: '64819121-d17e-4216-a81e-fa8528635fb8',
        redirect: '/auth',
    },
    api: {
        uri: 'https://localhost:7183/api/todolist',
        scopes: {
            read: ['api://58a4b5fb-9854-4b5d-964e-6b5e874178f7/TodoList.Read'],
            write: ['api://58a4b5fb-9854-4b5d-964e-6b5e874178f7/TodoList.ReadWrite']
        }
    }
};
