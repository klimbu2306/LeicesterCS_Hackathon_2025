export const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
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
