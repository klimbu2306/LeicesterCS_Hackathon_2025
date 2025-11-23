export const msalConfig = {
    auth: {
        clientId: "cff6d806-1232-4cc5-b9f3-1dfb954ce95e",
        authority: "https://login.microsoftonline.com/consumers",
        redirectUri: "http://localhost:3000",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ["Calendars.Read"],
};
